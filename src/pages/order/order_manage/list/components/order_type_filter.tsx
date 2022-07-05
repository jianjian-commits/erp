import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { ListCustomizeType } from 'gm_api/src/order'

interface OrderTypeFilterProps {
  value: MoreSelectDataItem[]
  onChange: (v: MoreSelectDataItem[]) => void
}

const OrderTypeFilter: React.VFC<OrderTypeFilterProps> = ({
  onChange,
  value,
}) => {
  const [orderTypes, setOrderTypes] = useState<MoreSelectDataItem[]>([])

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = () => {
    ListCustomizeType().then((res) => {
      setOrderTypes(
        res.response.customize_types.map((item) => ({
          value: item.customize_type_id,
          text: item.name!,
        })),
      )
    })
  }
  return (
    <MoreSelect
      multiple
      data={orderTypes}
      selected={value}
      onSearch={handleSearch}
      onSelect={onChange}
      placeholder={t('全部订单类型')}
    />
  )
}

export default OrderTypeFilter
