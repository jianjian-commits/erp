import { t } from 'gm-i18n'
import { GetUnitRateGroupResponse_UnitRateGroup } from 'gm_api/src/merchandise'
import { Bom } from 'gm_api/src/production'
import _ from 'lodash'

export const SummaryPlanConfig = [
  {
    name: t('总计划数'),
    field: 'total_plan_count',
    color: '#1eac52',
    numberClassName: 'b-full-screen-gradient-color-blue',
  },
  {
    name: t('已完成计划数'),
    field: 'finished_plan_count',
    color: '#1eac52',
    numberClassName: 'b-full-screen-gradient-color-blue',
  },
  {
    name: t('已下达计划数'),
    field: 'released_plan_count',
    color: '#56a3f2',
    numberClassName: 'b-full-screen-gradient-color-red',
  },
  {
    name: t('未下达计划数'),
    field: 'unreleased_plan_count',
    color: '#FFBB00',
    numberClassName: 'b-full-screen-gradient-color-yellow',
  },
]

export const SummaryProcessConfig = [
  {
    name: t('任务总数'),
    field: 'total_task_count',
    color: '#1eac52',
    numberClassName: 'b-full-screen-gradient-color-blue',
  },
  {
    name: t('已完成任务数'),
    field: 'finished_task_count',
    color: '#1eac52',
    numberClassName: 'b-full-screen-gradient-color-blue',
  },
  {
    name: t('已开工任务数'),
    field: 'released_task_count',
    color: '#56a3f2',
    numberClassName: 'b-full-screen-gradient-color-red',
  },
  {
    name: t('未开工任务数'),
    field: 'unreleased_task_count',
    color: '#FFBB00',
    numberClassName: 'b-full-screen-gradient-color-yellow',
  },
]

/**
 *
 * @param units unit_id_1 成品单位id，unit_id_2 物料单位id
 * @param unit_rates
 */
export const getUnitsRate = (
  units: { unit_id_1: string; unit_id_2: string },
  unit_rates?: {
    [key: string]: GetUnitRateGroupResponse_UnitRateGroup[]
  },
) => {
  if (units.unit_id_1 === units.unit_id_2) {
    return '1'
  }

  if (unit_rates) {
    const unit = unit_rates[units.unit_id_2]
    if (unit) {
      return unit[0].rate
    }
  }

  return ''
}

// 计算理论出成率，即bom中的配比
export const productPercentage = (bom: Bom) => {
  // 若存在组合工序，并且输入物料不为1，暂时无需计算
  const combineProcess = _.find(
    bom.processes?.processes,
    (p) => p.inputs.length > 1,
  )

  if (combineProcess) {
    return
  }

  // 所有工序的出成率乘积即为理论总出成率，因为单品只有一个投料，所以只拿inputs[0]就行
  const rate = bom.processes?.processes.reduce((yieldRate, process) => {
    yieldRate *= +(process.inputs[0].cook_yield_rate || 100) / 100
    return yieldRate
  }, 100)

  return rate
}
