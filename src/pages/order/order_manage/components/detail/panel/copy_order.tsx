import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import {
  Order,
  ListOrder,
  ListOrderRequest_PagingField,
  OrderRelationInfoResponse,
  Order_Status,
} from 'gm_api/src/order'
import { Table } from '@gm-pc/table-x'
import moment from 'moment'
import SVGCopy from '@/svg/copy.svg'
import styled from 'styled-components'
import { toFixedOrder } from '@/common/util'

import CopyDetail from './components/copy_detail'
import CopyOrderConfirm from './components/copy_order_confirm'

export interface CopyOrderProps {
  customer_id: string
  service_period_id: string
}
const PrimaryTag = styled.span`
  border-left: 3px solid var(--gm-color-primary);
`
const CopyOrder: FC<CopyOrderProps> = ({ customer_id, service_period_id }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [relation, setRelation] = useState<OrderRelationInfoResponse>()

  useEffect(() => {
    ListOrder({
      paging: { offset: 0, limit: 50 },
      common_list_order: {
        service_period_id,
        receive_customer_ids: [customer_id],
        order_time_from_time: `${+moment().add(-1, 'month').toDate()}`,
        order_time_to_time: `${+new Date()}`,
      },
      relation_info: {
        need_customer_info: true,
        need_quotation_info: true,
        need_sku_info: true,
      },
      sort_by: [
        {
          field: ListOrderRequest_PagingField.ORDER_TIME,
          desc: true,
        },
      ],
    }).then((json) => {
      setRelation(json.response.relation_info)
      setOrders(json.response.orders || [])
      return null
    })
  }, [customer_id, service_period_id])

  return (
    <div style={{ maxHeight: '100%' }}>
      <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20'>
        <PrimaryTag className='gm-padding-left-5 gm-text-bold gm-text-14'>
          {t('复制订单')}（{orders.length}）
        </PrimaryTag>
      </div>
      <div className='gm-padding-bottom-20 gm-padding-lr-20'>
        <p className='gm-text-desc'>
          {t(
            '注：显示该商户此运营时间的近 50 条历史订单，仅能复制订单中的有效商品',
          )}
        </p>
        <Table<Order>
          tiled
          data={orders}
          isExpand
          SubComponent={({ original }) => {
            const dataSource =
              original?.[
                +original.status! & Order_Status.STATUS_HAS_COMBINE_SSU
                  ? 'order_raw_details'
                  : 'order_details'
              ]?.order_details
            return <CopyDetail dataSource={dataSource} />
          }}
          columns={[
            {
              Header: t('下单时间'),
              id: 'order_time',
              accessor: (d: Order) =>
                moment(new Date(+d.order_time!)).format('YYYY-MM-DD HH:mm'),
            },
            {
              width: 140,
              Header: t('订单号'),
              accessor: 'serial_no',
            },
            {
              maxWidth: 100,
              Header: t('商品数'),
              accessor: 'order_details.order_details.length',
            },
            {
              maxWidth: 100,
              Header: t('下单金额'),
              accessor: (d: Order) => toFixedOrder(+d.order_price!),
            },
            {
              width: 80,
              id: 'operation',
              Header: t('操作'),
              accessor: (d: Order) => {
                return (
                  <CopyOrderConfirm
                    order={d}
                    relation={relation}
                    customer_id={customer_id}
                    service_period_id={service_period_id}
                  >
                    <div className='gm-text-hover-primary gm-cursor gm-text-14'>
                      <SVGCopy />
                    </div>
                  </CopyOrderConfirm>
                )
              },
            },
          ]}
        />
      </div>
    </div>
  )
}

export default CopyOrder
