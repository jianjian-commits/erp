import { t } from 'gm-i18n'
import React, { FC, useMemo } from 'react'
import { observer } from 'mobx-react'
import { Column, Table } from '@gm-pc/table-x'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import {
  Task_Type,
  OutputType,
  TaskProcess,
  map_TaskProcess_State,
  Bom_Process_Type,
} from 'gm_api/src/production'
import Big from 'big.js'
import {
  map_Sku_NotPackageSubSkuType,
  map_Sku_PackageSubSkuType,
} from 'gm_api/src/merchandise'

import HeaderTip from '@/common/components/header_tip'
import store from '../../store'
import FactoryModalSelector from '../../components/factory_modal_selector'
import CellProcessMaterialItem from './cell_process_material_item'
import CellProcessItem from './cell_process_item'
import { toFixed, getUnitInfo } from '@/pages/production/util'
import { dpProduction } from '@/pages/production/enum'

interface ProcessDetailProps {
  type: Task_Type
}

interface Process extends TaskProcess {
  _output_amount?: string
  unit_name?: string
  _unit_id?: string
}

const getActualAmount = (v: Process) => {
  // 单位不同才需要查询换算
  const sku_unit_id = v?.inputs?.inputs![0]?.unit_id
  if (sku_unit_id === store.taskDetails.task.unit_id) {
    return v._output_amount
  }

  let base_actual_amount = ''
  const { rate_units } = store.taskDetails
  const unitGroup = _.groupBy(rate_units, 'unit_id_2')
  const _rate = unitGroup[sku_unit_id!] ? unitGroup[sku_unit_id!][0].rate : ''

  if (_rate) {
    // 产出换算成投料的单位
    base_actual_amount = Big(toFixed(v._output_amount || '0'))
      .div(_rate)
      .toFixed(dpProduction)
  }
  return v._output_amount ? base_actual_amount : ''
}

const ProcessesDetail: FC<ProcessDetailProps> = observer(({ type }) => {
  // 物料，类型，用料，理论投料, task_process
  // 工序的产出数需要根据outputs来判断，计算损耗也需要用到，需要先计算
  const units = store.taskDetails.units
  const { task, skus } = store.taskDetails
  const isSingleMaterial: boolean =
    store?.taskDetails?.task_inputs?.length === 1

  let unit_name = ''
  if (type === Task_Type.TYPE_PRODUCE) {
    unit_name = getUnitInfo({ units: units!, unit_id: task.unit_id }).unitName
  } else {
    const { sku_id, unit_id } = task
    unit_name = getUnitInfo({
      units: units!,
      unit_id: unit_id,
      sku_id,
      skus,
    }).unitName
  }

  const processes: Process[] = _.map(
    store.taskProcesses?.slice() || [],
    (p) => {
      let actual_amount = ''
      let unit_name = ''
      let unit_id = ''

      // 非组合工序，直接展示第一个的产出
      if (p?.outputs?.outputs?.length === 1) {
        const material = p?.outputs?.outputs[0].material
        actual_amount = material?.actual_amount || ''
        unit_name = getUnitInfo({
          units: units!,
          unit_id: material?.unit_id!,
        }).unitName
        unit_id = material?.unit_id || ''
      } else {
        // 组合工序，展示成品的产出
        const sku = _.find(
          p?.outputs?.outputs || [],
          (o) => o.type === OutputType.OUTPUT_TYPE_MAIN,
        )
        actual_amount = sku?.material?.actual_amount || ''
        unit_name = getUnitInfo({
          units: units!,
          unit_id: sku?.material?.unit_id!,
        }).unitName
        unit_id = sku?.material?.unit_id || ''
      }
      return {
        ...p,
        _output_amount: actual_amount,
        unit_name,
        _unit_id: unit_id,
      }
    },
  )

  const columns = useMemo(
    (): Column<Process>[] => [
      {
        Header: t('工序'),
        accessor: 'process_name',
        width: 120,
        Cell: (cellProps) => {
          const { bom_process_type } = cellProps.original
          if (bom_process_type === Bom_Process_Type.TYPE_NORMAL) {
            return <div>{cellProps.original.process_name}</div>
          }

          return <div>{cellProps.original.process_name}</div>
        },
      },
      {
        Header: t('工序状态'),
        accessor: 'state',
        minWidth: 80,
        Cell: (cellProps) => {
          const { state } = cellProps.original
          return <div>{map_TaskProcess_State[state!] || '-'}</div>
        },
      },
      {
        Header: t('关联小组'),
        accessor: 'processor',
        width: 120,
        Cell: (cellProps) => {
          const { processor } = cellProps.original
          return (
            <FactoryModalSelector
              selected={[]}
              onSelect={_.noop}
              isView
              processor_id={processor}
            />
          )
        },
      },
      {
        Header: t('物料名称'),
        accessor: 'sku_name',
        width: 80,
        Cell: (cellProps) => {
          return (
            <CellProcessMaterialItem
              list={cellProps.original}
              renderText={(p) => p.sku_name || '-'}
            />
          )
        },
      },
      {
        Header: t('商品类型'),
        accessor: 'sku_type',
        minWidth: 80,
        Cell: (cellProps) => {
          return (
            <CellProcessMaterialItem
              list={cellProps.original}
              renderText={(p, index: number) => {
                // 获取物料的商品类型
                const sku = skus && skus[p.sku_id || '']?.sku
                // 针对周转物, 包装计划成品为非加工品
                const sku_type =
                  type === Task_Type.TYPE_PRODUCE ||
                  (type === Task_Type.TYPE_PACK && index === 0)
                    ? sku?.not_package_sub_sku_type
                    : sku?.package_sub_sku_type

                return sku_type
                  ? type === Task_Type.TYPE_PRODUCE ||
                    (type === Task_Type.TYPE_PACK && index === 0)
                    ? map_Sku_NotPackageSubSkuType[sku_type]
                    : map_Sku_PackageSubSkuType[sku_type]
                  : '-'
              }}
            />
          )
        },
      },
      {
        Header: t('理论用料(基本单位)'),
        accessor: 'plan_amount', // 多个
        minWidth: 80,
        Cell: (cellProps) => {
          return (
            <CellProcessMaterialItem
              list={cellProps.original}
              renderText={(p) => {
                // 组合工序时要展示各自物料单位
                const unit_name: string = getUnitInfo({
                  unit_id: p.unit_id || '',
                  units: units!,
                }).unitName
                return p.plan_amount
                  ? `${toFixed(p.plan_amount)}${unit_name}`
                  : '-'
              }}
            />
          )
        },
      },
      {
        Header: t(
          `理论产出(${type === Task_Type.TYPE_PACK ? '包装单位' : '基本单位'})`,
        ), // 成品的计划产出数
        accessor: 'amount',
        minWidth: 80,
        Cell: (cellProps) => {
          // 做一层计算, outputs 产出，组合工序的话只需要展示成品的数量
          // 生产计划的计划详情组合工序直接用成品sku的单位，包装单位需要找到ssu下的规格单位
          const { original } = cellProps

          let output_amount = ''
          let unit_name = ''

          if (type === Task_Type.TYPE_PACK) {
            // 包装计划只有一道工序，只需要展示成品的单位
            output_amount =
              original?.outputs?.outputs![0]?.material?.plan_amount || '-'
            unit_name = getUnitInfo({
              skus,
              sku_id: task.sku_id,
              units: units || {},
              unit_id: task?.unit_id,
            }).unitName
          } else if (
            original.bom_process_type === Bom_Process_Type.TYPE_COMBINED
          ) {
            // 生产 - 若是组合工序，找到output成品的产出展示
            const outputs = (original.outputs?.outputs || []).slice()
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
              original?.outputs?.outputs![0]?.material?.plan_amount || '-'
            unit_name = getUnitInfo({
              units: units || {},
              unit_id: original?.outputs?.outputs![0]?.material?.unit_id || '',
            }).unitName
          }

          return (
            <Flex column justifyCenter>
              {output_amount ? `${toFixed(output_amount)}${unit_name}` : '-'}
            </Flex>
          )
        },
      },
      {
        Header: t('投料数量(基本单位)'),
        accessor: 'actual_amount', // 多个
        minWidth: 80,
        Cell: (cellProps) => {
          return (
            <CellProcessMaterialItem
              list={cellProps.original}
              renderText={(p) => {
                // 组合工序时要展示各自物料单位
                const unit_name: string = getUnitInfo({
                  unit_id: p.unit_id!,
                  units: units!,
                }).unitName
                return p.actual_amount
                  ? `${toFixed(p.actual_amount)}${unit_name}`
                  : '-'
              }}
            />
          )
        },
      },
      {
        Header: t(
          `产出数量(${type === Task_Type.TYPE_PACK ? '包装单位' : '基本单位'})`,
        ),
        accessor: 'output_amount', // 多个
        minWidth: 80,
        Cell: (cellProps) => {
          // 判断是否组合工序，组合工序用成品的单位
          const { original } = cellProps
          let _unit_name = ''
          if (isSingleMaterial) {
            // 说明是单物料, 产出直接用成品单位
            _unit_name = original.unit_name!
          } else if ((original?.rank || 0) >= 100) {
            _unit_name = original.unit_name!
          } else {
            _unit_name = getUnitInfo({
              unit_id: original?.inputs?.inputs![0].unit_id!,
              units: units!,
            }).unitName
          }

          return (
            <CellProcessItem
              text={
                original._output_amount
                  ? `${toFixed(original._output_amount)}${
                      type === Task_Type.TYPE_PRODUCE ? _unit_name : unit_name
                    }`
                  : '-'
              }
            />
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={t('损耗数量(基本单位)')}
            tip={t('损耗数量=投料数量-产出数量。组合工序的损耗数量不做计算')}
          />
        ),
        show: type === Task_Type.TYPE_PRODUCE,
        accessor: 'lose_amount',
        minWidth: 80,
        Cell: (cellProps) => {
          const { original, index } = cellProps
          let lose_amount = ''
          const unit_id: string = original?.inputs?.inputs![0].unit_id || ''
          let unit_name: string = getUnitInfo({
            units: units!,
            unit_id: unit_id,
          }).unitName

          const sku_actual_amount =
            original?.inputs?.inputs![0]?.actual_amount || ''

          // 说明不是组合工序，需要计算损耗. 单物料最后一道工序计算损耗可能需要将成品单位进行转换计算
          if (isSingleMaterial) {
            const base_actual_amount: string =
              (index === processes.length - 1
                ? getActualAmount(original)
                : original._output_amount) || ''

            unit_name =
              (index === processes.length - 1
                ? unit_name
                : original.unit_name) || ''

            if (base_actual_amount) {
              lose_amount = Big(toFixed(sku_actual_amount || '0'))
                .minus(base_actual_amount || 0)
                .toFixed(dpProduction)
            }
          } else if (
            (original?.rank || 0) < 100 &&
            original._output_amount !== ''
          ) {
            lose_amount = sku_actual_amount
              ? Big(toFixed(sku_actual_amount || '0'))
                  .minus(toFixed(original._output_amount || '0'))
                  .toFixed(dpProduction)
              : ''
          }

          return (
            <CellProcessItem
              text={lose_amount ? `${lose_amount}${unit_name}` : '-'}
            />
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={t('出成率')}
            tip={t(
              '出成率=产出数量/投料数量。当生产成品单位和物料单位不同且不能换算时，出成率不做计算',
            )}
          />
        ),
        show: type === Task_Type.TYPE_PRODUCE,
        accessor: 'output_ratio',
        minWidth: 80,
        Cell: (cellProps) => {
          const { original, index } = cellProps
          let rate = '-'
          const sku_actual_amount =
            original?.inputs?.inputs![0]?.actual_amount || ''

          // 组合工序，可能需要换算单位计算损耗
          if ((original.rank || 0) >= 100 && original._output_amount !== '') {
            rate = store.getProcessRate(
              index,
              original._unit_id || '',
              original._output_amount || '',
            )
            // 需要处理单物料的情况
          } else if (isSingleMaterial) {
            const base_actual_amount: string =
              (index === processes.length - 1
                ? getActualAmount(original)
                : original._output_amount) || ''
            if (base_actual_amount) {
              rate = sku_actual_amount
                ? Big(toFixed(base_actual_amount || '0'))
                    .div(sku_actual_amount || 0)
                    .times(100)
                    .toFixed(dpProduction)
                : '-'
            }
          } else {
            const actual_amount = original?.inputs?.inputs![0].actual_amount
            // 直接 出成率 = 产出 / 投料 工序的_output_amount / 物料的actual_amount
            // 需要处理单物料的出成率
            rate =
              original._output_amount === '' || actual_amount === ''
                ? '-'
                : Big(toFixed(original._output_amount || '0'))
                    .div(toFixed(actual_amount || '0'))
                    .times(100)
                    .toFixed(dpProduction)
          }

          return <CellProcessItem text={rate === '-' ? rate : `${rate}%`} />
        },
      },
    ],
    [type],
  )

  return (
    <Table
      data={processes.slice()}
      columns={columns}
      style={{ overflowY: 'hidden' }}
      border
    />
  )
})

export default ProcessesDetail
