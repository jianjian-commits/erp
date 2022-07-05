import PermissionButton from '@/common/components/permission_button'
import store from '@/pages/production/plan_management/plan/store'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { useState } from 'react'
import PlanInfo from '../plan_info'
import ReleaseTaskModal from '@/pages/production/plan_management/plan/produce_plan/components/default/release_task_modal'
import AdjustmentStepModal from '@/pages/production/plan_management/plan/produce_plan/components/default/adjustment_step_modal'
import { gmHistory as history } from '@gm-common/router'
import qs from 'query-string'

const Options = () => {
  const [releaseTaskVisible, setReleaseTaskVisible] = useState(false)
  const [adjustmentVisible, setAdjustmentVisible] = useState(false)
  const [isDemand, setIsDemand] = useState(false)

  const {
    productionPlanList,
    producePlanCondition: { productionOrderId, productionOrder },
    productionPlanFilter,
  } = store
  const index = _.findIndex(productionPlanList, {
    production_order_id: productionOrderId,
  })

  const handleCreateDemand = () => {
    history.push(
      `/production/plan_management/plan/create?productionOrderId=${productionOrderId}&name=${
        productionOrder?.name
      }&${qs.stringify({
        filter: JSON.stringify(productionPlanFilter),
      })}`,
    )
  }

  const handleReleaseTask = () => {
    setReleaseTaskVisible((v) => !v)
  }

  const handleAdjustment = (bool?: boolean) => {
    setAdjustmentVisible((v) => !v)
    setIsDemand(bool!)
  }

  return (
    <>
      <Flex className='plan-default-header' alignCenter justifyBetween>
        <div className='default-header-info'>
          <PlanInfo index={index} isDefault />
        </div>
        <div className='default-header-options'>
          <PermissionButton
            type='primary'
            permission={Permission.PERMISSION_PRODUCTION_CREATE_TASK}
            onClick={handleCreateDemand}
          >
            {t('新建需求')}
          </PermissionButton>
          <PermissionButton
            permission={Permission.PERMISSION_PRODUCTION_ONE_CLICK_RELEASE}
            onClick={handleReleaseTask}
          >
            {t('一键下达任务')}
          </PermissionButton>
          <PermissionButton
            permission={Permission.PERMISSION_PRODUCTION_PLANING_TASK}
            onClick={() => handleAdjustment(true)}
          >
            {t('规划需求')}
          </PermissionButton>
          <PermissionButton
            permission={Permission.PERMISSION_PRODUCTION_ORDER_INCLUSION}
            onClick={() => handleAdjustment(false)}
          >
            {t('订单纳入')}
          </PermissionButton>
        </div>
      </Flex>
      <ReleaseTaskModal
        visible={releaseTaskVisible}
        onChangeVisible={handleReleaseTask}
      />
      <AdjustmentStepModal
        visible={adjustmentVisible}
        onChangeVisible={handleAdjustment}
        isDemand={isDemand}
      />
    </>
  )
}

export default observer(Options)
