import { GetSkuReferencePricesFromPeriodicQuotation } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { useEffect, useState } from 'react'

interface Options {
  /**
   * 周期筛选
   */
  cycle: 3 | 6
  /**
   * 商品 id
   */
  skuId: string
  /**
   * 报价单 id
   */
  quotationId: string
}

export interface ReferencePrice {
  unit: string
  price: string
}
interface ReferencePriceShape {
  name: string
  list: ReferencePrice[]
}

const mock: ReferencePriceShape[] = [
  {
    name: '3月',
    list: [
      {
        unit: '箱',
        price: '30',
      },
      {
        unit: '包',
        price: '20',
      },
      {
        unit: '打',
        price: '10',
      },
    ],
  },
  {
    name: '4月',
    list: [
      {
        unit: '箱',
        price: '30',
      },
      {
        unit: '包',
        price: '20',
      },
      {
        unit: '件',
        price: '10',
      },
      {
        unit: '提',
        price: '20',
      },
      {
        unit: '打',
        price: '10',
      },
    ],
  },
  {
    name: '5月',
    list: [
      {
        unit: '只',
        price: '20',
      },
      {
        unit: '打',
        price: '10',
      },
    ],
  },
]

/**
 * 获取价格参考表数据
 */
function useReferencePrice(options: Options) {
  const { cycle, skuId, quotationId } = options

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReferencePriceShape[]>([])

  useEffect(() => {
    setLoading(true)
    GetSkuReferencePricesFromPeriodicQuotation({
      period: cycle,
      sku_id: skuId,
      periodic_quotation_id: quotationId,
    })
      .then((json) => {
        setData(() => {
          // 此处数据映射是防腐处理
          const result: ReferencePriceShape[] = _.map(
            json?.response?.periodic_quotation_reference_prices,
            (item) => {
              return {
                name: item?.periodic_quotation_name || '',
                list: _.map(item?.periodic_prices, (v) => ({
                  unit: v.unit || '',
                  price: v.price || '',
                })),
              }
            },
          )
          return result
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [cycle, skuId, quotationId])

  return { data, loading }
}

export default useReferencePrice
