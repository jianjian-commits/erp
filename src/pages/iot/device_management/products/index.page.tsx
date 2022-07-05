import React, { useEffect } from 'react'
import List from './components/list'
import Filter from './components/filter'
import storeList from './store/storeList'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'

const ProductListPage = () => {
  const { supplier_id } = useGMLocation<{
    supplier_id: string
  }>().query

  const { paging, pagination, run } = usePagination<any>(
    storeList.getModelList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'iotProductList',
    },
  )
  useEffect(() => {
    if (supplier_id) storeList.changeFilter('device_supplier_id', supplier_id)
    run()
    return () => storeList.initData()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List onFetchList={run} offset={paging.offset} pagination={pagination} />
    </>
  )
}

export default ProductListPage
