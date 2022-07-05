import { SortsType } from '@gm-pc/table-x'
import {
  GetOrderSynthesizeSaleDataResponse,
  ListReportFormResponse_Amount,
  TimeRange,
} from 'gm_api/src/databi'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { ModelValue, FieldExpr } from 'gm_api/src/analytics'
import { toFixOrderWithPrice } from '@/common/util'
import { FormatQueryDataReturn } from './sale/interface'
import { COMMON_COLUMNS } from './sale/constants'
import _ from 'lodash'
import { Supplier } from 'gm_api/src/enterprise'
/**
 * @description: 获取modelvalues的kv
 */
const getModelValuesKV = (modelValues?: ModelValue[]) => {
  return modelValues?.map(({ kv }, id) => ({ ...kv, id })) || []
}
/**
 * @description: 格式化QueryData
 */
export const formatQueryData = <D = any, S = any>({
  response,
}: {
  response: GetOrderSynthesizeSaleDataResponse
}): FormatQueryDataReturn<D, S> => {
  const { data: originData, summary_data: originSummary, paging } = response
  const data = getModelValuesKV(originData?.model_values)
  const summaryData = getModelValuesKV(originSummary?.model_values)[0] || {}
  return {
    paging,
    data,
    summaryData,
  } as unknown as FormatQueryDataReturn<D, S>
}

/**
 * @description: 通过排序获取expr
 */
export const getExprBySorts = (sorts: SortsType) => {
  const order_by_fields: FieldExpr[] = []
  Object.entries(sorts).forEach(([name, expr]) => {
    if (expr) {
      order_by_fields.push({
        name,
        expr: `${name} ${expr}`,
      })
    }
  })
  return {
    order_by_fields,
  }
}

export const getOrderOrReceiveTimeColumn = (timeRange?: TimeRange) => {
  const IsShowOrderTimeColumn = timeRange?.time_field === 'order_time'
  const column = IsShowOrderTimeColumn
    ? COMMON_COLUMNS.order_time
    : COMMON_COLUMNS.receive_time
  return column
}
/**
 * @description: 格式化毛利率
 * @param {string} rate
 */
export const formatGrossProfitRate = (rate: string | number) => {
  if (rate === '-') {
    return rate
  }
  return `${Big(rate).mul(100).toFixed(2)}%`
}
/**
 * @description: 获取毛利和毛利率统计数据
 */
export const getGrossSum = (
  gross_margin: string,
  gross_profit_rate: string,
) => {
  return [
    {
      label: t('毛利'),
      content: toFixOrderWithPrice(gross_margin),
    },
    {
      label: t('毛利率'),
      content: formatGrossProfitRate(gross_profit_rate),
    },
  ]
}

/**
 * @description: 应付报表
 */
export const getReportForm = (
  amounts: ListReportFormResponse_Amount[] | undefined,
  supplier_map: { [key: string]: Supplier } | undefined,
) => {
  const data = _.map(amounts, (item) => {
    const supplier_list = supplier_map[item?.target_id]
    return {
      supplier_id: supplier_list?.supplier_id,
      supplier_name: supplier_list?.name,
      customized_code: supplier_list?.customized_code,
      total_amount: item.total_amount,
      total_already_amount: item.total_already_amount,
      total_not_amount: item.total_not_amount,
      receiver: supplier_list?.address?.receiver,
      phone: supplier_list?.address?.phone,
    }
  })

  return data
}
