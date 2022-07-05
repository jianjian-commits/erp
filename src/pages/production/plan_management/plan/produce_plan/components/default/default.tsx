import { ProducePlanConditionType } from '@/pages/production/plan_management/plan/interface'
import Options from '@/pages/production/plan_management/plan/produce_plan/components/default/options'
import store from '@/pages/production/plan_management/plan/store'
import globalStore from '@/stores/global'
import { Flex } from '@gm-pc/react'
import { Empty } from '@gm-pc/table-x/src/components'
import { Tabs } from 'antd'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React from 'react'
import {
  PlanProcessTabs,
  PlanProduceType,
  PlanProduceTypes,
  Plan_Process,
} from '../../../enum'

const PlanDefault = () => {
  const { productionOrderId, isProduce } = store.producePlanCondition
  const tabs = PlanProcessTabs(isProduce)
  const process = (
    <div
      style={{
        color: '#666666',
      }}
    >
      {t('流程：')}
      {_.map(tabs, (v) => v.process).join('→')}
    </div>
  )

  const handleChangeCondition = <T extends keyof ProducePlanConditionType>(
    key: T,
    value: ProducePlanConditionType[T],
  ) => {
    store.updateProducePlanCondition({
      [key]: value,
    })
  }

  /**
   * 判断是否有查看的权限，用于标签页的展示
   * @param  {PlanProduceType} type 计划的类型
   * @return {boolean}              是否有查看的权限
   */
  const hasViewPermission = (type: PlanProduceType) => {
    if (
      type === PlanProduceType.produce &&
      globalStore.hasPermission(
        Permission.PERMISSION_PRODUCTION_VIEW_PRODUCTION_INFO,
      )
    ) {
      return true
    }

    if (
      type === PlanProduceType.pack &&
      globalStore.hasPermission(Permission.PERMISSION_PRODUCTION_VIEW_PACK_INFO)
    ) {
      return true
    }

    return false
  }

  return (
    <Flex className='plan-default' column flex={1} key={productionOrderId}>
      {+productionOrderId ? (
        <>
          <Options />
          <div className='plan-default-box'>
            <Tabs
              onTabClick={(value) =>
                handleChangeCondition(
                  'isProduce',
                  value === PlanProduceType.produce,
                )
              }
              tabBarExtraContent={process}
              destroyInactiveTabPane
            >
              {_.map(PlanProduceTypes, (v) => {
                if (!hasViewPermission(v.key)) {
                  return null
                }

                return (
                  <Tabs.TabPane tab={v.tab} key={v.key}>
                    <Tabs
                      type='card'
                      destroyInactiveTabPane
                      onTabClick={(value) =>
                        handleChangeCondition('tab', value as Plan_Process)
                      }
                    >
                      {_.map(tabs, (v) => (
                        <Tabs.TabPane tab={v.tab} key={v.key + isProduce}>
                          <div className='plan-default-module'>
                            {v.children}
                          </div>
                        </Tabs.TabPane>
                      ))}
                    </Tabs>
                  </Tabs.TabPane>
                )
              })}
            </Tabs>
          </div>
        </>
      ) : (
        <Empty />
      )}
    </Flex>
  )
}

export default observer(PlanDefault)
