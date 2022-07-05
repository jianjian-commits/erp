import { Quotation_Status, Quotation_Type } from 'gm_api/src/merchandise'
import { Moment } from 'moment'

interface Model {
  /**
   * 报价单名称
   */
  inner_name: string
  /**
   * 对外名称
   */
  outer_name: string
  /**
   * 设置默认
   */
  is_default: boolean
  /**
   * 状态
   */
  status: Quotation_Status
  /**
   * 描述
   */
  description?: string
}

/**
 * 普通报价单类型 Model
 */
interface NormalModel extends Model {
  /**
   * 报价单类型
   */
  quotation_type: typeof Quotation_Type.WITHOUT_TIME
}

/**
 * 周期报价单类型 Model
 */
interface PeriodicModel extends Model {
  /**
   * 报价单类型
   */
  quotation_type: typeof Quotation_Type.PERIODIC
  /**
   * 父报价单 id
   */
  parent_quotation: string
  /**
   * 生效时间
   */
  effect_period: [Moment, Moment]
}

export type FormModel = NormalModel | PeriodicModel
