import PlanDefault from '@/pages/production/plan_management/plan/produce_plan/components/default/default'
import PlanSide from '@/pages/production/plan_management/plan/produce_plan/components/side/side'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import '../style.less'
import store from '@/pages/production/plan_management/plan/store'
import { useGMLocation } from '@gm-common/router'
import moment from 'moment'

interface Query {
  productionOrderId?: string
  filter?: any
}

const ProductPlan = () => {
  const location = useGMLocation<Query>()
  const { productionOrderId, filter } = location.query
  useEffect(() => {
    if (filter) {
      const { begin_time, end_time, ...res } = JSON.parse(filter)
      store.productionPlanFilter = {
        begin_time: moment(begin_time),
        end_time: moment(end_time),
        ...res,
      }
    }
    store.fetchListProductionLine()
    store.fetchList(productionOrderId)
    return store.initData
  }, [])

  return (
    <Flex className='b-produce-plan'>
      <PlanSide />
      <PlanDefault />
    </Flex>
  )
}

export default observer(ProductPlan)
