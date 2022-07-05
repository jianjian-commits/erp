import React from 'react'
import { t } from 'gm-i18n'
import { Column, TableXUtil } from '@gm-pc/table-x'
import _ from 'lodash'
import Big from 'big.js'
import { convertUnit } from '@/common/util'
import HeaderTip from '@/pages/production/components/header_tip'
import { dpProduction, toFixedZero } from '@/pages/production/enum'
import { renderAmountInfo, toFixed } from '@/pages/production/util'
import {
  MaterialInfo,
  ReportTaskInfo,
} from '@/pages/report/production/interface'
import ByProducts from '@/pages/report/production/pack_report/components/by_products'
import globalStore from '@/stores/global'
import {
  OperationCell,
  OperationDetail,
  SortHeader,
} from '@gm-pc/table-x/src/components'
import { Task_Type } from 'gm_api/src/production'
import qs from 'query-string'
import BaseStore from '../base.store'
import { ProductionReportStore } from '../production_report/store'
import { productPercentage } from '../utils'

export const customized_code = {
  Header: t('成品编码'),
  accessor: 'customized_code',
  minWidth: 100,
}

export const sku_name = {
  Header: t('生产成品'),
  accessor: 'sku_name',
  minWidth: 100,
}

export const bom_name = {
  Header: t('BOM名称'),
  accessor: 'bom_name',
  minWidth: 100,
}

export const sku_type = {
  Header: t('商品类型'),
  accessor: 'sku_type',
  minWidth: 100,
  Cell: (cellProps: { row: { original: ReportTaskInfo } }) => {
    const { sku_type } = cellProps.row.original
    return <div>{sku_type}</div>
  },
}

export const spec_name = {
  Header: t('规格名称'),
  accessor: 'spec_name',
  minWidth: 100,
}

export const spec = {
  Header: t('规格'),
  accessor: 'spec',
  minWidth: 100,
}

export const category_path = {
  Header: t('分类'),
  accessor: 'category_path',
  minWidth: 100,
}

export const base_unit_name: Column<ReportTaskInfo> = {
  Header: t('基本单位'),
  accessor: 'base_unit_name',
  minWidth: 100,
  Cell: (cellProps) => {
    const { base_unit_name } = cellProps.original
    return <div>{base_unit_name}</div>
  },
}

export const pack_unit_name = {
  Header: t('包装单位'),
  accessor: 'pack_unit_name',
  minWidth: 100,
}

export const base_unit_output_amount_sum: Column<ReportTaskInfo> = {
  Header: t('产出数量（基本单位）'),
  accessor: 'base_unit_output_amount_sum',
  minWidth: 150,
  Cell: (cellProps) => {
    const { base_unit_output_amount_sum } = cellProps.original
    return <div>{renderAmountInfo(base_unit_output_amount_sum || '')}</div>
  },
}

export const base_unit_stock_in_amount_sum: Column<ReportTaskInfo> = {
  Header: t('入库数量（基本单位）'),
  accessor: 'base_unit_new_stock_quantity',
  minWidth: 150,
  Cell: (cellProps) => {
    const { base_unit_new_stock_quantity } = cellProps.original
    return <div>{renderAmountInfo(base_unit_new_stock_quantity || '')}</div>
  },
}

export const output_amount_sum: Column<ReportTaskInfo> = {
  Header: t('产出数量（包装单位）'),
  accessor: 'output_amount_sum',
  minWidth: 150,
  Cell: (cellProps) => {
    const { output_amount_sum } = cellProps.original
    return <div>{renderAmountInfo(output_amount_sum || '')}</div>
  },
}

export const input_actual_usage_total_price_sum = (
  store: BaseStore,
): Column<ReportTaskInfo> => ({
  Header: (
    <div>
      {t('用料金额')}
      <SortHeader
        type={store.filter.sort_type || null}
        onChange={(type: 'asc' | 'desc' | null) => {
          store.updateFilter('sort_type', type || '')
        }}
      />
    </div>
  ),
  accessor: 'input_actual_usage_total_price_sum',
  minWidth: 100,
  Cell: (cellProps) => {
    const { input_actual_usage_total_price_sum } = cellProps.original
    return (
      <div>{renderAmountInfo(input_actual_usage_total_price_sum || '')}</div>
    )
  },
})

export const avg_price = (type: Task_Type): Column<ReportTaskInfo> => ({
  Header: (
    <HeaderTip
      right
      header={t('平均成本')}
      info={t('平均成本=用料金额/产出数量')}
      tipStyle={{ width: '200px' }}
    />
  ),
  accessor: 'avg_price',
  minWidth: 100,
  Cell: (cellProps) => {
    const {
      input_actual_usage_total_price_sum,
      base_unit_output_amount_sum,
      output_amount_sum,
    } = cellProps.original
    const output_amount: string =
      (type !== Task_Type.TYPE_PACK
        ? base_unit_output_amount_sum
        : output_amount_sum) || ''
    const avg_price =
      toFixed(output_amount || '0') !== toFixedZero
        ? Big(toFixed(input_actual_usage_total_price_sum || '0'))
            .div(toFixed(output_amount || '0'))
            .toFixed(dpProduction)
        : '-'

    return <div>{avg_price}</div>
  },
})

export const reference_cost = {
  Header: (
    <HeaderTip
      right
      header={t('参考成本')}
      info={t('参考成本 = 理论用料金额的总和')}
      tipStyle={{ width: '200px' }}
    />
  ),
  accessor: 'reference_cost',
  minWidth: 100,
  Cell: (cellProps: { row: { original: ReportTaskInfo } }) => {
    const { materials } = cellProps.row.original
    // 参考成本 = SUM(原料的参考成本)
    const reference_cost =
      materials.reduce((totalCost, material, index) => {
        totalCost += +material.reference_cost
        if (index === materials.length - 1) {
          totalCost = +totalCost.toFixed(2)
        }
        return totalCost
      }, 0) || 0

    return <div>{reference_cost}</div>
  },
}

// 获取实际出成率
export const getProductPercentage = (item: ReportTaskInfo) => {
  // 实际用料数量 = 领料数量 - 退料数量
  // 实际出成率 = 产出数量 / 实际用料数量
  const { sku_unit_rate } = item.materials[0]
  const actual_usage_amount_sum = item.materials.reduce((pre, cur, i) => {
    const { actual_usage_amount_sum } = cur
    return Big(pre)
      .plus(actual_usage_amount_sum || 0)
      .toNumber()
  }, 0)
  const { base_unit_output_amount_sum } = item

  const actual_amount: string = actual_usage_amount_sum?.toString() || ''

  if (toFixed(actual_amount) === toFixedZero) return '-'

  const rate = Big(toFixed(base_unit_output_amount_sum || '0'))
    .div(actual_amount || '1')
    .div(sku_unit_rate || '1')
    .times(100)
    .toFixed(2)

  return rate
}

export const actual_product_percentage: Column<ReportTaskInfo> = {
  Header: (
    <HeaderTip
      right
      header={t('生产实际出成率')}
      info={t('实际出成率=产出数量/实际用料数量')}
      tipStyle={{ width: '220px' }}
    />
  ),
  accessor: 'actual_product_percentage',
  minWidth: 150,
  Cell: (cellProps) => {
    const rate = getProductPercentage(cellProps.original)
    return <div>{rate === '-' ? rate : `${rate}%`}</div>
  },
}

export const product_percentage = (
  store: ProductionReportStore,
): Column<ReportTaskInfo> => ({
  Header: (
    <HeaderTip
      right
      header={t('生产理论出成率')}
      info={t('实时展示bom中出成率')}
      tipStyle={{ width: '180px' }}
    />
  ),
  accessor: 'product_percentage',
  minWidth: 100,
  Cell: (cellProps) => {
    const { boms, unit_rates } = store
    // 原料的理论出成率，bom中成品产出 / 原料用料
    const { bom_id, bom_revisions } = cellProps.original
    const bom = boms?.[bom_id!]?.boms?.[bom_revisions!]

    if (bom) {
      const rate = productPercentage(bom)
      return <div>{rate ? `${rate.toFixed(2)}%` : '-'}</div>
    }
    return <div>-</div>
  },
})

export const stock_in_percentage = (
  store: BaseStore,
): Column<ReportTaskInfo> => ({
  Header: t('入库实际出成率'),
  accessor: 'stock_in_percentage',
  minWidth: 100,
  Cell: (cellProps) => {
    /** 入库数量（基本单位） */
    const { base_unit_new_stock_quantity } = cellProps.original
    /** 实际用料数量（基本单位） */
    const { actual_usage_amount_sum } = cellProps.original.materials[0]
    const fromUnitId = cellProps.original.base_unit_id || ''
    const toUnitId = cellProps.original?.materials?.[0]?.unit_id || ''
    const toUnit = globalStore.getUnit(toUnitId)
    const fromUnitVal = {
      unit_id: fromUnitId,
      val: base_unit_new_stock_quantity,
    }
    const convertedQuantity = convertUnit(fromUnitVal, toUnit, true)
    if (toFixed(actual_usage_amount_sum || '0') === toFixedZero) return '-'
    const val = Big(convertedQuantity.val || '0')
      .div(actual_usage_amount_sum!)
      .times(100)
      .toNumber()
    return val ? val.toFixed(2) + '%' : '-'
  },
})

export const by_products: Column<ReportTaskInfo> = {
  Header: t('副产品产出数'),
  accessor: 'by_products',
  minWidth: 100,
  Cell: (cellProps) => {
    return (
      <ByProducts products={(cellProps.original?.by_products || []).slice()} />
    )
  },
}

export const operation = (
  store: BaseStore,
  type: Task_Type,
): Column<ReportTaskInfo> => ({
  Header: t('查看工序出成率'),
  accessor: 'operation',
  width: TableXUtil.TABLE_X.WIDTH_OPERATION,
  Cell: (cellProps) => {
    const task = cellProps.original

    const url = `#/report/production/process_yield?${qs.stringify({
      q: task.customized_code,
      time_type: store.filter.time_type,
      begin_time: store.filter.begin_time.getTime(),
      end_time: store.filter.end_time.getTime(),
    })}`

    return (
      <OperationCell>
        <OperationDetail href={url} />
      </OperationCell>
    )
  },
})

export const detail = (
  store: BaseStore,
  type: Task_Type,
): Column<ReportTaskInfo> => ({
  Header: t('操作'),
  accessor: 'operation',
  width: TableXUtil.TABLE_X.WIDTH_OPERATION,
  Cell: (cellProps) => {
    const skuTask: string =
      _.find(store.tasks, (t) => t.sku_id === cellProps.original.sku_id)
        ?.task_ids || ''

    let url = `#/report/production/production_report/detail?${qs.stringify({
      task_ids: skuTask,
    })}`

    if (type === Task_Type.TYPE_PACK) {
      url = `#/report/production/pack_report/detail?${qs.stringify({
        task_ids: skuTask,
      })}`
    }
    return (
      <OperationCell>
        <OperationDetail href={url} />
      </OperationCell>
    )
  },
})

/** 原料表字段-开始 */

export const sub_customized_code = {
  Header: t('原料编码'),
  accessor: 'customized_code',
  minWidth: 100,
}

export const child_customized_code = {
  Header: t('原料编码'),
  accessor: 'materials.0.customized_code',
  minWidth: 100,
}

export const sub_sku_name = {
  Header: t('原料名称'),
  accessor: 'sku_name',
  minWidth: 100,
}

export const child_sku_name = {
  Header: t('原料名称'),
  accessor: 'materials.0.sku_name',
  minWidth: 100,
}

export const sub_sku_type = {
  Header: t('原料类型'),
  accessor: 'sku_type',
  minWidth: 100,
}

export const child_sku_type = {
  Header: t('原料类型'),
  accessor: 'materials.0.sku_type',
  minWidth: 100,
}

export const sub_base_unit_name = {
  Header: t('基本单位'),
  accessor: 'base_unit_name',
  minWidth: 100,
}

export const child_base_unit_name = {
  Header: t('基本单位'),
  accessor: 'materials.0.base_unit_name',
  minWidth: 100,
}

export const sub_receive_amount_sum: Column<MaterialInfo> = {
  Header: t('领料数量（基本单位）'),
  accessor: 'receive_amount_sum',
  minWidth: 100,
  Cell: (cellProps) => {
    const { receive_amount_sum } = cellProps.original
    return <div>{renderAmountInfo(receive_amount_sum || '')}</div>
  },
}

export const child_receive_amount_sum: Column<ReportTaskInfo> = {
  Header: t('领料数量（基本单位）'),
  accessor: 'materials.0.receive_amount_sum',
  minWidth: 100,
  Cell: (cellProps) => {
    const val = cellProps.original.materials?.[0].receive_amount_sum || ''
    return <div>{renderAmountInfo(val)}</div>
  },
}

export const sub_return_amount_sum: Column<MaterialInfo> = {
  Header: t('退料数量（基本单位）'),
  accessor: 'return_amount_sum',
  minWidth: 100,
  Cell: (cellProps) => {
    const { return_amount_sum } = cellProps.original
    return <div>{renderAmountInfo(return_amount_sum || '')}</div>
  },
}

export const child_return_amount_sum: Column<ReportTaskInfo> = {
  Header: t('退料数量（基本单位）'),
  accessor: 'materials.0.return_amount_sum',
  minWidth: 100,
  Cell: (cellProps) => {
    const val = cellProps.original.materials?.[0].return_amount_sum || ''
    return <div>{renderAmountInfo(val)}</div>
  },
}

export const sub_actual_usage_amount_sum: Column<MaterialInfo> = {
  Header: (
    <HeaderTip
      right
      header={t('实际用料数量（基本单位）')}
      info={t('实际用料数量=领料数量 - 退料数量')}
      tipStyle={{ width: '220px' }}
    />
  ),
  accessor: 'actual_usage_amount_sum',
  minWidth: 150,
  Cell: (cellProps) => {
    const { actual_usage_amount_sum } = cellProps.original
    return <div>{renderAmountInfo(actual_usage_amount_sum || '')}</div>
  },
}

export const child_actual_usage_amount_sum: Column<ReportTaskInfo> = {
  Header: (
    <HeaderTip
      right
      header={t('实际用料数量（基本单位）')}
      info={t('实际用料数量=领料数量 - 退料数量')}
      tipStyle={{ width: '220px' }}
    />
  ),
  accessor: 'materials.0.actual_usage_amount_sum',
  minWidth: 150,
  Cell: (cellProps) => {
    const val = cellProps.original.materials?.[0].actual_usage_amount_sum || ''
    return <div>{renderAmountInfo(val)}</div>
  },
}

export const sub_plan_usage_amount_sum: Column<MaterialInfo> = {
  Header: t('理论用料数量（基本单位）'),
  accessor: 'plan_usage_amount_sum',
  minWidth: 150,
  Cell: (cellProps) => {
    const { plan_usage_amount_sum } = cellProps.original
    return <div>{renderAmountInfo(plan_usage_amount_sum || '')}</div>
  },
}

export const child_plan_usage_amount_sum: Column<ReportTaskInfo> = {
  Header: t('理论用料数量（基本单位）'),
  accessor: 'materials.0.plan_usage_amount_sum',
  minWidth: 150,
  Cell: (cellProps) => {
    const val = cellProps.original.materials.reduce((pre, cur, i) => {
      return Big(pre)
        .plus(Big(cur.plan_usage_amount_sum || ''))
        .toNumber()
    }, 0)

    return <div>{renderAmountInfo(val?.toString())}</div>
  },
}

export const sub_actual_usage_total_price_sum: Column<MaterialInfo> = {
  Header: t('实际用料金额'),
  accessor: 'actual_usage_total_price_sum',
  minWidth: 100,
  Cell: (cellProps) => {
    const { actual_usage_total_price_sum } = cellProps.original
    return <div>{renderAmountInfo(actual_usage_total_price_sum || '')}</div>
  },
}

export const child_actual_usage_total_price_sum: Column<ReportTaskInfo> = {
  Header: t('实际用料金额'),
  accessor: 'materials.0.actual_usage_total_price_sum',
  minWidth: 100,
  Cell: (cellProps) => {
    const { actual_usage_total_price_sum } = cellProps.original.materials[0]
    return <div>{renderAmountInfo(actual_usage_total_price_sum || '')}</div>
  },
}

/** 原料表字段-结束 */

/** 出成率字段-开始 */

export const 清洗: Column<ReportTaskInfo> = {
  Header: t('清洗'),
  accessor: 'TODO:',
  minWidth: 100,
  Cell: (cellProps) => {
    return <div>TODO:</div>
  },
}

export const 去皮: Column<ReportTaskInfo> = {
  Header: t('去皮'),
  accessor: 'TODO:',
  minWidth: 100,
  Cell: (cellProps) => {
    return <div>TODO:</div>
  },
}

export const 切配: Column<ReportTaskInfo> = {
  Header: t('切配'),
  accessor: 'TODO:',
  minWidth: 100,
  Cell: (cellProps) => {
    return <div>TODO:</div>
  },
}

export const 甩干: Column<ReportTaskInfo> = {
  Header: t('甩干'),
  accessor: 'TODO:',
  minWidth: 100,
  Cell: (cellProps) => {
    return <div>TODO:</div>
  },
}

export const 筛选: Column<ReportTaskInfo> = {
  Header: t('筛选'),
  accessor: 'TODO:',
  minWidth: 100,
  Cell: (cellProps) => {
    return <div>TODO:</div>
  },
}

/** 出成率字段-结束 */
