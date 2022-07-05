import { toFixedOrder } from '@/common/util'
import { businessTypeMap } from '@/pages/financial_manage/settlement_manage/customer_settlement/constant'

import { Input } from '@gm-pc/react'
import { Table, TableColumnType } from 'antd'
import { t } from 'gm-i18n'
import {
  BillOrder_Type,
  map_BillOrder_PayAndAfterState,
  SettleSheetDetail,
} from 'gm_api/src/finance'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { useEffect } from 'react'

import { DetailListItem } from '../../interface'
import store from '../../store'

export default observer(() => {
  const columns: TableColumnType<SettleSheetDetail>[] = [
    {
      title: t('订单号'),
      dataIndex: 'order_no',
      key: 'order_no',
      className: 'gm-order-unit-columns',
      render: (value, record) =>
        record.type === BillOrder_Type.TYPE_AFTER_ORDER
          ? record.after_sale_no
          : record.order_no,
    },
    {
      title: t('下单时间'),
      dataIndex: 'order_time',
      key: 'order_time',
      render: (value, record) =>
        moment(+record.order_time!).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('业务类型'),
      dataIndex: 'type',
      key: 'type',
      render: (value) => businessTypeMap[value],
    },
    {
      title: t('支付状态/售后状态'),
      dataIndex: 'pay_after_state',
      key: 'pay_after_state',
      render: (value) => map_BillOrder_PayAndAfterState[value],
    },
    {
      title: t('应付金额（元）'),
      dataIndex: 'outstock_price',
      key: 'outstock_price',
      render: (_, record) => toFixedOrder(+record.outstock_price!),
    },
    {
      title: t('已付金额（元）'),
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      render: (_, record) => toFixedOrder(+record.paid_amount!),
    },
    {
      title: t('未付金额（元）'),
      dataIndex: 'unPay_amount',
      key: 'unPay_amount',
      render: (_, record) =>
        toFixedOrder(+record.outstock_price! - +record.paid_amount!),
    },
    {
      title: t('售后金额（元）'),
      dataIndex: 'order_after_sale_price',
      key: 'order_after_sale_price',
      render: (_, record) => toFixedOrder(+record.order_after_sale_price!),
    },
    {
      title: t('结款金额'),
      dataIndex: 'settle_price',
      key: 'settle_price',
      render: (_, record) => toFixedOrder(+record.settle_price!),
    },
  ]
  return (
    <Table<SettleSheetDetail>
      className='gm-padding-top-20'
      size='small'
      rowKey='id'
      columns={columns}
      dataSource={store.dataSourceDetail}
      //   expandable={{
      //     childrenColumnName: 'children',
      //     defaultExpandAllRows: true,
      //   }}
      pagination={false}
      //   rowSelection={rowSelection}
    />
  )
})
