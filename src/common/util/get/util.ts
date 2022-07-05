/*
 * @Description: 不确定或公共的get util放这里
 */
import { pinyin } from '@gm-common/tool'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Order_Status } from 'gm_api/src/order'
import { ModelValue } from 'gm_api/src/analytics'

// 扫码回单状态码
const RECEIPT_STATUS_CODE: Order_Status = Order_Status.STATUS_IS_SIGNED

/**
 * @description: 自定义编码
 */
export const getCustomizedCode = (text: string): string => {
  if (!text) {
    return ''
  }

  const code: string = _.map(text, (t) => pinyin(t)[0]).join('')
  return code
}
/**
 * @description: 获取分类id
 * @param {string[]} category1Ids 分类id1
 * @param {string[]} category2Ids 分类id2
 * @param {string[]} pinleiIds 品类id
 */
export const getCategoryIds = (
  category1Ids: string[],
  category2Ids: string[],
  pinleiIds: string[],
) => {
  if (pinleiIds && pinleiIds.length) {
    return { spu_ids: pinleiIds, category_ids: [] }
  } else if (category2Ids && category2Ids.length) {
    return { spu_ids: [], category_ids: category2Ids }
  } else if (category1Ids && category1Ids.length) {
    return { spu_ids: [], category_ids: category1Ids }
  }
  return undefined
}

/**
 * @description: 获取回单状态
 * @param {string} status 状态码
 * @return {string} 回单状态
 */
export const getReceiptStatusText = (status: string) => {
  // 是否已回单
  const isReceipt = (+status! & RECEIPT_STATUS_CODE) === RECEIPT_STATUS_CODE
  return t(isReceipt ? '已回单' : '未回单')
}

/**
 * @description: 获取modelvalues的kv
 */
export const getModelValuesKV = (
  modelValues?: ModelValue[],
): { [key: string]: any }[] => {
  return modelValues?.map(({ kv }, id) => ({ ...kv, id })) || []
}
