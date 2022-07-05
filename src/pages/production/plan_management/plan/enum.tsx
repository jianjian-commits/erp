import { t } from 'gm-i18n'
import React from 'react'
import _ from 'lodash'
import { ProductionSettings_ProductionPlanNavigationSetting } from 'gm_api/src/preference'
import globalStore from '@/stores/global'
import Picking from './picking'
import Demand from './demand'
import Produce from './produce'
import Task from '@/pages/production/plan_management/plan/task'

export enum PlanProduceType {
  produce = '1',
  pack = '2',
}

export enum Plan_Process {
  demand = '1',
  picking = '2',
  task = '3',
  produce = '4',
}

export const PlanNavigation: Partial<
  Record<ProductionSettings_ProductionPlanNavigationSetting, Plan_Process[]>
> = {
  [ProductionSettings_ProductionPlanNavigationSetting.PRODUCTION_PLAN_NAVIGATION_SETTING_MATERIAL_TASK]:
    [
      Plan_Process.demand,
      Plan_Process.picking,
      Plan_Process.task,
      Plan_Process.produce,
    ],
  [ProductionSettings_ProductionPlanNavigationSetting.PRODUCTION_PLAN_NAVIGATION_SETTING_TASK_MATERIAL]:
    [
      Plan_Process.demand,
      Plan_Process.task,
      Plan_Process.picking,
      Plan_Process.produce,
    ],
}

export const PlanProduceTypes: {
  key: PlanProduceType
  tab: string
}[] = [
  { key: PlanProduceType.produce, tab: t('生产') },
  { key: PlanProduceType.pack, tab: t('包装') },
]

export const PlanProcessTabs = (
  isProduce?: boolean,
): {
  key: Plan_Process
  tab: string
  process: string
  children: React.ReactElement
}[] => {
  const text = isProduce ? '生产' : '包装'
  const data = [
    {
      key: Plan_Process.demand,
      tab: t(`${text}需求`),
      process: t(`需求`),
      children: <Demand />,
    },
    {
      key: Plan_Process.picking,
      tab: t('领料'),
      process: t(`领料`),
      children: <Picking />,
    },
    {
      key: Plan_Process.task,
      tab: t(`${text}任务`),
      process: t(`任务`),
      children: <Task />,
    },
    {
      key: Plan_Process.produce,
      tab: t('产出'),
      process: t(`产出`),
      children: <Produce />,
    },
  ]
  return _.map(
    PlanNavigation[
      globalStore.productionSetting.production_plan_navigation_setting || 1
    ],
    (key) => _.find(data, (v) => v.key === key)!,
  )
}

export const AdjustmentTabs = [
  {
    title: t('规划需求'),
    step: [
      {
        title: t('选择需求'),
        description: t('选择规划的未下达需求，进行调整'),
      },
      {
        title: t('选择计划'),
        description: t('将需求调整到其他计划中，并确认'),
      },
    ],
  },
  {
    title: t('订单纳入'),
    step: [
      {
        title: t('选择商品'),
        description: t('选择要纳入的未发布的商品，进行添加'),
      },
      {
        title: t('选择计划'),
        description: t('将未下达的商品加入到本计划中，并确认'),
      },
    ],
  },
]
