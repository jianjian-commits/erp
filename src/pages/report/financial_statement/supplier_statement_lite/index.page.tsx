import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { useUnmount } from 'react-use'

import Filter from '../components/filter'
import Table from '../components/table'
import store from './store'
import { useTableListRef } from '@/common/hooks'
import { toFixOrderWithPrice } from '@/common/util'

const dateRangePickerFileds = [
  {
    type: 'create_time',
    name: t('按对账单时间'),
    expand: false,
  },
]

const columns = [
  {
    Header: t('供应商编码'),
    id: 'customized_code',
    accessor: 'customized_code',
  },
  {
    Header: t('供应商名称'),
    id: 'supplier_name',
    accessor: 'supplier_name',
  },
  {
    Header: t('应付金额'),
    id: 'total_amount',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.total_amount)),
  },
  {
    Header: t('已付金额'),
    id: 'total_already_amount',
    accessor: (d: any) =>
      toFixOrderWithPrice(parseFloat(d.total_already_amount)),
  },
  {
    Header: t('未付金额'),
    id: 'total_not_amount',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.total_not_amount)),
  },
  {
    Header: t('联系人'),
    id: 'receiver',
    accessor: (d: any) => d.receiver || '-',
  },
  {
    Header: t('手机号'),
    id: 'phone',
    accessor: (d: any) => d.phone || '-',
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

  const { total_amount, total_already_amount, total_not_amount } = summary

  const summaryInfo = [
    {
      label: t('应付金额'),
      content: total_amount ? toFixOrderWithPrice(total_amount) : '-',
    },
    {
      label: t('已付金额'),
      content: total_already_amount
        ? toFixOrderWithPrice(total_already_amount)
        : '-',
    },
    {
      label: t('未付金额'),
      content: total_not_amount ? toFixOrderWithPrice(total_not_amount) : '-',
    },
  ]

  return (
    <>
      <Filter
        // onExport={onExport}
        dateRangePickerFileds={dateRangePickerFileds}
        dateType='create_time'
        fuzzySearchField='supplier_name'
        placeholder={t('输入供应商编码、供应商名称搜索')}
        updateFilter={updateFilter}
      />
      <Table
        tableRef={tableRef}
        id='supplier_statement'
        columns={columns}
        summaryInfo={summaryInfo}
        filter={filter}
        service={handleSubmit}
      />
    </>
  )
})
