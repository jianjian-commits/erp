/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import Filter from './components/filter'
import List from './components/list'
import store from './store'
import purchaseStore from '@/pages/purchase/store'
import { registerOverview, offOverview } from './overview'
import './style.less'

/**
 * @description 采购单据列表
 */
const Task = () => {
  const { pagination, refresh, run } = usePagination<any>(store.fetchList, {
    paginationKey: 'purchase_task',
    defaultPaging: {
      need_count: true,
    },
  })

  useEffect(() => {
    purchaseStore.fetchPurchasers()
    purchaseStore.fetchSuppliers()
    store.setDoRequest(refresh)
    store.getSummary()
    store.doRequest()
    return () => store.init()
  }, [])

  useEffect(() => {
    store.list.length ? registerOverview() : offOverview()
    return () => offOverview()
  }, [store.list.length])

  const handleSearch = () => {
    store.getSummary()
    return run()
  }

  return (
    <>
      <Filter onSearch={handleSearch} pagination={pagination} />
      <div className='purchaseTask-boxTable'>
        <List pagination={pagination} />
      </div>
    </>
  )
}

export default Task
