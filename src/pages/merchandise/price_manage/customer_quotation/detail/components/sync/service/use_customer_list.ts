import { Filters_Bool } from 'gm_api/src/common'
import { ListCustomer } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { useCallback, useState } from 'react'

interface QueryCustomerListParams {
  /**
   * 报价单
   */
  quotationId: string
  /**
   * 搜索关键字
   */
  keyword?: string
}

export interface CustomerOption {
  label: string
  value: string | number
}

/**
 * 获取商户列表用于 Select 组件
 */
async function getCustomerOptionList(params: QueryCustomerListParams) {
  const { quotationId, keyword } = params
  const { response } = await ListCustomer({
    paging: { limit: 999, offset: 0 },
    quotation_ids: [quotationId],
    q: keyword,
    level: 2,
    // bind_quotation_periodic: Filters_Bool.TRUE,
  })

  const options = _.map(
    response.customers,
    (item): CustomerOption => ({
      label: item.name,
      value: item.customer_id,
    }),
  )

  return options
}

const EMPTY_ARR = Object.freeze([]) as unknown as CustomerOption[]

/**
 * 获取商户列表用于 Select 组件
 */
function useCustomerOptionList() {
  const [options, setOptions] = useState<CustomerOption[]>(EMPTY_ARR)

  const onSearch = useCallback((params: QueryCustomerListParams) => {
    const { quotationId } = params
    if (typeof quotationId !== 'string' || quotationId.trim().length === 0) {
      return
    }
    setOptions(EMPTY_ARR)
    getCustomerOptionList(params).then(setOptions)
  }, [])

  return [options, onSearch] as const
}

export default useCustomerOptionList
