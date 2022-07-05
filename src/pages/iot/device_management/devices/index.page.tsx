import React, { useEffect } from 'react'
import List from './components/list'
import Filter from './components/filter'
import storeList from './store/storeList'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'

const DeviceListPage = () => {
  const { model_id } = useGMLocation<{
    model_id: string
  }>().query

  const { paging, pagination, run, refresh } = usePagination<any>(
    storeList.getDeviceList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'iotDeviceList',
    },
  )

  useEffect(() => {
    if (model_id) storeList.changeFilter('device_model_id', model_id)
    run()
    return () => storeList.initData()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List
        onFetchList={refresh}
        offset={paging.offset}
        pagination={pagination}
      />
    </>
  )
}

export default DeviceListPage
