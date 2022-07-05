import { t } from 'gm-i18n'
import React, { ChangeEvent } from 'react'
import { Flex, Input, Popover } from '@gm-pc/react'
import { observer } from 'mobx-react'
import store from '../store'
import { App_Type } from 'gm_api/src/common'

const OrderComment = () => {
  const handleCommentChange = (e: ChangeEvent<HTMLInputElement>) => {
    store.updateOrderInfo('remark', e.target.value)
  }
  const { order } = store
  if (order.view_type === 'view') {
    return order.remark ? (
      <Popover
        showArrow
        center
        type='click'
        popup={
          <div className='gm-padding-10' style={{ width: '300px' }}>
            {order.remark || '-'}
          </div>
        }
      >
        <span className='b-ellipsis-order-remark'>{order.remark || '-'}</span>
      </Popover>
    ) : (
      <Flex alignCenter>{order.remark || '-'}</Flex>
    )
  }
  return (
    <Flex flex alignCenter>
      <Input
        type='text'
        disabled={
          !order.service_period_id || store.type === App_Type.TYPE_ESHOP
        }
        value={order.remark}
        placeholder={t('输入商家对订单的特殊要求（128个字以内）')}
        maxLength={128}
        className='form-control input-sm'
        onChange={handleCommentChange}
      />
    </Flex>
  )
}

export default observer(OrderComment)
