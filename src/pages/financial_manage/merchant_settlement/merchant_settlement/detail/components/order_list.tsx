import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { Column, Table } from '@gm-pc/table-x'
import moment from 'moment'
import Big from 'big.js'
import { Price } from '@gm-pc/react'
import { DetailListOptions } from '../interface'

const List: FC = observer(() => {
  const { detail_list } = store

  const columns: Column<DetailListOptions>[] = [
    {
      Header: <div className='text-center'>{t('序号')}</div>,
      accessor: 'sequence',
      minWidth: 50,
      Cell: (cellProps) => (
        <div className='text-center'>{cellProps.index + 1}</div>
      ),
    },
    {
      Header: t('订单号'),
      accessor: 'serial_no',
      minWidth: 100,
      Cell: (cellProps) => {
        const { serial_no } = cellProps.original
        return (
          <a
            href={`#/order/order_manage/list/detail?id=${serial_no}`}
            className='gm-text-primary gm-cursor'
            rel='noopener noreferrer'
            // target='_blank'
            style={{ textDecoration: 'underline' }}
          >
            {serial_no}
          </a>
        )
      },
    },
    {
      Header: t('客户名称'),
      accessor: 'customer',
      minWidth: 100,
      Cell: (cellProps) => {
        const { customer } = cellProps.original
        return customer || '-'
      },
    },
    {
      Header: t('销售额'),
      accessor: 'sale_price',
      minWidth: 100,
      Cell: (cellProps) => {
        const { sale_price } = cellProps.original
        return Big(sale_price || 0).toFixed(2) + Price.getUnit()
      },
    },
    {
      Header: t('不含税销售额'),
      accessor: 'sale_price_no_tax',
      minWidth: 100,
      Cell: (cellProps) => {
        const { sale_price_no_tax } = cellProps.original
        return Big(sale_price_no_tax || 0).toFixed(2) + Price.getUnit()
      },
    },
    {
      Header: t('税额'),
      accessor: 'detail_sum_tax_price',
      minWidth: 100,
      Cell: (cellProps) => {
        const { detail_sum_tax_price } = cellProps.original
        return Big(detail_sum_tax_price || 0).toFixed(2) + Price.getUnit()
      },
    },
    {
      Header: t('下单日期'),
      accessor: 'create_time',
      minWidth: 100,
      Cell: (cellProps) => {
        const { create_time } = cellProps.original
        return moment(+create_time!).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    {
      Header: t('订单备注'),
      accessor: 'remark',
      minWidth: 100,
      Cell: (cellProps) => {
        const { remark } = cellProps.original
        return remark || '-'
      },
    },
  ]

  return (
    <Table
      columns={columns}
      data={detail_list.slice()}
      id='order_list'
      keyField='order_no'
    />
  )
})

export default List
