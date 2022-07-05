import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Flex, Button, Confirm, Modal, Tip, FunctionSet } from '@gm-pc/react'
import _ from 'lodash'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { UpdateOrderDetail, Order_State, Order_Status } from 'gm_api/src/order'
import store from '../store'
import Big from 'big.js'
import OrderPrintModalNew from '@/pages/delivery/components/order_print_modal_new/order_print_modal_new'
import deliveryOrderStore from '@/pages/delivery/components/order_print_modal_new/store'
import { Quotation_Type } from 'gm_api/src/merchandise'
import CopyOrderConfirm from '@/pages/order/order_manage/components/detail/panel/components/copy_order_confirm'

const Action = () => {
  const { order, list, hasEditPermission, relation } = store
  const ssus = list.filter((v) => v.sku_id && v.unit_id)
  const [saving, setSaving] = useState(false)
  const location = useGMLocation<{ id: string }>()

  function handleBack() {
    if (store.order.view_type === 'edit') {
      Confirm({
        title: t('提示'),
        children: t('确认放弃此次修改吗？'),
      }).then(() => {
        store.fetchOrder(location.query.id)
        return null
      })
    } else {
      history.goBack()
    }
  }

  function handleEdit() {
    store.updateOrderInfo('view_type', 'edit')
  }

  async function handleSave() {
    setSaving(true)
    const params = await store.getUpdateParams()
    const res = await UpdateOrderDetail({
      order: params,
    })

    setSaving(false)
    return res
  }

  function checkDetail() {
    const nullQuantitySsus = _.filter(
      ssus,
      (ssu) =>
        !ssu.quantity ||
        ssu.quantity === null ||
        Big(ssu.quantity || '0').toFixed(4) === '0.0000',
    )

    const nullPriceSsus = _.filter(
      ssus,
      (ssu) => !ssu.price || Big(ssu.price || '0').toFixed(4) === '0.0000',
    )

    if (nullQuantitySsus.length) {
      return t('当前存在商品下单数为0或为空，请修改后重新保存。')
    }

    if (nullPriceSsus.length) {
      return t('当前存在商品单价为0或为空，请修改后重新保存。')
    }

    return null
  }

  async function handleEditSave() {
    const msg = checkDetail()
    if (msg) {
      Tip.danger(msg)
      return
    }
    // 订单校验：单价不能为空为0
    handleSave().then(async () => {
      Tip.success('更新成功')
      await store.fetchOrder(location.query.id)
      const { quotation_type, status, serial_no } = store.order
      const isMenuOrder =
        quotation_type === Quotation_Type.WITH_TIME ||
        +status! & Order_Status.STATUS_HAS_COMBINE_SSU
      const temp = true
      if (!temp) history.push(`/order/order_manage/list/detail?id=${serial_no}`)
      return null
    })
  }

  function handlePrint() {
    const {
      printModalOptions: { needPopUp },
      goToPrint,
    } = deliveryOrderStore
    if (needPopUp) {
      goToPrint(JSON.stringify({ order_ids: [order.order_id] }))
    } else {
      Modal.render({
        onHide: Modal.hide,
        size: 'lg',
        noContentPadding: true,
        children: (
          <OrderPrintModalNew
            onHide={Modal.hide}
            query={JSON.stringify({ order_ids: [order.order_id] })}
          />
        ),
      })
    }
  }

  return (
    <Flex row justifyEnd alignCenter>
      {order.view_type === 'view' && (
        <>
          <Button
            onClick={handleEdit}
            disabled={
              Boolean(+order?.status! & (1 << 15)) ||
              order.state === Order_State.STATE_DELETE ||
              !hasEditPermission
            }
            className='gm-margin-right-10'
            type='primary'
          >
            {order.state! >= Order_State.STATE_DELIVERYING
              ? t('追加修改')
              : t('修改')}
          </Button>
          {order.quotation_type !== Quotation_Type.WITH_TIME && (
            <CopyOrderConfirm
              order={order}
              relation={relation}
              customer_id={order.customer?.customer_id}
              service_period_id={order.service_period_id}
            >
              <Button className='gm-margin-right-10'>{t('复制')}</Button>
            </CopyOrderConfirm>
          )}

          <Button className='gm-margin-right-10' onClick={handlePrint}>
            {t('打印')}
          </Button>
          <FunctionSet
            right
            data={[
              {
                text: t('售后'),
                onClick: () =>
                  history.push(
                    `/order/after_sales/after_sales_list/create?order_id=${order.serial_no}&type=create`,
                  ),
              },
            ]}
          />
        </>
      )}
      {order.view_type !== 'view' && (
        <Button className='gm-margin-right-10' onClick={handleBack}>
          {t('取消')}
        </Button>
      )}
      {order.view_type === 'edit' && (
        <Button
          type='primary'
          className='gm-margin-right-10'
          disabled={saving || !order.service_period_id || !ssus.length}
          onClick={handleEditSave}
        >
          {t('保存')}
        </Button>
      )}
    </Flex>
  )
}

export default observer(Action)
