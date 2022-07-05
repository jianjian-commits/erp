import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { useUnmount } from 'react-use'

import Filter from '../components/filter'
import Table from '../components/table'
import store from './store'
import { useTableListRef } from '@/common/hooks'
import { toFixOrderWithPrice } from '@/common/util'
import globalStore from '@/stores/global'

const dateRangePickerFileds = [
  {
    type: 'order_time',
    name: t('按订单时间'),
    expand: false,
  },
]

const columns = [
  {
    Header: t('客户编码'),
    id: 'receive_customer_code',
    accessor: 'receive_customer_code',
    minWidth: 150,
    diyEnable: false,
  },
  {
    Header: t('客户名称'),
    id: 'receive_customer_name',
    accessor: 'receive_customer_name',
    minWidth: 150,
    diyEnable: false,
  },
  {
    Header: t('应收金额'),
    id: 'sale_price_sum',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.sale_price_sum)),
    minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('已收金额'),
    id: 'actual_amount_sum',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.actual_amount_sum)),
    minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('退款金额'),
    id: 'refund_amount_sum',
    hide: globalStore.isLite,
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.refund_amount_sum)),
    minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('未收金额'),
    id: 'need_amount_sum',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.need_amount_sum)),
    minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('联系人'),
    id: 'financial_contact_name',
    accessor: 'financial_contact_name',
    minWidth: 150,
  },
  {
    Header: t('手机号'),
    id: 'financial_contact_phone',
    accessor: 'financial_contact_phone',
    minWidth: 150,
  },
]

export default observer(() => {
  const { summary, filter, updateFilter, handleExport, handleSubmit, clear } =
    store
  useUnmount(clear)

  const tableRef = useTableListRef()

  const onExport = () => {
    const diyShowMap = tableRef.current?.getDiyShowMap()
    return handleExport(diyShowMap)
  }

  const {
    actual_amount_sum,
    need_amount_sum,
    refund_amount_sum,
    sale_price_sum,
  } = summary

  const summaryInfo = [
    {
      label: t('应收金额'),
      content: sale_price_sum ? toFixOrderWithPrice(sale_price_sum) : '-',
    },
    {
      label: t('已收金额'),
      content: actual_amount_sum ? toFixOrderWithPrice(actual_amount_sum) : '-',
    },
    {
      label: t('退款金额'),
      content: refund_amount_sum ? toFixOrderWithPrice(refund_amount_sum) : '-',
      hide: globalStore.isLite,
    },
    {
      label: t('未收金额'),
      content: need_amount_sum ? toFixOrderWithPrice(need_amount_sum) : '-',
    },
  ]

  return (
    <>
      <Filter
        onExport={onExport}
        dateRangePickerFileds={dateRangePickerFileds}
        dateType='order_time'
        fuzzySearchField='customer_name'
        placeholder={t('输入客户编码、客户名称搜索')}
        updateFilter={updateFilter}
      />
      <Table
        tableRef={tableRef}
        id='customer_statement'
        columns={columns}
        summaryInfo={summaryInfo}
        filter={filter}
        service={handleSubmit}
      />
    </>
  )
})
