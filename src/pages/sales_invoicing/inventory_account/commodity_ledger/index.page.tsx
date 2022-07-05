import React, { useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'
import { observer } from 'mobx-react'
import moment from 'moment'

import LedgerStore from './store'
import Filter from './components/filter'
import List from './components/list'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

const commLedger = observer(() => {
  const { sku_id, unit_id } = useGMLocation<{
    sku_id: string
    unit_id: string
  }>().query
  const {
    filter: { warehouse_id },
  } = LedgerStore
  const { paging, runChangePaging, run } = usePagination<any>(
    LedgerStore.fetchList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'commodityLedgerList',
    },
  )

  const toUpdateFilter = () => {
    if (sku_id) {
      LedgerStore.updateFilter('sku_id', { value: sku_id, text: '' })
      LedgerStore.updateFilter('unit_id', { value: unit_id, text: '' })
      LedgerStore.updateFilter(
        'begin_time',
        moment().startOf('day').add(-6, 'days').toDate(),
      )
    }
  }

  useEffectOnce<string | undefined>(run, warehouse_id)

  useEffect(() => {
    toUpdateFilter()
    execMutiWarehouseJudge(run)
    return LedgerStore.clean
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
})

export default commLedger
