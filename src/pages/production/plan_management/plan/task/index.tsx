import { usePagination } from '@gm-common/hooks'
import { Pagination, Flex } from '@gm-pc/react'
import { map_ProduceType, ProduceType } from 'gm_api/src/production'
import React, { FC, useEffect } from 'react'
import Filter from './components/filter/filter'
import List from './components/list/list'
import store from './store'
import planStore from '../store'
import './style.less'
import ProductionPagination from '@/pages/production/plan_management/plan/components/production_pagination'
const Task: FC = () => {
  const isProduce = planStore.producePlanCondition.isProduce
  const type = isProduce ? undefined : ProduceType.PRODUCE_TYPE_PACK

  const { pagination, runChangePaging, run, refresh } = usePagination<any>(
    (params) => store.fetchProcessTaskList(params, type),
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey:
        map_ProduceType[type ?? ProduceType.PRODUCE_TYPE_DELICATESSEN],
    },
  )

  useEffect(() => {
    store.setDoRequest(refresh)
    store.fetchFactoryModalList()
    run()
    return store.init
  }, [])

  return (
    <Flex column className='b-produce-tab'>
      <Filter type={type} onSearch={run} refresh={refresh} />
      <List type={type} onSearch={run} />
      <ProductionPagination>
        <Pagination paging={pagination.paging} onChange={runChangePaging} />
      </ProductionPagination>
    </Flex>
  )
}

export default Task
