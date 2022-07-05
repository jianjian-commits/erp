import { t } from 'gm-i18n'
import React, { useMemo, useState } from 'react'
import { RightSideModal, Button, Tip } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from '../store'
import { Order_State, Order_Status, UpdateOrderDetail } from 'gm_api/src/order'
import { useGMLocation } from '@gm-common/router'
import CopyOrder from './copy_order'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import FrequentSsu from '@/pages/order/order_manage/components/detail/list/components/cell_frequent_ssu'
import {
  mergeOrderDetails,
  wrapOrderDetail,
} from '@/pages/order/order_manage/components/detail/util'
import SmartAddFakeOrder from '../../smart_add_fake_order'
import PermissionJudge from '@/common/components/permission_judge'
import { isCombineSku } from '@/pages/order/util'
import { Quotation_Type } from 'gm_api/src/merchandise'

const Operation = observer(() => {
  const [isRankSaving, setRankSavingState] = useState(false)
  const location = useGMLocation<{ id: string }>()
  const { isRanking, order } = store
  const { view_type } = order
  const handleCopyOrder = () => {
    RightSideModal.render({
      children: (
        <CopyOrder
          customer_id={order.customer?.customer_id!}
          service_period_id={order.service_period_id}
        />
      ),
      onHide: RightSideModal.hide,
      opacityMask: false,
      style: {
        width: '630px',
      },
    })
  }

  function handleSave() {
    setRankSavingState(true)
    const { order, list } = store
    const { view_type, customer, ...rest } = order
    let order_details = []
    if (globalStore.isLite) {
      order_details = list.find((sku) => isCombineSku(sku))
        ? mergeOrderDetails(
            wrapOrderDetail(
              list.filter((v) => v.sku_id && v.unit_id && !isCombineSku(v)),
              'orderDetail',
            ),
          )
        : wrapOrderDetail(
            list.filter((v) => v.sku_id && v.unit_id && !v.parentId),
            'orderDetail',
          )
    } else {
      order_details = wrapOrderDetail(
        list.filter((v) => v.sku_id && v.unit_id && !isCombineSku(v)),
        'orderDetail',
      )
    }
    UpdateOrderDetail({
      order: {
        ..._.omit(rest, 'quotation_id'),
        // service_period: rest.service_period!,
        // receive_time: rest.receive_time!,
        order_raw_details: {
          order_details: wrapOrderDetail(
            list.filter((v) => v.sku_id && v.unit_id && !v.parentId),
            'orderRawDetail',
          ),
        },
        // order_details,不传组合商品。  --原料以及单品相同时累加
        order_details: {
          order_details: order_details,
        },
      },
    }).then(() => {
      store.fetchOrder(location.query.id)
      setRankSavingState(false)
      store.setRanking(false)
      return null
    })
  }

  function handleSequence() {
    if (+order.status! & Order_Status.STATUS_HAS_COMBINE_SSU) {
      Tip.danger(t('订单存在组合商品不允许排序'))
      return
    }
    store.setRanking(true)
  }

  const renderFrequentSsu = () => {
    RightSideModal.render({
      children: <FrequentSsu />,
      onHide: RightSideModal.hide,
      opacityMask: false,
      style: {
        width: '630px',
      },
    })
  }

  const [visibleAddFakeOrder, setVisibleAddFakeOrder] = useState(false)

  // 显示智能加单
  const showFakeOrderAction =
    !globalStore.isLite &&
    view_type !== 'view' &&
    order.quotation_type !== Quotation_Type.WITH_TIME

  return (
    <div>
      {showFakeOrderAction && (
        <PermissionJudge
          tag={null}
          permission={Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS}
        >
          <Button
            className='gm-margin-right-10'
            type='primary'
            onClick={() => setVisibleAddFakeOrder(true)}
          >
            {t('智能加单')}
          </Button>
        </PermissionJudge>
      )}
      {view_type === 'view' &&
      order.state !== Order_State.STATE_DELETE &&
      globalStore.hasPermission(Permission.PERMISSION_ORDER_UPDATE_ORDER) ? (
        isRanking ? (
          <Button
            loading={isRankSaving}
            onClick={handleSave}
            className='gm-margin-right-10'
          >
            {t('保存顺序')}
          </Button>
        ) : (
          <Button
            type='primary'
            onClick={handleSequence}
            className='gm-margin-right-10'
          >
            {t('修改顺序')}
          </Button>
        )
      ) : null}
      {view_type === 'create' && (
        <>
          <Button
            className='gm-margin-right-10'
            type='primary'
            onClick={renderFrequentSsu}
          >
            {t('常购商品')}
          </Button>
          <Button type='primary' onClick={handleCopyOrder}>
            {t('复制订单')}
          </Button>
        </>
      )}
      {!globalStore.isLite && view_type !== 'view' && (
        <PermissionJudge
          tag={null}
          permission={Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS}
        >
          <SmartAddFakeOrder
            visible={visibleAddFakeOrder}
            onClose={() => setVisibleAddFakeOrder(false)}
          />
        </PermissionJudge>
      )}
    </div>
  )
})

export default Operation
