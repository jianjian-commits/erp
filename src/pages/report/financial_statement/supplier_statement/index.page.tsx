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
    id: 'supplier_code',
    accessor: 'supplier_code',
    // minWidth: 150,
    diyEnable: false,
  },
  {
    Header: t('供应商名称'),
    id: 'supplier_name',
    accessor: 'supplier_name',
    // minWidth: 150,
    diyEnable: false,
  },
  {
    Header: t('应付金额(含税)'),
    id: 'should_amount_sum',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.should_amount_sum)),
    // minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('应付金额(不含税)'),
    id: 'should_amount_no_tax_sum',
    accessor: (d: any) =>
      toFixOrderWithPrice(parseFloat(d.should_amount_no_tax_sum)),
    // minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('税额'),
    id: 'tax_price_sum',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.tax_price_sum)),
    // minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('已付金额'),
    id: 'actual_amount_sum',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.actual_amount_sum)),
    // minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('未付金额'),
    id: 'need_amount_sum',
    accessor: (d: any) => toFixOrderWithPrice(parseFloat(d.need_amount_sum)),
    // minWidth: 150,
    headerSort: true,
  },
  {
    Header: t('手机号'),
    id: 'supplier_phone',
    accessor: 'supplier_phone',
    // minWidth: 150,
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

  const { actual_amount_sum, need_amount_sum, should_amount_sum } = summary

  const summaryInfo = [
    {
      label: t('应付金额'),
      content: should_amount_sum ? toFixOrderWithPrice(should_amount_sum) : '-',
    },
    {
      label: t('已付金额'),
      content: actual_amount_sum ? toFixOrderWithPrice(actual_amount_sum) : '-',
    },
    {
      label: t('未付金额'),
      content: need_amount_sum ? toFixOrderWithPrice(need_amount_sum) : '-',
    },
  ]

  return (
    <>
      <Filter
        onExport={onExport}
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
