import React, { useEffect } from 'react'
import List from './components/list'
import Filter from './components/filter'
import storeList from './store/storeList'
import { usePagination } from '@gm-common/hooks'

const AlertListPage = () => {
  const { paging, pagination, run, refresh } = usePagination<any>(
    storeList.getAlarmRuleList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'iotAlertList',
    },
  )

  useEffect(() => {
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

export default AlertListPage
