import { t } from 'gm-i18n'
import React, { FC, useEffect, useMemo, useCallback } from 'react'
import { Flex, Button, Modal, Tip } from '@gm-pc/react'
import { TableXUtil, Column, Table } from '@gm-pc/table-x'
import { KCInputNumber } from '@gm-pc/keyboard'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'

import store from '../../store'
import FactoryModalSelector from '../../components/factory_modal_selector'
import { SplitTaskInfo, TaskProcessInfo } from '../../interface'
import { toFixed, numMinus } from '@/pages/production/util'
import { toFixedZero } from '@/pages/production/enum'

interface Props {
  actual_amount: string
  unit_name: string
  selected: TaskProcessInfo[]
}

const { TABLE_X, OperationHeader, OperationCell, EditOperation } = TableXUtil

/**
 * 任务拆分可以将工序任务拆分成多个，拆分后铺平展示
 */
const TaskSplit: FC<Props> = observer(
  ({ actual_amount, unit_name, selected }) => {
    useEffect(() => {
      // init数据 -- 初始化当前工序所被拆分的所有工序
      store.initSplitTaskProcesses(selected)
    }, [selected])

    const { splitTaskList } = store

    const handleAddRow = useCallback(() => {
      store.addSplitTaskProcessesItem()
    }, [])

    const handleDelRow = (index: number) => {
      store.deleteSplitTaskProcessesItem(index)
    }

    const handleAmountChange = (index: number, value: number | null) => {
      const new_value = value === null ? '' : _.toString(value)
      store.updateSplitTaskProcessesItem(index, 'amount', new_value)
    }

    const handleFactorySelect = (index: number, selected: string[]) => {
      // 只能选择小组，选择车间时不做任何操作
      if (selected.length === 1) {
        Tip.tip(t('当前必须选择到小组'))
        return
      }
      store.updateSplitTaskProcessesItem(index, 'processor_select', selected)
    }

    const handleCancel = () => {
      Modal.hide()
      // 清空数据
      store.clearSplitTaskProcesses()
    }

    const handleSplitTask = () => {
      const process_id = selected[0].process_id
      store.splitTaskProcesses(process_id!).then((json) => {
        if (json.response.task_processes) {
          Tip.success(t('拆分成功！'))
          Modal.hide()
        }
        return json
      })
    }

    const handleSplitProcess = () => {
      // 校验当前拆分后数据之和是否等于理论产出数
      if (
        numMinus(
          actual_amount,
          toFixed(`${store.distributedAmounts}`) || '0',
        ) === toFixedZero
      ) {
        handleSplitTask()
        return
      }

      Tip.tip(t('拆分后数据需等于当前任务理论产出数，请重新编辑拆分后数据!'))
    }

    const columns = useMemo(
      (): Column<SplitTaskInfo>[] => [
        {
          Header: t('序号'),
          id: 'index',
          fixed: 'left',
          width: TABLE_X.WIDTH_NO,
          Cell: (cellProps) => {
            return <div>{cellProps.index + 1}</div>
          },
        },
        {
          Header: OperationHeader,
          id: 'operation',
          fixed: 'left',
          width: TABLE_X.WIDTH_EDIT_OPERATION,
          Cell: (cellProps) => {
            return (
              <OperationCell>
                <EditOperation
                  onAddRow={handleAddRow}
                  onDeleteRow={
                    splitTaskList.length === 1
                      ? undefined
                      : () => handleDelRow(cellProps.index)
                  }
                />
              </OperationCell>
            )
          },
        },
        {
          Header: t('理论产出数量'),
          accessor: 'amount',
          isKeyboard: true,
          Cell: (cellProps) => {
            return (
              <Observer>
                {() => {
                  const {
                    index,
                    original: { amount },
                  } = cellProps

                  return (
                    <KCInputNumber
                      value={amount}
                      onChange={(value: number | null) =>
                        handleAmountChange(index, value)
                      }
                      min={0}
                      precision={4}
                    />
                  )
                }}
              </Observer>
            )
          },
        },
        {
          Header: t('关联小组'),
          accessor: 'processor',
          isKeyboard: true,
          Cell: (cellProps) => {
            return (
              <Observer>
                {() => {
                  const {
                    index,
                    original: { processor_select },
                  } = cellProps

                  return (
                    <FactoryModalSelector
                      isKeyboard
                      key={index}
                      selected={processor_select || []}
                      onSelect={(selected) =>
                        handleFactorySelect(index, selected)
                      }
                    />
                  )
                }}
              </Observer>
            )
          },
        },
      ],
      [splitTaskList, handleAddRow],
    )

    return (
      <>
        <div className='gm-text-red gm-padding-left-10'>
          {t('* 拆分后的数量需等于当前任务理论产出数量')}
        </div>
        <Flex className='gm-padding-10 gm-text-14'>
          <span style={{ marginRight: '80px' }}>
            {t('理论产出数量: ')}
            {toFixed(actual_amount)}
            {unit_name}
          </span>
          <Observer>
            {() => (
              <span>
                {t('待分配数量: ')}
                {numMinus(
                  actual_amount,
                  toFixed(`${store.distributedAmounts}`) || '0',
                )}
                {unit_name}
              </span>
            )}
          </Observer>
        </Flex>
        <Table
          isKeyboard
          isEdit
          isVirtualized
          id='task_split'
          tiled
          columns={columns}
          onAddRow={handleAddRow}
          data={splitTaskList.slice()}
          limit={5}
        />
        <Flex justifyEnd className='gm-padding-10'>
          <Button className='gm-margin-right-10' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' onClick={handleSplitProcess}>
            {t('确定')}
          </Button>
        </Flex>
      </>
    )
  },
)

export default TaskSplit
