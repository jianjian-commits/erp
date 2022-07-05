import React from 'react'
import ViewOrderNo from '../../../../components/view_order_no'
import { Select, Flex, Popover } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { orderState } from '@/pages/order/enum'
import { observer } from 'mobx-react'
import store from '../store'
import { Order_State } from 'gm_api/src/order'
import SVGAnomaly from '@/svg/triangle-warning.svg'
import { gmHistory as history } from '@gm-common/router'
import globalStore from '@/stores/global'

let currentState: number

const OrderNo = () => {
  function handleChange(value: Order_State) {
    store.updateOrderInfo('state', value)
  }
  const {
    view_type,
    state,
    serial_no,
    status,
    sign_img_url,
    customer_additional_info,
  } = store.order

  if (view_type === 'view' || state! > Order_State.STATE_RECEIVABLE) {
    currentState = 0
    // 是否显示异常
    const isShowAbnormal = !!(+status! & (1 << 14))
    return (
      <>
        <ViewOrderNo
          serial_no={serial_no}
          state={state}
          sign_img_url={sign_img_url}
          customer_img_url={
            customer_additional_info?.customer_signature?.[0]
              ?.customer_signature?.path
          }
        />
        {isShowAbnormal && (
          <Popover
            showArrow
            center
            type='hover'
            popup={
              <div className='gm-padding-10' style={{ width: '140px' }}>
                {t('该订单存在售后异常')}
              </div>
            }
          >
            <div
              className='gm-text-red gm-cursor gm-margin-left-5 gm-text-16'
              onClick={() =>
                history.push(`/order/after_sales/after_sales_list`)
              }
            >
              <SVGAnomaly />
            </div>
          </Popover>
        )}
      </>
    )
  }

  if (!currentState) currentState = state! as number

  const orderStateSelectData = globalStore.isLite
    ? [
        { value: 1, text: t('未出库') },
        { value: 3, text: t('已出库') },
        { value: 4, text: t('已签收') },
      ]
    : orderState

  return (
    <Flex alignCenter style={{ fontWeight: 400 }}>
      {serial_no} &nbsp;&nbsp;
      <Select
        style={{ minWidth: 100 }}
        value={state!}
        data={orderStateSelectData.filter((v) => v.value >= currentState)}
        onChange={handleChange}
      />
    </Flex>
  )
}

export default observer(OrderNo)
