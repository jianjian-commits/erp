import React, { useEffect } from 'react'
import List from './components/list'
import storeList from './store/storeList'
import { usePagination } from '@gm-common/hooks'

const SupplierListPage = () => {
  const { paging, pagination, run, refresh } = usePagination<any>(
    storeList.getSupplierList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'iotSupplierList',
    },
  )

  useEffect(() => {
    run()
    return () => storeList.initData()
  }, [])

  return (
    <>
      <List
        onFetchList={refresh}
        offset={paging.offset}
        pagination={pagination}
      />
    </>
  )
}

export default SupplierListPage
