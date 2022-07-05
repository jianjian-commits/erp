/*
 * @Author: your name
 * @Date: 2021-09-27 20:13:21
 * @LastEditTime: 2021-10-11 17:10:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /gm_static_x_erp/src/pages/home/interface.ts
 */

export interface PanelOptions {
  title: any
  right?: any
  children: any
  height?: string
  className?: string
}

export interface BulletinOptions {
  flip: boolean
  className: string
  options: any
}

export interface DateButtonOptions {
  range: number[]
  onChange?(begin: Date, end: Date): void
}

export interface BulletinInfoItemOptions {
  tAcount: number | string
  tName: string
  color: string
  tLink: string
  yLink: string
  yAcount: number | string
  yName: string
}

export interface BulletinInfosOptions {
  [key: string]: BulletinInfoItemOptions
}

type ConfigItemOptionsItem = {
  link: string
  disabled: boolean
  name?: string
}

export interface ConfigItemOptions {
  [key: string]: ConfigItemOptionsItem
}

export interface CommonFunConfigOptions {
  allConfigMap: ConfigItemOptions
  configList: string[]
}

export interface ProfixItemOptions {
  outstock_price_sum: string
  order_price_sum: string
  date: string
  sale_price_sum: string
}

export interface DateButtonMapOptions {
  [key: number]: string
}

export interface AnalyseMerchantItemOptions {
  customer_name: string
  customer_id: string
  order_amount: string | number
}
