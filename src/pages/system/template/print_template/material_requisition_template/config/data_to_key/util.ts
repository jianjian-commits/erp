import _ from 'lodash'
import { MULTI_SUFFIX } from 'gm-x-printer'

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
