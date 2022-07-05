import { toFixedOrder } from '@/common/util'
import {
  AllSelect_Types,
  businessTypeMap,
  Business_Type,
  dataSource,
  Is_Batch,
} from '@/pages/financial_manage/settlement_manage/customer_settlement/constant'
import {
  DataType,
  DetailList,
} from '@/pages/financial_manage/settlement_manage/customer_settlement/interface'
import { orderPayStateMap } from '@/pages/order/enum'
import { useGMLocation } from '@gm-common/router'
import { Flex, InputNumber } from '@gm-pc/react'
import { Table, TableColumnType } from 'antd'
import Big from 'big.js'
import { t } from 'gm-i18n'
import {
  BillOrder,
  BillOrder_Type,
  map_BillOrder_PayAndAfterState,
} from 'gm_api/src/finance'
import _ from 'lodash'
import { Observer, observer } from 'mobx-react'
import moment from 'moment'
import React, { useEffect } from 'react'
import store from '../../store'

export default observer(() => {
  const { query } = useGMLocation<{
    bill_order_id: string
    allSelectType: AllSelect_Types
    isBatch: Is_Batch
  }>()

  useEffect(() => {
    store.fetchDetailList(query.isBatch, query.bill_order_id.split(','))
  }, [])

  const columns: TableColumnType<BillOrder>[] = [
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
      title: t('客户名'),
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: t('公司名称'),
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: t('下单时间'),
      dataIndex: 'order_time',
      key: 'order_time',
      render: (value, record) =>
        moment(
          +(
            record.type === BillOrder_Type.TYPE_AFTER_ORDER
              ? record.after_sale_create_time
              : record.order_time
          )!,
        ).format('YYYY-MM-DD HH:mm'),
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
      dataIndex: 'non_pay_amount',
      key: 'non_pay_amount',
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
      render: (value, record, index) => {
        return (
          <Observer>
            {() => {
              const showNegative =
                record.type! === BillOrder_Type.TYPE_AFTER_ORDER
              return (
                <Flex>
                  <div style={{ width: 5, marginRight: 10 }}>
                    {showNegative ? '-' : ''}
                  </div>
                  <InputNumber
                    value={value}
                    precision={2}
                    max={
                      record.type === BillOrder_Type.TYPE_AFTER_ORDER
                        ? +record.order_after_sale_price!
                        : +record.outstock_price! - +record.paid_amount! < 0
                        ? 0
                        : +record.outstock_price! - +record.paid_amount!
                    }
                    min={
                      record.type === BillOrder_Type.TYPE_SALE_ORDER &&
                      +record.outstock_price! - +record.paid_amount! < 0
                        ? +record.outstock_price! - +record.paid_amount!
                        : 0
                    }
                    onChange={(v) => {
                      // 还需要联动修改header总的结款金额
                      store.updateDataSource4Detail(index, 'settle_price', v)
                      store.updateDetailHeader(
                        'total_price',
                        _.reduce(
                          store.dataSource4Detail,
                          (pre, cur, i) => {
                            return cur.type === BillOrder_Type.TYPE_AFTER_ORDER
                              ? +Big(pre).minus(
                                  index === i ? v || 0 : cur.settle_price || 0,
                                )
                              : +Big(pre).plus(
                                  index === i ? v || 0 : cur.settle_price || 0,
                                )
                          },
                          0,
                        ),
                      )
                    }}
                  />
                </Flex>
              )
            }}
          </Observer>
        )
      },
    },
  ]
  return (
    <Table<BillOrder>
      className='gm-padding-top-20'
      size='small'
      rowKey='id'
      columns={columns}
      dataSource={store.dataSource4Detail}
      expandable={{
        childrenColumnName: 'children',
        defaultExpandAllRows: true,
      }}
      pagination={false}
      //   rowSelection={rowSelection}
    />
  )
})
