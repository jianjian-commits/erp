import React, { FC } from 'react'
import { Popover, Flex } from '@gm-pc/react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Table } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import { Order, Order_State } from 'gm_api/src/order'
import store from '../store'
import { getOrderUnitName } from '@/pages/order/util'
import Warning from '@/img/warning.png'

const OrderBelongPop: FC<{ orders: Order[] }> = ({ orders }) => {
  const order_num = _.uniqBy(orders, 'order_id').length
  const { customers } = store
  return (
    <Popover
      type='hover'
      popup={
        <div
          className='gm-border'
          style={{ maxHeight: 300, overflowY: 'scroll' }}
        >
          <Table<Order>
            data={orders.slice()}
            columns={[
              {
                Header: t('订单号'),
                accessor: 'serial_no',
                minWidth: 120,
                Cell: (cell) => {
                  const order = cell.original
                  if (order.state === Order_State.STATE_RECEIVABLE)
                    return (
                      <div>
                        <span
                          className='gm-margin-right-5'
                          style={{ lineHeight: '20px' }}
                        >
                          {order.serial_no}
                        </span>
                        <Popover
                          type='hover'
                          popup={t('已签收的订单无法替换商品')}
                        >
                          <img src={Warning} />
                        </Popover>
                      </div>
                    )
                  return order.serial_no
                },
              },
              {
                Header: t('客户名'),
                id: 'resname',
                minWidth: 120,
                accessor: (d) => (
                  <div>{customers[d.receive_customer_id!]?.name || '-'}</div>
                ),
              },
              {
                Header: t('下单数'),
                id: 'order_unit_value_v2.quantity.val',
                minWidth: 120,
                accessor: (d) => {
                  const detail = (d.order_details?.order_details || [])[0]
                  if (!detail) return '-'
                  const unitValue = detail.order_unit_value_v2
                  const units = detail?.unit_cal_info?.unit_lists
                  const unit = units?.find(
                    (unit) => unit.unit_id === detail.unit_id,
                  )!
                  const parentUnit = units?.find(
                    (parentUnit) => parentUnit.unit_id === unit?.parent_id,
                  )!
                  const quantity = +unitValue?.quantity?.val! || 0
                  return quantity + getOrderUnitName(parentUnit, unit)!
                },
              },
            ]}
          />
        </div>
      }
    >
      <Flex>
        <a style={{ textDecoration: 'underline' }}>
          {t('共')}
          {order_num}
          {t('个订单')}
        </a>
      </Flex>
    </Popover>
  )
}

export default observer(OrderBelongPop)
