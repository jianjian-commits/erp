import type { RangePriceModel } from '../range_price_form_item'

export interface ValidatorFnParams {
  /**
   * 当前区间数据
   */
  value?: RangePriceModel
  /**
   * 所有区间数据
   */
  list?: RangePriceModel[]
  /**
   * 当前数据所在区间列表索引
   */
  index: number
}

export type { RangePriceModel }

export interface ValidatorResult {
  /**
   * 是否通过校验
   */
  isValid: boolean
  /**
   * 校验失败时展示的提示信息
   */
  message: string
}

export type ValidatorFn = (params: ValidatorFnParams) => ValidatorResult
