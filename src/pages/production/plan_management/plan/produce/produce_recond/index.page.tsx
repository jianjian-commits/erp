import React, { FC, useEffect } from 'react'
import { useGMLocation } from '@gm-common/router'
import { usePagination } from '@gm-common/hooks'
import { Flex, Pagination } from '@gm-pc/react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'
import { setTitle } from '@gm-common/tool'
import '@/pages/production/plan_management/plan/produce/style.less'
import ProductionPagination from '@/pages/production/plan_management/plan/components/production_pagination'
interface Query {
  productionOrderId: string
}
const Produce_recond: FC = () => {
  const location = useGMLocation<Query>()
  const { productionOrderId } = location.query
  const { paging, runChangePaging, run, refresh } = usePagination<any>(
    (params) => store.fetchList(params.paging),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffect(() => {
    setTitle('产出记录')
    store.setInitValue(productionOrderId)
    run()
    return store.init()
  }, [])

  return (
    <Flex column className='b-produce-plan'>
      <Filter onSearch={run} />
      <List refresh={refresh} />
      <ProductionPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </ProductionPagination>
    </Flex>
  )
}

export default observer(Produce_recond)
