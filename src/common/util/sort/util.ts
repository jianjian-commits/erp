/*
 * @Description: 不确定或公共sort的util放这里
 */
import _ from 'lodash'
import type { SortItem, SortDirection } from '@/common/interface'

export const sortBySingleRule = (
  list: any[],
  name: string,
  direction: SortDirection,
) => {
  if (!name || !list || !direction) return list

  // 删去空格和括号
  const reg = /(\s|\(|（)/g
  const sortList = list.sort((a, b) => {
    const nameA = _.get(a, name).replace(reg, '')
    const nameB = _.get(b, name).replace(reg, '')
    // 第一位是数字的，数字排在汉字后面
    if (/\d/.test(nameA[0]) || /\d/.test(nameB[0])) {
      return nameA[0] > nameB[0] ? -1 : 1
    }

    return nameA.localeCompare(nameB)
  })
  return direction === 'asc' ? sortList : _.reverse(sortList)
}

export const sortByMultiRule = (list: any[], ruleList: SortItem[]) => {
  if (!list.length || !ruleList.length) return list
  const sortList: any[] = []

  _.forEach(ruleList, (rule, index) => {
    if (!index) {
      sortList[index] = sortBySingleRule(
        list,
        rule.sort_by,
        rule.sort_direction,
      )
    } else {
      let result: any[] = []
      const groupList = _.groupBy(
        sortList[index - 1],
        ruleList[index - 1].sort_by,
      )
      const groupKeys = _.keys(groupList)
      _.forEach(groupKeys, (key) => {
        const _len = groupList[key].length
        if (_len === 1) {
          result = _.concat(result, groupList[key])
        } else {
          result = _.concat(
            result,
            sortBySingleRule(groupList[key], rule.sort_by, rule.sort_direction),
          )
        }
      })
      sortList[index] = result
    }
  })

  return sortList[ruleList.length - 1]
}

export const groupByWithIndex = (list: any[], callback: any) => {
  let i = 0
  return _.groupBy(list, (v) => {
    return callback(v, i++)
  })
}
