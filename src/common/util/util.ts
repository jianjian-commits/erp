/*
 * @Description:不确定或公共的util放这里
 */
import _ from 'lodash'
import { Storage } from '@gm-common/tool'
import { accessTokenKey } from '@gm-common/x-request/src/util'
import CryptoJS from 'crypto-js'
import { SessionStorage, Storage as reactStorage } from '@gm-pc/react'
import globalStore from '@/stores/global'
import { clearAuth } from '@gm-common/x-request'
import { gmHistory } from '@gm-common/router'
import moment from 'moment'

// 十六位十六进制数作为密钥
const SECRET_KEY = CryptoJS.enc.Utf8.parse('1234123412341234')
// 十六位十六进制数作为密钥偏移量
const SECRET_IV = CryptoJS.enc.Utf8.parse('1234123412341234')

/**
 * @description: a标签跳转新页面
 * @param {string} url
 * @return {*}
 */
export const openNewTab = (url: string): void => {
  const a = document.createElement('a')
  a.rel = 'noopener'
  a.href = url
  a.target = '_blank'
  a.click()
}
// 一天的毫秒数
export const dayMM = 24 * 60 * 60 * 1000 // 一天

// 循环优化
export const DuffUtil: <T, R>(
  arr: T[],
  fun: (item: T, res?: R[]) => void,
  res?: R[],
) => void = (arr, fun, res) => {
  let index = 0
  let iter = Math.ceil(arr.length / 8)
  let startChar = arr.length % 8
  do {
    /* eslint-disable */
    switch (startChar) {
      case 0:
        fun(arr[index++], res)
      case 7:
        fun(arr[index++], res)
      case 6:
        fun(arr[index++], res)
      case 5:
        fun(arr[index++], res)
      case 4:
        fun(arr[index++], res)
      case 3:
        fun(arr[index++], res)
      case 2:
        fun(arr[index++], res)
      case 1:
        fun(arr[index++], res)
    }
    /* eslint-disable */
    startChar = 0
  } while (--iter > 0)
}

/**
 * @description: 检测当前位数是否为1
 */
export const checkDigit = (value: any, digit: number): boolean => {
  return (parseInt(value) >> digit).toString(2) === '1'
}

interface EnumData {
  text: any
  value: any
  [key: string]: any
}

/**
 * @description: 获取枚举value=>text
 * @param {array} enumData 枚举数据
 * @param {number | string} value 值
 * @param {string} keyName key的字段名，不传默认为value
 * @returns {string}
 */
export const getEnumText = (
  enumData: EnumData[],
  value: string | number,
  keyName = 'value',
): string => {
  const fieldName = keyName

  const item = _.find(enumData, (item) => +item[fieldName] === +value)

  if (item) {
    return item.text
  } else {
    return '-'
  }
}

/**
 * @description: 获取唯一id
 */
export const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * @description 公用search方法
 */
export function search(array: any[], value: any): Array<string> {
  const item = array.find((it) => it.shelf_id === (value ?? 0).toString())
  if (!item) return ['0']
  if (item.parent_id === '0') return [item.shelf_id]

  return [item.shelf_id].concat(search(array, item.parent_id).flat())
}

export const setAccessToken = (accessToken: string) => {
  Storage.set(accessTokenKey, accessToken)
}

export const getAccessToken = () => {
  return Storage.get(accessTokenKey)
}

/**
 * @description: 检测传入的简单值是否非空
 */
export const getUnNillText = (value: string | number | undefined) => {
  if (value) return value
  return '-'
}

/**
 * 前端本地数据加密方法
 * @param data
 * @returns {string}
 */
export function encrypt(data: any) {
  if (typeof data === 'object') {
    try {
      // eslint-disable-next-line no-param-reassign
      data = JSON.stringify(data)
    } catch (error) {
      console.log('encrypt error:', error)
    }
  }
  const dataHex = CryptoJS.enc.Utf8.parse(data)
  const encrypted = CryptoJS.AES.encrypt(dataHex, SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.ciphertext.toString()
}

/**
 * 前端本地数据解密方法
 * @param data
 * @returns {string}
 */
export function decrypt(data: any) {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(data)
  const str = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  const decrypt = CryptoJS.AES.decrypt(str, SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}

/**
 * @description 退出登录时要执行的操作
 */
export const logout = () => {
  clearAuth()
  cancelGrayScale()
  globalStore.closeTaskPanel()
  // 登出时权限需重新计算
  const group_id = globalStore.userInfo.group_id || ''
  SessionStorage.remove(`permission_option_list_${group_id}`)
  globalStore.resetUserInfo()
  gmHistory.push('/login')
}

/** 灰度 */
export const addGrayscale = (group_id: string) => {
  // 服务爱农支付 兼容扫码登录
  reactStorage.set('gray_scale_group_id', group_id)
  document.cookie = `gm_erp_group_id=${group_id};expires=${moment()
    .add(1, 'year')
    .toString()};path=${location.pathname};`
  window.location.href = window.location.href.replace(window.location.hash, '')
}

/** 清除灰度信息 */
export const cancelGrayScale = () => {
  reactStorage.remove('gray_scale_group_id')
  document.cookie = `gm_erp_group_id=;expires=0;path=${location.pathname};`
}
