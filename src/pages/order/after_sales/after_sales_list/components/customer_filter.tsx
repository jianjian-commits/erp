import React, { FC, useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { Filters_Bool } from 'gm_api/src/common'
import { ListCustomer, Customer_Status } from 'gm_api/src/enterprise'

interface Props {
  value: string
  onChange: (v: string) => void
}
const CustomerFilter: FC<Props> = ({ value, onChange }) => {
  const [customers, setCustomers] = useState<MoreSelectDataItem<string>[]>([])

  const handleSearch = () => {
    ListCustomer({
      paging: { limit: 999 },
      need_service_periods: true,
      is_bill_target: Filters_Bool.ALL,
      is_ship_target: Filters_Bool.ALL,
    }).then((json) => {
      const list = (json.response.customers || [])
        .filter((v) => v.level === 2)
        .map((v) => {
          return {
            value: v.customer_id!,
            text: `${v.name!}`,
          }
        })
      setCustomers(list)
      return null
    })
  }

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    onChange(selected && selected?.value!)
  }

  useEffect(() => {
    handleSearch()
  }, [])

  const customer_selected = _.find(customers, (cu) => cu?.value! === value)

  return (
    <MoreSelect
      data={customers}
      placeholder={t('全部商户')}
      selected={customer_selected}
      onSelect={handleSelect}
    />
  )
}

export default CustomerFilter
