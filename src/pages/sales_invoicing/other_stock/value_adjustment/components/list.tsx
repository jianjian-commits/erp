import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Table, Column } from '@gm-pc/table-x'

import { formatSecond } from '@/pages/sales_invoicing/../sales_invoicing/util'
import ListStatusTabs from '@/pages/sales_invoicing/components/list_status_tabs'
import {
  ADJUST_TABS,
  ADJUST_TABS_NAME,
  ADJUST_STATUS,
} from '@/pages/sales_invoicing/enum'
import { AdjustStatusKey } from '@/pages/sales_invoicing/interface'

import store from '../stores/store'
interface Props {
  onFetchList: () => any
}

const columns: Column[] = [
  {
    Header: t('建单时间'),
    accessor: 'create_time',
    Cell: (cellProps) => {
      const { create_time } = cellProps.original
      return formatSecond(create_time)
    },
  },
  {
    Header: t('调整完成时间'),
    Cell: (cellProps) => {
      const { update_time } = cellProps.original
      return formatSecond(update_time)
    },
  },
  {
    Header: t('货值调整单号'),
    Cell: ({ original }) => {
      const { adjust_sheet_serial_no, adjust_sheet_id } = original
      return (
        <a
          className='gm-text-primary gm-cursor'
          href={`#/sales_invoicing/other_stock/value_adjustment/detail?adjust_sheet_id=${adjust_sheet_id}`}
        >
          {adjust_sheet_serial_no}
        </a>
      )
    },
  },
  {
    Header: t('单据状态'),
    accessor: t('sheet_status'),
    Cell: (cellProps) => {
      const { adjust_sheet_status } = cellProps.original
      return ADJUST_TABS_NAME[adjust_sheet_status]
    },
  },
]

const TabList = observer(() => {
  const { list } = store
  return <Table data={list.slice()} columns={columns} />
})

const List: FC<Props> = observer((props) => {
  const { onFetchList } = props
  const activeChange = (type: AdjustStatusKey) => {
    store.changeTab(type)
    store.changeFilter('adjust_sheet_status', ADJUST_STATUS[type])
    onFetchList()
  }

  return (
    <ListStatusTabs
      tabComponent={<TabList />}
      active={store.active_tab}
      tabData={ADJUST_TABS}
      onChange={activeChange}
    />
  )
})

export default List
