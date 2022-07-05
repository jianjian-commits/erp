import Big, { BigSource } from 'big.js'
import _ from 'lodash'
import { MULTI_SUFFIX } from 'gm-x-printer'
import { i18next } from 'gm-i18n'
import { toFixed } from '@/common/util'

export const money = (n: BigSource) => toFixed(Big(n))

export const toFixed2 = (n: BigSource) => Big(n).toFixed(2)

export const getSpecialTable = (
  normalTable: any[],
  size: number,
  type: string,
) =>
  normalTable.reduce((arr, task) => {
    const specialList = _.chunk(task.__details, size).map((list) => ({
      _special: { list, type, fixedSize: size },
    }))
    return [...arr, task, ...specialList]
  }, [])

export function generateMultiData(list: any[]) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}], 转化为 [{a:1, a#2:3}, {a:2, a#2: 4}]
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

export function groupByCategory(groupByCategory1: _.Dictionary<any[]>) {
  let kCategory: any[] = []
  let kCategoryMulti: any[] = []
  let index = 1
  _.forEach(groupByCategory1, (value, key) => {
    // 分类小计
    const list = _.map(value, (sku) => {
      return {
        ...sku,
        [i18next.t('序号')]: index++,
      }
    })
    // 分类计数
    const categoryTotal = [
      {
        _special: {
          text: key + '：共' + list.length + '种',
        },
        __details: [],
      },
    ]

    /* -------- 分类  ------------- */
    kCategory = kCategory.concat(list, categoryTotal)
    kCategoryMulti = kCategoryMulti.concat(
      generateMultiData(list),
      categoryTotal,
    )
  })
  return [kCategory, kCategoryMulti]
}
