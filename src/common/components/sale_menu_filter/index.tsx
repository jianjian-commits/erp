import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import {
  ListQuotationV2,
  Quotation,
  Quotation_Status,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import _ from 'lodash'

/**
 * 处理周期报价单
 */
function handleQuotationList(val?: Quotation[]) {
  // 父报价单 id 为 key，子报价单数据为值
  const childQuotationMap = new Map<string, Quotation[]>()
  // 报价单数据
  let list: Quotation[] = []
  // 非子报价单数据
  const dataMapping: Record<string, Quotation> = {}
  _.forEach(val, (item) => {
    if (item.parent_id && item.parent_id !== '0') {
      const key = item.parent_id
      childQuotationMap.set(key, [...(childQuotationMap.get(key) || []), item])
    } else {
      dataMapping[item.quotation_id] = item
      list.push(item)
    }
  })
  childQuotationMap.forEach((item, parentId) => {
    item.forEach((v) => {
      if (_.has(dataMapping, parentId)) {
        list.push({
          ...v,
          inner_name: `${dataMapping[parentId].inner_name}-${v.inner_name}`,
        })
      }
    })
  })
  const parentIds = [...childQuotationMap.keys()]
  list = list.filter((item) => !parentIds.includes(item.quotation_id))

  return list
}

const SaleMenuFilter = ({
  value,
  onChange,
}: {
  value: MoreSelectDataItem[]
  onChange: (v: MoreSelectDataItem[]) => void
}) => {
  const [quotations, setQuotations] = useState<MoreSelectDataItem[]>([])
  useEffect(() => {
    handleSearch()
  }, [])
  const handleSearch = async () => {
    const quotations = await ListQuotationV2({
      paging: { limit: 999 },
      filter_params: {
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
        quotation_status: Quotation_Status.STATUS_VALID,
      },
    }).then((json) => json.response.quotations)

    const list = handleQuotationList(quotations)

    const datas = _.map(list, (quotation) => ({
      ...quotation,
      value: quotation?.quotation_id || '',
      text: quotation?.inner_name || '',
    }))
    setQuotations(datas as any)
  }

  return (
    <MoreSelect
      multiple
      data={quotations}
      selected={value}
      onSearch={handleSearch}
      onSelect={onChange}
      placeholder={t('全部报价单')}
    />
  )
}

export default SaleMenuFilter
