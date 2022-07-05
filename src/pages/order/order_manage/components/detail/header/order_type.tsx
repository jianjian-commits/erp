import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Flex, MoreSelect, MoreSelectDataItem, Select } from '@gm-pc/react'
import { observer } from 'mobx-react'
import store from '../store'
import { App_Type } from 'gm_api/src/common'
import { ListCustomizeType } from 'gm_api/src/order'

const OrderType: React.VFC = (props) => {
  const [orderTypes, setOrderTypes] = useState<MoreSelectDataItem[]>([])
  const { customize_type_id, view_type } = store.order

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = () => {
    ListCustomizeType().then((res) => {
      setOrderTypes(
        [{ text: t('无'), value: '' }].concat(
          res.response.customize_types.map((item) => ({
            value: item.customize_type_id,
            text: item.name!,
          })),
        ),
      )
    })
  }

  const handleChange = (value: string) => {
    store.updateOrderInfo('customize_type_id', value)
  }
  if (view_type === 'view') {
    return (
      <Flex alignCenter>
        {orderTypes.find((item) => item.value === customize_type_id)?.text ||
          '-'}
      </Flex>
    )
  }
  return (
    <Select
      style={{ minWidth: 250 }}
      data={orderTypes}
      value={customize_type_id}
      onChange={handleChange}
      placeholder={t('全部订单类型')}
      disabled={
        !store.order.service_period_id || store.type === App_Type.TYPE_ESHOP
      }
    />
  )
}

export default observer(OrderType)
