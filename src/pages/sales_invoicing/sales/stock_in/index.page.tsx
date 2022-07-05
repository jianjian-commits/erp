import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'
import { observer } from 'mobx-react'
import { Filter, List } from './components'

import store from './stores/list_store'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

const StockIn = observer(() => {
  const location = useGMLocation<{ type: 'task'; serial_no: string }>()
  const { type, serial_no } = location.query

  const { warehouse_id } = store.filter

  const { pagination, run, loading } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'salesStockInList',
  })

  useEffect(() => {
    if (serial_no) {
      store.changeFilter('q', serial_no)
    }
  }, [serial_no])

  useEffectOnce<string | undefined>(run, warehouse_id)

  useEffect(() => {
    const shelfPro = store.fetchShelf()
    const supplierPro = store.fetchSupplier()
    if (type && type === 'task') {
      store.changeActiveType('toBeSubmitted')
    }
    store.setDoRequest(run)
    Promise.all([shelfPro, supplierPro]).then(() => {
      execMutiWarehouseJudge(run)
      return null
    })

    store.fetchCustomerLabelList() // 获取商户标签

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <Filter onSearch={run} loading={loading} />
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </div>
  )
})

export default StockIn
