import { t } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import { Column, Table } from '@gm-pc/table-x'
import { Card } from 'antd'

import { AfterSaleOrder_Status, ListAfterSaleOrder } from 'gm_api/src/aftersale'
import type { AfterSaleOrder } from 'gm_api/src/aftersale'
import { AfterSale_Status } from '@/pages/order/after_sales/after_sales_list/enum'
import { getUnNillText } from '@/common/util'
import moment from 'moment'
import store from '../../../components/detail/store'
import Big from 'big.js'
/** 订单售后记录 */
const AfterSaleRecord = () => {
  const [list, setList] = useState<AfterSaleOrder[]>([])

  useEffect(() => {
    fetchList()
  }, [])

  const fetchList = () => {
    return ListAfterSaleOrder({
      time_type: 1, // 按建单时间
      begin_time: '1',
      end_time: moment().format('x'), // 当前时间
      order_serial_no: store.order.serial_no,
      paging: { offset: 0, all: true },
    }).then((res) => {
      setList(res.response.after_sale_orders)
    })
  }

  const columns: Column<AfterSaleOrder>[] = [
    {
      Header: t('售后单号'),
      accessor: 'serial_no',
      minWidth: 180,
      Cell: (cellProps) => {
        const {
          original: { after_sale_order_id, serial_no, status },
        } = cellProps
        let URl = '' // draft
        if (AfterSaleOrder_Status.STATUS_TO_SUBMIT === status) {
          URl = `#/order/after_sales/after_sales_list/create?serial_no=${after_sale_order_id}&type=draft`
        } else {
          URl = `#/order/after_sales/after_sales_list/detail?serial_no=${after_sale_order_id}&type=detail`
        }
        return (
          <a
            href={URl}
            className='gm-text-primary gm-cursor'
            rel='noopener noreferrer'
            style={{ textDecoration: 'underline' }}
          >
            {serial_no}
          </a>
        )
      },
    },
    {
      Header: t('售后状态'),
      id: 'status',
      minWidth: 150,
      Cell: (cellProps) => {
        return getUnNillText(AfterSale_Status[cellProps.original.status])
      },
    },
    {
      Header: t('建单时间'),
      id: 'operation_time',
      minWidth: 200,

      Cell: (cellProps) => {
        return moment(Number(cellProps.original.create_time)).format(
          'YYYY-MM-DD HH:mm',
        )
      },
    },
    {
      Header: t('售后金额'),
      id: 'apply_return_amount',
      minWidth: 200,
      accessor: 'apply_return_amount',
      Cell: (cellProps) => {
        return Big(Number(cellProps.original.apply_return_amount) || 0).toFixed(
          2,
        )
      },
    },
    {
      Header: t('单据备注'),
      id: 'remark',
      minWidth: 200,
      accessor: 'remark',
      Cell: (cellProps) => {
        return getUnNillText(cellProps.original.remark)
      },
    },
  ]

  return (
    <Card
      className='gm-site-card-border-less-wrapper-165'
      bodyStyle={{ padding: '30px 10px' }}
    >
      <Table
        id='log_list'
        keyField='log_id'
        data={list}
        columns={columns}
        headerProps={{ hidden: true }}
        isPagination={false}
      />
    </Card>
  )
}

export default AfterSaleRecord
