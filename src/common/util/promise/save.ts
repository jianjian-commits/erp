/*
 * @Description: 保存相关
 */

import { FAIL_TIP, SUCCESS_TIP } from '@/common/enum'
import { Tip } from '@gm-pc/react'
/**
 * @description:很多提交都会提示成功或失败，这里统一处理下
 * @param {Promise<T> | ((...args: any[]) => Promise<T>)} promise 执行传入promise或者返回promise的函数
 * @param {string} successTip 成功的提示
 * @param {string} failTip 失败的提示
 */
export function savePromise<T>(
  promise: Promise<T> | ((...args: any[]) => Promise<T>),
  successTip = SUCCESS_TIP,
  failTip = FAIL_TIP,
) {
  if (typeof promise === 'function') promise = promise()
  promise
    .then(() => {
      Tip.success(successTip)
    })
    .catch(() => {
      Tip.danger(failTip)
    })
}
