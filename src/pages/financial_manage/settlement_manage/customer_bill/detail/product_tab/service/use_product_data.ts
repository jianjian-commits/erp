import { ListBillOrderByProduct } from 'gm_api/src/finance'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { SearchTimeParams } from '../../interface'
import { ProductSummaryItem } from '../interface'

export interface Options {
  /** 客户 id */
  customerId?: string
  /** 时间筛选参数 */
  timeFilter?: SearchTimeParams
}

function useProductData(options?: Options) {
  const { customerId, timeFilter } = options || {}

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<ProductSummaryItem[]>()

  useEffect(() => {
    if (!customerId) {
      return
    }
    setLoading(true)
    ListBillOrderByProduct({
      list_bill_order_filter: {
        ...timeFilter,
        receive_customer_ids: [customerId],
      },
    })
      .then(({ response }) => {
        const result = _.map(
          response.bill_order_product_infos,
          (item): ProductSummaryItem => {
            return {
              skuId: item.sku_id,
              customizeCode: item.sku_code,
              skuName: item.sku_name,
              skuPriceAverage: item.product_avg,
              category: item.category_name,
              feeUnit: item.unit_measuring_name,
              feeUnitId: item.unit_measuring_id,
              orderQuantity: item.unit_quantity,
              orderUnit: item.unit_name,
              orderUnitId: item.unit_id,
              orderAmount: item.order_price,
              outstockQuantity: item.unit_outstock_quantity,
              outstockUnit: item.unit_outstock_name,
              outstockUnitId: item.unit_outstock_unit,
              outstockAmount: item.outstock_price,
            }
          },
        )
        setList(result)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [customerId, timeFilter])

  return { data: list, loading }
}

export default useProductData
