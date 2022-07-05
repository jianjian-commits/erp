import type { DefaultOptionType } from 'antd/lib/select'
import { ListQuotationV2, Quotation_Type } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { useEffect, useRef, useState } from 'react'

interface Params {
  /**
   * 是否发送请求
   * 为 false 时，永不发送
   * 为 true  时，发送请求
   *
   * @default false
   */
  ready?: boolean
  /**
   * 是否只请求一次，否则每次 ready 变为 true 都将发起一次请求
   *
   * @default false
   */
  once?: boolean
}

/**
 * 获取周期报价单列表
 * 并转为 options（Select 组件用）
 */
function usePeriodicQuotationsOptions(params?: Params) {
  const { ready = false, once = true } = params || {}
  const [options, setOptions] = useState<DefaultOptionType[]>([])

  // 缓存 once 的值，once 不需要受控
  const cacheOnceValue = useRef(once)
  // 禁用请求
  const disabled = useRef(false)

  useEffect(() => {
    if (!ready || disabled.current) {
      return
    }
    ListQuotationV2({
      filter_params: {
        quotation_type: Quotation_Type.PERIODIC,
      },
      // @ts-ignore
      paging: { all: true },
    }).then((json) => {
      const { response } = json
      setOptions(() => {
        const list = _.filter(
          response.quotations,
          // parent_id 表示父报价单 id，此处不需要周期报价单中的子报价单，因此过滤掉
          (item) => `${item.parent_id}` === '0',
        )
        return _.map(list, (item): DefaultOptionType => {
          return {
            value: item.quotation_id,
            label: item.inner_name,
          }
        })
      })
      if (cacheOnceValue.current) {
        disabled.current = true
      }
    })
  }, [ready])

  return options
}

export default usePeriodicQuotationsOptions
