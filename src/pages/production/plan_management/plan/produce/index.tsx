import React, { FC, useEffect } from 'react'

import { usePagination } from '@gm-common/hooks'
import { Flex, Pagination } from '@gm-pc/react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list'
import planStore from '../store'
import store from './store'
import { Task_Type } from 'gm_api/src/production'
import ProductionPagination from '@/pages/production/plan_management/plan/components/production_pagination'
const Produce: FC = () => {
  // 获取产出列表和分页信息
  const { paging, runChangePaging, run, refresh } = usePagination<any>(
    (params) => store.fetchList(params.paging),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  // 每次更新搜索条件时更新列表
  useEffect(() => {
    const task_types = planStore.producePlanCondition.isProduce
      ? [Task_Type.TYPE_PRODUCE, Task_Type.TYPE_PRODUCE_CLEANFOOD]
      : [Task_Type.TYPE_PACK]
    store.updateFilter('task_types', task_types)
    run()
    return store.init()
  }, [])

  return (
    <Flex column className='b-produce-tab'>
      <Filter onSearch={run} refresh={refresh} />
      <List refresh={refresh} />
      <ProductionPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </ProductionPagination>
    </Flex>
  )
}

export default observer(Produce)
