import _ from 'lodash'
import { MULTI_SUFFIX } from 'gm-x-printer'
import { toFixed } from '@/pages/production/util'
import { Unit } from 'gm_api/src/merchandise'
import Big from 'big.js'
import { ProcessTaskCommandExpand } from '@/pages/system/template/print_template/production_template/interface'
import globalStore from '@/stores/global'
import { Bom_Process, OutputType } from 'gm_api/src/production'

/**
 * 生成双栏商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
export function generateMultiData(list: any[]) {
  const multiList = [] // 假设skuGroup=[{a:1},{a:2},{a:3},{a:4}],转化为[{a:1,a#2:3},{a:2,a#2:4}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length

  while (index < len) {
    const sku1 = skuGroup[index]
    const sku2: { [key: string]: any } = {}
    _.each(skuGroup[1 + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    multiList.push({
      ...sku1,
      ...sku2,
    })

    index += 2
  }

  return multiList
}

export function generateVerticalMultiData(list: any[]) {
  const multiList = [] // 假设skuGroup = [{a:1},{a:2},{a:3},{a:4}],转化为[{a:1,a#2:3},{a:2,a#2:4}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length
  const middle = Math.ceil(len / 2)
  while (index < middle) {
    const sku1 = skuGroup[index]
    const sku2: { [key: string]: any } = {}
    _.each(skuGroup[middle + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    multiList.push({
      ...sku1,
      ...sku2,
    })

    index += 1
  }

  return multiList
}

// 理论用料数量_基本单位
export const getPlanAmount = (task: ProcessTaskCommandExpand) => {
  const { plan_amount, base_unit_id } = task.inputs!.inputs![0].material!
  return {
    amount: plan_amount,
    value: toFixed(plan_amount!) + globalStore.getUnitName(base_unit_id!),
  }
}

/**
 * 产出基本单位  
 * 净菜 => 理论产出数量
   其他 => 计划生产
 */
export const getOutAmount = (task: ProcessTaskCommandExpand) => {
  const { plan_amount, base_unit_id } = task.main_output!.material!
  const amount = plan_amount! || '0'
  return {
    amount,
    value: toFixed(amount) + globalStore.getUnitName(base_unit_id!),
  }
}

// 生产单位
export const getProduction = (plan_amount: string, production_unit: Unit) => {
  const { rate, name } = production_unit
  return toFixed('' + Big(plan_amount).times(rate)) + name
}

// 生产成品出成率
export const cleanFoodYield = (processes: Bom_Process[]) => {
  const processYield = _.reduce(
    processes,
    (all, next) => {
      const { cook_yield_rate, material } = next.inputs[0]
      const mainOutPut = _.filter(next.outputs, {
        type: OutputType.OUTPUT_TYPE_MAIN,
      })[0]
      const processYield =
        cook_yield_rate ||
        Big(mainOutPut.material?.quantity!).div(material?.quantity!).times(100)
      return all.times(processYield).div(100)
    },
    Big(1),
  )
  return processes.length ? processYield.times(100).toFixed(2) + '%' : '-'
}
