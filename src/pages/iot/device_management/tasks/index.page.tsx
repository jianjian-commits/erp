import React, { useEffect } from 'react'
import List from './components/list'
import Filter from './components/filter'
import storeList from './store/storeList'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'

const TaskListPage = () => {
  const { strategy_id } = useGMLocation<{
    strategy_id: string
  }>().query

  const { paging, pagination, run } = usePagination<any>(
    storeList.getStrategyList,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'iotTaskList',
    },
  )

  useEffect(() => {
    if (strategy_id) storeList.changeFilter('text', strategy_id)
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

export default TaskListPage
