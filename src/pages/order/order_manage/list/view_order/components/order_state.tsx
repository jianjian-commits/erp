import React, { FC } from 'react'
import { Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { orderStateBusiness, orderState4Light } from '../../../../enum'
import store from '../store'
import type { OrderInfoViewOrder } from '../interface'
import { Order_State, map_Order_State } from 'gm_api/src/order'
import globalStore from '@/stores/global'

const orderStateSelectData = globalStore.isLite
  ? [
      { value: 1, text: t('未出库') },
      { value: 3, text: t('已出库') },
    ]
  : orderStateBusiness

const OrderState: FC<{ order: OrderInfoViewOrder; index: number }> = ({
  index,
}) => {
  const order = store.list[index]
  function handleChange(v: number) {
    store.updateOrder(index, 'state', v)
  }

  const orderState = globalStore.isLite
    ? orderState4Light[order.state as keyof typeof orderState4Light]
    : map_Order_State[order.state! as Order_State]

  if (order.editing) {
    return (
      <div>
        <Select
          value={order.state}
          style={{ minWidth: '80px' }}
          data={orderStateSelectData.filter(
            (v) => v.value >= (order.tempStateFe || 0),
          )}
          onChange={handleChange}
        />
      </div>
    )
  } else {
    return (
      <div>{orderState || t('未知') + `(${order.sorting_num || '-'})`}</div>
    )
  }
}

export default observer(OrderState)
