import React from 'react'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from '../store'
import {
  Order_State,
  UpdateOrder,
  Order_PayState,
  UpdateOrderPartField,
} from 'gm_api/src/order'
import { Tip, Flex } from '@gm-pc/react'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import _ from 'lodash'
const { OperationDelete, OperationCellRowEdit } = TableXUtil

const Operation = observer((props: { index: number }) => {
  function handleEdit() {
    const { status } = store.list[props.index]
    if (Number(status)! & (1 << 8)) {
      Tip.danger(t('订单已加入对账单，不能编辑'))
      return
    }
    store.updateOrder(props.index, 'editing', true)
  }

  function handleDelete() {
    const { editing, customer, status, ...rest } = store.list[props.index]
    if (Number(status)! & (1 << 8)) {
      Tip.danger(t('订单已加入对账单，不能删除'))
      return
    }

    return UpdateOrder({
      order: {
        ..._.omit(rest, ['quotation_id', 'quotation']),
        state: Order_State.STATE_DELETE,
      },
    }).then(() => {
      Tip.success('订单删除成功')
      store.doRequestAfterDelete(store.list, 1)
      return null
    })
  }

  function handleClose() {
    store.doRequest()
  }

  function handleSave() {
    const { order_id, state: order_state } = store.list[props.index]
    UpdateOrderPartField({ order_ids: [order_id], order_state }).then((res) => {
      Tip.success('更新成功')
      handleClose()
      return null
    })
  }

  const order = store.list[props.index]
  if (order.state === Order_State.STATE_DELETE) return <Flex>-</Flex>

  const renderOperationDelete = () => {
    return (
      <OperationDelete
        disabled={
          !globalStore.hasPermission(Permission.PERMISSION_ORDER_DELETE_ORDER)
        }
        title='警告'
        onClick={() => handleDelete()}
      >
        {t('订单删除之后无法恢复，是否确认删除？')}
      </OperationDelete>
    )
  }

  return (
    <>
      {/* lite有售后，可以改订单状态 */}
      {/* 已签收不能edit */}
      {order.state !== Order_State.STATE_RECEIVABLE || !!order.editing ? (
        +order?.status! & (1 << 14) ? (
          ''
        ) : (
          <OperationCellRowEdit
            disabled={
              !globalStore.hasPermission(
                Permission.PERMISSION_ORDER_UPDATE_ORDER,
              )
            }
            isEditing={!!order.editing}
            onClick={() => {
              handleEdit()
            }}
            onCancel={() => {
              handleClose()
            }}
            onSave={() => {
              handleSave()
            }}
          >
            {/* 轻巧版已支付不能删除 */}
            {(globalStore.isLite &&
              Order_PayState.PAYSTATE_PAID === order.pay_state) ||
            order.app_type === 4
              ? ''
              : renderOperationDelete()}
          </OperationCellRowEdit>
        )
      ) : +order?.status! & (1 << 14) ? (
        ''
      ) : (
        order.app_type !== 4 && renderOperationDelete()
      )}
    </>
  )
})

export default Operation
