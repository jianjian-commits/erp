import React, { FC, useEffect } from 'react'

import { usePagination } from '@gm-common/hooks'
import { Flex, Pagination } from '@gm-pc/react'
import { Task_Type } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'
import planStore from '@/pages/production/plan_management/plan/store'
import ProductionPagination from '@/pages/production/plan_management/plan/components/production_pagination'

const Picking: FC = () => {
  const { paging, runChangePaging, run, refresh } = usePagination<any>(
    (params) =>
      store.fetchList({
        ...params,
      }),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  // 每次切换大Tab时更新列表
  useEffect(() => {
    const task_types = planStore.producePlanCondition.isProduce
      ? [Task_Type.TYPE_PRODUCE, Task_Type.TYPE_PRODUCE_CLEANFOOD]
      : [Task_Type.TYPE_PACK]
    store.updateFilter('task_types', task_types)
    store.updateFilter(
      'production_order_id',
      planStore.producePlanCondition.productionOrderId,
    )
    run()
  }, [])

  return (
    <Flex column className='b-produce-tab b-bomList'>
      <Filter onSearch={run} refresh={refresh} />
      <List refresh={refresh} paging={paging} />
      <ProductionPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </ProductionPagination>
    </Flex>
  )
}

export default observer(Picking)
