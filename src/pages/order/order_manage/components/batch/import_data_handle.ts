import _ from 'lodash'
import {
  wrapDetailList,
  handleDetailListWithCombineSku,
  handleFetchSkuResponse,
} from '../detail/util'
import { BatchOrder } from './store'
import { formatExcelCustomers, isSsuInvalid } from './util'
import { DetailListItem } from '@/pages/order/order_manage/components/interface'
import { Quotation_Type } from 'gm_api/src/merchandise/types'
import globalStore from '@/stores/global'
import { isZero } from '@/pages/order/number_utils'
import { UploadOrderTempleteResponse } from 'gm_api/src/orderlogic'

async function importDataHandle(
  rawData?: UploadOrderTempleteResponse,
): Promise<BatchOrder[]> {
  const relation = rawData?.relation_info || {}
  const excelCustomers = formatExcelCustomers(rawData?.excel_customers || [])
  const recommandSku = rawData?.recommend_skus?.price_map

  const list = _.map(
    rawData?.orders,
    (order, i): (() => Promise<BatchOrder>) => {
      const { order_raw_details, order_details, state, quotation_id, ...rest } =
        order
      const rawDetails = _.map(order_raw_details?.order_details, (item) => {
        if (isSsuInvalid(item)) {
          return { ...item, detail_random_id: _.uniqueId(`10${Date.now()}`) }
        }
        return item
      })
      const orderDetails = _.map(order_details?.order_details, (item) => {
        if (isSsuInvalid(item)) {
          return { ...item, detail_random_id: _.uniqueId(`10${Date.now()}`) }
        }
        return item
      })
      const customer = (relation?.customers || {})[rest?.receive_customer_id!]
      const quotationIds =
        relation?.customer_quotation_relation?.[rest.receive_customer_id!]
          ?.values || []
      const childQuotationParentId =
        relation?.parent_child_quotation_id_map || {}
      const quotation = _.find(relation?.quotations, (item) => {
        const isValid = quotationIds.includes(item.quotation_id)
        const isValidType = [
          Quotation_Type.WITHOUT_TIME,
          Quotation_Type.PERIODIC,
        ].includes(item.type)
        return isValid && isValidType
      })
      // 周期报价单子报价单
      const childQuotation = _.get(
        relation?.quotations,
        _.get(childQuotationParentId, quotation?.quotation_id || ''),
      )
      const menu = relation?.menu_relation?.[rest.menu_id!]

      const info = {
        ...rest,
        quotation_id,
        state,
        service_period_id: rest?.service_period?.service_period_id,
        customer: customer
          ? {
              ...customer,
              quotation,
              value: customer.customer_id,
              text: `${customer.name}(${customer.customized_code})`,
            }
          : undefined,
      }
      const ssus = wrapDetailList(
        globalStore.isLite
          ? orderDetails
          : handleDetailListWithCombineSku(
              orderDetails as DetailListItem[],
              rawDetails as DetailListItem[],
            ) || [],
        relation,
        (detail) => {
          const value1 = detail.add_order_value1?.quantity?.val
          const value2 = detail.add_order_value2?.quantity?.val
          const value3 = detail.add_order_value3?.quantity?.val
          const value4 = detail.add_order_value4?.quantity?.val

          return {
            add_order_value1: isZero(value1)
              ? undefined
              : detail.add_order_value1,
            add_order_value2: isZero(value2)
              ? undefined
              : detail.add_order_value2,
            add_order_value3: isZero(value3)
              ? undefined
              : detail.add_order_value3,
            add_order_value4: isZero(value4)
              ? undefined
              : detail.add_order_value4,
            summary: detail,
            sort_num: detail.sort_num,
            isNewItem: false,
            basic_price: {
              current_price: !!detail?.sku_unit_is_current_price,
            },
            status: detail?.status,
            accept_value: detail?.accept_value,
            outstock_unit_value_v2: detail?.outstock_unit_value_v2,
            menu,
            quotationName:
              _.filter(
                [quotation?.outer_name, childQuotation?.outer_name],
                (v) => !_.isEmpty(v),
              ).join('-') || '-',
            detail_status: detail?.status!, // 加一个detail_status，update的时候去掉
            tax_price: detail?.tax_price,
            feIngredients: detail.ingredients,
          }
        },
      )
      return async () => {
        const getList = _.map(ssus, (item): (() => Promise<DetailListItem>) => {
          return async () => {
            const recommandTarget = _.get(recommandSku, [item.name!])
            if (!recommandTarget) {
              return item
            }
            if (_.keys(recommandTarget.sku_map).length === 0) {
              return item
            }
            let recommandSkuList: DetailListItem[] = []
            try {
              recommandSkuList = await handleFetchSkuResponse(
                _.noop,
                quotation?.quotation_id || order.quotation_id!,
                { response: recommandTarget },
              )
            } catch (error) {
              console.error(error)
            }
            return { ...item, recommendSsus: recommandSkuList }
          }
        })
        const list = await Promise.all(getList.map((handler) => handler()))
        return { info, excel: excelCustomers[i], list } as BatchOrder
      }
    },
  )
  const result = await Promise.all(list.map((handler) => handler()))
  return result
}
export default importDataHandle
