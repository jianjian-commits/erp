import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { TableList } from '@gm-pc/business'
import { observer } from 'mobx-react'
import Big from 'big.js'
import store from '../store'

const List: FC = observer(({ ...res }) => {
  const Cell = (cellProps: any) =>
    Big(cellProps.value || 0).toFixed(2) + t('元')

  const columns = [
    {
      Header: t('商户编码'),
      id: 'receive_customer_code',
      accessor: 'receive_customer_code',
      minWidth: 100,
    },

    {
      Header: t('商户名'),
      id: 'receive_customer_name',
      accessor: 'receive_customer_name',
      minWidth: 100,
    },

    {
      Header: t('下单金额'),
      id: 'order_price_sum',
      accessor: 'order_price_sum',
      minWidth: 130,
      Cell,
    },
    {
      Header: t('出库金额'),
      id: 'outstock_price_sum',
      accessor: 'outstock_price_sum',
      minWidth: 150,
      Cell,
    },

    {
      Header: t('销售额'),
      id: 'sale_price_sum',
      accessor: 'sale_price_sum',
      minWidth: 120,
      Cell,
    },
    {
      Header: t('运费'),
      id: 'freight_price_sum',
      accessor: 'freight_price_sum',
      minWidth: 120,
      Cell,
    },
    {
      Header: t('加单金额1'),
      id: 'add_order_price1_sum',
      accessor: 'add_order_price1_sum',
      minWidth: 120,
      Cell,
    },
    {
      Header: t('加单金额2'),
      id: 'add_order_price2_sum',
      accessor: 'add_order_price2_sum',
      minWidth: 120,
      Cell,
    },
    {
      Header: t('加单金额3'),
      id: 'add_order_price3_sum',
      accessor: 'add_order_price3_sum',
      minWidth: 120,
      Cell,
    },
    {
      Header: t('加单金额4'),
      id: 'add_order_price4_sum',
      accessor: 'add_order_price4_sum',
      minWidth: 120,
      Cell,
    },
    {
      Header: t('总加单金额'),
      id: 'total_add_order_price_sum',
      accessor: 'total_add_order_price_sum',
      minWidth: 120,
      Cell,
    },
    {
      Header: t('套账下单金额'),
      id: 'fake_order_price_sum',
      accessor: 'fake_order_price_sum',
      minWidth: 120,
      Cell,
    },
    {
      Header: t('套账出库金额'),
      id: 'fake_outstock_price_sum',
      accessor: 'fake_outstock_price_sum',
      minWidth: 120,
      Cell,
    },
  ]

  return (
    <TableList
      {...res}
      filter={store.filter}
      service={store.fetchList}
      keyField='id'
      id='set_of_accounts_data'
      data={store.list}
      isDiy
      formatData={(data) => data.data}
      columns={columns}
      paginationOptions={{
        paginationKey: 'set_of_accounts_data',
        defaultPaging: { need_count: true },
      }}
      totalTextData={[
        {
          label: t('商户总数'),
          content: store.summary,
        },
      ]}
    />
  )
})

export default List
