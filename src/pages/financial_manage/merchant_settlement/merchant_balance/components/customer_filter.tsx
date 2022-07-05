import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect } from '@gm-pc/react'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { ListCustomer, Customer_Type } from 'gm_api/src/enterprise'

const CustomerFilter = (props: {
  value: MoreSelectDataItem<string>[]
  onChange: (v: MoreSelectDataItem<string>[]) => void
}) => {
  const [customers, setCustomerList] = useState<MoreSelectDataItem<string>[]>(
    [],
  )
  function handleSearch() {
    ListCustomer({
      paging: { limit: 999 },
      type: Customer_Type.TYPE_SOCIAL,
      level: 1,
    }).then((json) => {
      const list = (json.response.customers || []).map((v) => {
        return {
          value: v.customer_id!,
          text: `${v.name!}(${v.customized_code})`,
        }
      })
      setCustomerList(list)
      return null
    })
  }
  function handleSelect(v: MoreSelectDataItem<string>[]) {
    props.onChange(v)
  }

  useEffect(() => {
    handleSearch()
  }, [])

  return (
    <MoreSelect
      // multiple
      data={customers}
      placeholder={t('全部商户')}
      selected={props.value}
      onSelect={handleSelect}
    />
  )
}

export default CustomerFilter
