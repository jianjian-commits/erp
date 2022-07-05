import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import { Price } from '@gm-pc/react'
import { OrderSummaryItem } from './interface'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'
import {
  BillOrder_PayAndAfterState,
  BillOrder_Type,
  map_BillOrder_Type,
  map_BillOrder_PayAndAfterState,
} from 'gm_api/src/finance'
import useOrderData, { Options } from './service/use_order_data'
import _ from 'lodash'

/**
 * 按订单汇总 tab 页
 */
const OrderSummary: React.VFC<Options> = (props) => {
  const { data } = useOrderData(props)

  const columns = useMemo<ColumnsType<OrderSummaryItem>>(() => {
    return [
      {
        title: t('订单号'),
        dataIndex: 'orderNumber',
        className: 'gm-order-unit-columns',
        width: 190,
        render(_val, row) {
          if (row.businessType === BillOrder_Type.TYPE_AFTER_ORDER) {
            return row.afterSaleNumber
          }
          return row.orderNumber
        },
      },
      {
        title: t('下单时间'),
        dataIndex: 'orderTime',
      },
      {
        title: t('收货时间'),
        dataIndex: 'receivingTime',
        render(value?: string) {
          return value || '-'
        },
      },
      {
        title: t('业务类型'),
        dataIndex: 'businessType',
        render(value?: BillOrder_Type) {
          return _.get(map_BillOrder_Type, value || '', '-')
        },
      },
      {
        title: t('订单类型'),
        dataIndex: 'orderType',
        render(value?: string) {
          return value || '-'
        },
      },
      {
        title: t('支付状态/售后状态'),
        dataIndex: 'status',
        render(value?: BillOrder_PayAndAfterState) {
          return _.get(map_BillOrder_PayAndAfterState, value || '', '-')
        },
      },
      {
        title: `${t('应付金额')}（${Price.getUnit()}）`,
        dataIndex: 'amountPayable',
        render(value?: string) {
          return value || '-'
        },
      },
      {
        title: `${t('已付金额')}（${Price.getUnit()}）`,
        dataIndex: 'amountPaid',
        render(value?: string) {
          return value || '-'
        },
      },
      {
        title: `${t('未付金额')}（${Price.getUnit()}）`,
        dataIndex: 'outstandingAmount',
        render(value?: string) {
          return value || '-'
        },
      },
      {
        title: `${t('售后金额')}（${Price.getUnit()}）`,
        dataIndex: 'amountAfterSale',
        render(value?: string) {
          return value || '-'
        },
      },
    ]
  }, [])

  return (
    <>
      <h2 className='tw-text-sm tw-mb-2 tw-px-2'>账单明细</h2>
      <Table<OrderSummaryItem>
        className='tw-mb-2'
        size='small'
        rowKey='billOrderId'
        columns={columns}
        dataSource={data}
        pagination={false}
        expandable={{
          childrenColumnName: 'children',
          defaultExpandAllRows: true,
        }}
      />
    </>
  )
}

export default OrderSummary
