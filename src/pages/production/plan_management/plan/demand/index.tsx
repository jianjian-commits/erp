import List from './components/list/list'
import Filter from './components/filter/filter'
import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import store from './store'
import { Flex, Pagination } from '@gm-pc/react'
import './style.less'
import ProductionPagination from '@/pages/production/plan_management/plan/components/production_pagination'

const Demand = () => {
  const { paging, run, refresh, runChangePaging, refreshAfterDelete } =
    usePagination<any>(
      (params) =>
        store.fetchTaskList({
          ...params,
        }),
      {
        defaultPaging: {
          need_count: true,
        },
      },
    )

  useEffect(() => {
    store.setDoRequest(run)
    run()
    return store.init
  }, [])

  return (
    <Flex column className='b-produce-tab'>
      <Filter run={run} refresh={refresh} />
      <List onSearchDelete={refreshAfterDelete} paging={paging} />
      <ProductionPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </ProductionPagination>
    </Flex>
  )
}

export default Demand
