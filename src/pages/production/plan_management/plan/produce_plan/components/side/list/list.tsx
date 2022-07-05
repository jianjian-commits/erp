import React from 'react'
import store from '@/pages/production/plan_management/plan/store'
import _ from 'lodash'
import PlanListItem from '@/pages/production/plan_management/plan/produce_plan/components/side/list/item'
import { observer } from 'mobx-react'
import { Empty } from '@gm-pc/table-x/src/components'
import { ProductionOrderExpand } from '@/pages/production/plan_management/plan/interface'

const PlanList = () => {
  const { productionPlanList, updateKey } = store
  const handleChose = (v: ProductionOrderExpand) => {
    store.updateProducePlanCondition({
      isProduce: true,
      productionOrderId: v.production_order_id,
      productionOrder: v,
    })
  }

  return (
    <div className='b-plan-list' key={updateKey}>
      {productionPlanList.length ? (
        _.map(productionPlanList, (v, index) => (
          <PlanListItem index={index} onSelect={() => handleChose(v)} />
        ))
      ) : (
        <Empty />
      )}
    </div>
  )
}

export default observer(PlanList)
