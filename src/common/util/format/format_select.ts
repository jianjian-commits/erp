/*
 * @Description: 格式化Select util
 */

import { ListDataItem } from '@gm-pc/react'
import _ from 'lodash'

/**
 * @description: 将后台数据转换为select组件的数据
 * @param {array} data 待适配数据
 * @param {string} valueName value的字段名
 * @param {string} textName text的字段名
 */
export const adapterSelectComData = <T extends Record<string, any>>(
  data: T[],
  valueName = 'id',
  textName = 'name',
): (T & ListDataItem<string>)[] => {
  return _.map(data, (item) => {
    return {
      ...item,
      value: item[valueName],
      text: item[textName],
    }
  })
}

/**
 * @description: 将后台数据转换为MoreSelect组件的数据
 * @param {array} data 待适配数据
 * @param {string} valueName value的字段名
 * @param {string} textName text的字段名
 */
export const adapterMoreSelectComData = <T extends Record<string, any>>(
  data: T[],
  valueName = 'id',
  textName = 'name',
): (T & ListDataItem<string>)[] => {
  return adapterSelectComData(data, valueName, textName)
}
