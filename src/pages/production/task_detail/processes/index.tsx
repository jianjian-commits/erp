import { t } from 'gm-i18n'
import React, { useMemo, FC, ReactNode } from 'react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import { Observer, observer } from 'mobx-react'
import _ from 'lodash'
import {
  Task_Type,
  Task_State,
  OutputType,
  map_TaskProcess_State,
  Bom_Process_Type,
  TaskProcess,
} from 'gm_api/src/production'
import { GraphFlow } from '@gm-common/graph'

import Actions from './actions'
import CellProcessor from './components/cell_processor'
import store from '../store'
import { toJS } from 'mobx'
import { toFixed, getUnitInfo } from '../../util'
import { TaskProcessInfo } from '../interface'
import { cellHeight } from '@/pages/production/enum'
import CellFull from '../../components/table_cell_full'

interface ProcessesProps {
  type: Task_Type
  task_state: number
}

interface GroupTaskProcessInfo {
  key: string
  processes: TaskProcessInfo[]
}

const { TABLE_X } = TableXUtil

const getCellHeight = (v: TaskProcess, combineProcessIndex: number) => {
  const isCombine = v.bom_process_type === Bom_Process_Type.TYPE_COMBINED
  const height = isCombine
    ? ((store.taskProcesses[combineProcessIndex]?.inputs || { inputs: [] })
        .inputs?.length || 1) * cellHeight
    : cellHeight
  return height
}

const Processes: FC<ProcessesProps> = observer(({ type, task_state }) => {
  const { taskProcesses } = store
  const { units, skus, task } = store.taskDetails

  // 按照相同 process_id进行聚合展示
  const processes_data: GroupTaskProcessInfo[] = _.sortBy(
    _.map(_.groupBy(taskProcesses, 'process_id'), (value, key) => ({
      key,
      processes: value,
      isEditing: value[0].isEditing,
    })),
    (p) => Number(p.processes[0].rank),
  )

  /** 生产计划应该查找rank = 100 && bom_process_type = 2才是第一道组合工序
   * 包装计划只需要找bom_process_type = 2
   */
  const combineProcessIndex: number = _.findIndex(taskProcesses, (t) =>
    type !== Task_Type.TYPE_PACK
      ? t?.rank === 100 &&
        t?.bom_process_type === Bom_Process_Type.TYPE_COMBINED
      : t?.bom_process_type === Bom_Process_Type.TYPE_COMBINED,
  )

  const getLastProcess = (index: number): ReactNode => {
    const last_process: ReactNode = <div>-</div>
    const current_process: TaskProcessInfo = processes_data[index].processes[0]

    if (index === 0) {
      return last_process
    }

    if (current_process.bom_process_type === Bom_Process_Type.TYPE_COMBINED) {
      return <div>-</div>
    }

    // 若上一道工序输入物料与该工序不同，说明为不同物料工序，上一道工序展示为-
    const prev_process = processes_data[index - 1].processes[0]
    if (current_process.bom_process_type === Bom_Process_Type.TYPE_NORMAL) {
      // 需要判断下一道非组合工序并且输入不同
      const next_inputs = prev_process?.inputs?.inputs![0]
      const current_inputs = current_process?.inputs?.inputs![0]
      if (
        prev_process.bom_process_type !== Bom_Process_Type.TYPE_COMBINED &&
        next_inputs?.sku_id !== current_inputs?.sku_id
      ) {
        return last_process
      }
    }

    return <div>{processes_data[index - 1].processes[0].process_name}</div>
  }

  const getNextProcess = (index: number): ReactNode => {
    const next_process: ReactNode = <div>-</div>
    const current_process: TaskProcessInfo = processes_data[index].processes[0]

    if (index === processes_data.length - 1) {
      return next_process
    }

    // 组合工序：直接展示下一道工序
    if (current_process.bom_process_type === Bom_Process_Type.TYPE_COMBINED) {
      return <div>{processes_data[index + 1].processes[0].process_name}</div>
    }

    // 物料工序：下一道工序输入 !== 本身工序输入，说明是物料的最后一道工序，下一道工序展示第一道组合工序名称
    const _next_process = processes_data[index + 1].processes[0]
    if (current_process.bom_process_type === Bom_Process_Type.TYPE_NORMAL) {
      // 需要判断下一道非组合工序并且输入不同
      const next_inputs = _next_process?.inputs?.inputs![0]
      const current_inputs = current_process?.inputs?.inputs![0]
      if (
        _next_process.bom_process_type !== Bom_Process_Type.TYPE_COMBINED &&
        next_inputs?.sku_id !== current_inputs?.sku_id
      ) {
        return <div>{taskProcesses[combineProcessIndex].process_name}</div>
      }
    }
    return <div>{processes_data[index + 1].processes[0].process_name}</div>
  }

  /** 关于上一道、下一道工序的展示：
   * 物料本身正常展示，最后一道工序指向组合工序
   * 组合工序中第一道工序的上一道工序数据太多，不展示，其余正常展示
   * 若是工序被拆分，拆分工序与原工序展示相同
   */
  const columns: Column<GroupTaskProcessInfo>[] = useMemo(() => {
    return [
      {
        Header: t('工序'),
        accessor: 'process_name',
        Cell: (cellProps) => {
          const { processes } = cellProps.original

          return (
            <CellFull
              list={processes}
              calculateHeight={(v: TaskProcess) => {
                return getCellHeight(v, combineProcessIndex)
              }}
              renderItem={(v: TaskProcess) => {
                return v.process_name || '-'
              }}
            />
          )
        },
      },
      {
        Header: t('上道工序'),
        accessor: 'prev_processes',
        Cell: (cellProps) => {
          // 被拆分的工序展示都相同
          const { processes } = cellProps.original
          const last_process: ReactNode = getLastProcess(cellProps.index)

          return (
            <CellFull
              list={processes}
              calculateHeight={(v: TaskProcess) => {
                return getCellHeight(v, combineProcessIndex)
              }}
              renderItem={() => {
                return last_process
              }}
            />
          )
        },
      },
      {
        Header: t('下道工序'),
        show: type !== Task_Type.TYPE_PACK,
        accessor: 'next_processes',
        Cell: (cellProps) => {
          // 被拆分的工序展示都相同
          const { processes } = cellProps.original
          const next_process: ReactNode = getNextProcess(cellProps.index)

          return (
            <CellFull
              list={processes}
              calculateHeight={(v: TaskProcess) => {
                return getCellHeight(v, combineProcessIndex)
              }}
              renderItem={() => {
                return next_process
              }}
            />
          )
        },
      },
      {
        Header: t('关联小组'),
        accessor: 'processor',
        width: TABLE_X.WIDTH_SELECT,
        Cell: (cellProps) => {
          const { processes } = cellProps.original
          const pIndex = _.findIndex(
            taskProcesses,
            (t) => t.process_id === processes[0].process_id,
          )

          return (
            <Observer>
              {() => {
                return (
                  <CellFull
                    list={processes}
                    calculateHeight={(v: TaskProcess) => {
                      return getCellHeight(v, combineProcessIndex)
                    }}
                    renderItem={(v: TaskProcess, i: number) => {
                      return <CellProcessor index={i + pIndex} />
                    }}
                  />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('物料名称'),
        id: 'sku_name',
        Cell: (cellProps) => {
          const { processes } = cellProps.original

          let list: any = []
          processes.forEach((v) => {
            let l = (v.inputs?.inputs || []).slice()
            if (v.bom_process_type === Bom_Process_Type.TYPE_COMBINED) {
              l = (
                taskProcesses[combineProcessIndex]?.inputs?.inputs || []
              ).slice()
            }
            list = list.concat(l)
          })

          return (
            <Observer>
              {() => (
                <CellFull
                  list={list}
                  calculateHeight={(v: any) => {
                    return getCellHeight(v, combineProcessIndex)
                  }}
                  renderItem={(v: any) => {
                    return v.sku_name
                  }}
                />
              )}
            </Observer>
          )
        },
      },
      {
        Header: t('理论用料数量(基本单位)'),
        id: 'plan_amount',
        Cell: (cellProps) => {
          const { processes } = cellProps.original

          let list: any = []
          processes.forEach((v) => {
            let l = (v.inputs?.inputs || []).slice()
            if (v.bom_process_type === Bom_Process_Type.TYPE_COMBINED) {
              l = (
                taskProcesses[combineProcessIndex]?.inputs?.inputs || []
              ).slice()
            }
            list = list.concat(l)
          })

          return (
            <Observer>
              {() => (
                <CellFull
                  list={list}
                  calculateHeight={(v: any) => {
                    return getCellHeight(v, combineProcessIndex)
                  }}
                  renderItem={(v: any) => {
                    const unit_name: string = getUnitInfo({
                      units: units || {},
                      unit_id: v.unit_id || '',
                    }).unitName

                    return v.plan_amount
                      ? `${toFixed(v.plan_amount)}${unit_name}`
                      : '-'
                  }}
                />
              )}
            </Observer>
          )
        },
      },
      {
        Header: t(
          `理论产出数量(${
            type === Task_Type.TYPE_PACK ? '包装单位' : '基本单位'
          })`,
        ),
        accessor: 'output_amount',
        Cell: (cellProps) => {
          // 做一层计算, outputs 产出，组合工序的话只需要展示成品的数量
          // 生产计划的计划详情组合工序直接用成品sku的单位，包装单位需要找到ssu下的规格单位
          const { processes } = cellProps.original

          return (
            <Observer>
              {() => (
                <CellFull
                  list={processes}
                  calculateHeight={(v: TaskProcess) => {
                    return getCellHeight(v, combineProcessIndex)
                  }}
                  renderItem={(v: TaskProcess) => {
                    let output_amount = ''
                    let unit_name = ''

                    if (type === Task_Type.TYPE_PACK) {
                      // 包装计划只有一道工序，只需要展示成品的单位
                      output_amount =
                        v?.outputs?.outputs![0]?.material?.plan_amount || '-'
                      unit_name = getUnitInfo({
                        skus,
                        sku_id: task.sku_id,
                        units: units || {},
                        unit_id: task?.unit_id,
                      }).unitName
                    } else if (
                      v.bom_process_type === Bom_Process_Type.TYPE_COMBINED
                    ) {
                      // 生产 - 若是组合工序，找到output成品的产出展示
                      const outputs = (v.outputs?.outputs || []).slice()
                      const sku = _.find(
                        outputs,
                        (out) => out.type === OutputType.OUTPUT_TYPE_MAIN,
                      )
                      output_amount = sku?.material?.plan_amount || ''
                      unit_name = getUnitInfo({
                        units: units || {},
                        unit_id: sku?.material?.unit_id || '',
                      }).unitName
                    } else {
                      // 生产 - 普通工序，展示物料本身，output只会有一个值
                      output_amount =
                        v?.outputs?.outputs![0]?.material?.plan_amount || '-'
                      unit_name = getUnitInfo({
                        units: units || {},
                        unit_id:
                          v?.outputs?.outputs![0]?.material?.unit_id || '',
                      }).unitName
                    }

                    return output_amount
                      ? `${toFixed(output_amount)}${unit_name}`
                      : '-'
                  }}
                />
              )}
            </Observer>
          )
        },
      },
      {
        Header: t('工序状态'),
        accessor: 'state',
        Cell: (cellProps) => {
          const { processes } = cellProps.original
          return (
            <Observer>
              {() => {
                return (
                  <CellFull
                    list={processes}
                    calculateHeight={(v: TaskProcess) => {
                      return getCellHeight(v, combineProcessIndex)
                    }}
                    renderItem={(v: TaskProcess) => {
                      return map_TaskProcess_State[v.state || ''] || '-'
                    }}
                  />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: TableXUtil.OperationHeader,
        accessor: 'operation',
        fixed: 'right',
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => {
          if (Number(task_state) !== Task_State.STATE_PREPARE) return null

          const { processes } = cellProps.original
          return (
            <Actions
              process_id={processes[0].process_id!}
              isEditing={processes[0].isEditing || false}
            />
          )
        },
      },
    ]
  }, [type, taskProcesses, task_state])

  return (
    <>
      <div className='gm-border-bottom' style={{ height: '250px' }}>
        <GraphFlow
          data={toJS(store.bomData)}
          options={{
            layout: {
              nodesep: 80,
              ranksep: 25,
            },
          }}
        />
      </div>
      <div className='gm-padding-10 gm-text-16'>{t('工序任务明细')}</div>
      <Table data={processes_data.slice()} columns={columns} border />
    </>
  )
})

export default Processes
