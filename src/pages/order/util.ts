import moment from 'moment'
import { t } from 'gm-i18n'
import { ListDataItem } from '@gm-pc/react'
import { ServicePeriod, Customer } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { Order, Order_Status } from 'gm_api/src/order'
import {
  Quotation_Type,
  Sku,
  Sku_SkuType,
  SystemUnitId,
  Unit,
} from 'gm_api/src/merchandise'
import { GetSigning } from 'gm_api/src/delivery'

import Big from 'big.js'
import { isSecondDay, toFixedOrder } from '@/common/util'

import { DetailListItem } from './order_manage/components/interface'
import _ from 'lodash'

const dayMM = 86400000
export const dateFilterData = [
  {
    type: 1,
    diyText: t('下单日期'),
    name: t('按下单日期'),
    expand: false,
    limit: (date: Date) => {
      return moment(date) > moment().endOf('day')
    },
  },
  {
    type: 2,
    diyText: t('收货日期'),
    name: t('按收货日期'),
    expand: false,
    limit: (date: Date) => {
      return moment(date) > moment().add(30, 'day').endOf('day')
    },
  },
]

export const isTimeCrossDay = (maxTime: string) => {
  return +maxTime > dayMM
}

const disabledSpan = (
  time: Date,
  date: Date,
  area: { max: string; min: string },
) => {
  const isCrossDay = isTimeCrossDay(area.max)
  if (isCrossDay) {
    const start = moment(date).startOf('day').add(area.max, 'ms').add(-1, 'day')
    return (
      start <= moment(time) &&
      moment(time) < moment(date).startOf('day').add(area.min, 'ms')
    )
  } else {
    return !(
      moment(date).startOf('day').add(area.min, 'ms') <= moment(time) &&
      moment(time) <= moment(date).startOf('day').add(area.max, 'ms')
    )
  }
}
export const disabledOrderTimeSpan = (
  time: Date,
  date: Date,
  service_period: ServicePeriod,
) => {
  const { order_create_max_time, order_create_min_time } = service_period
  return disabledSpan(time, date, {
    max: order_create_max_time,
    min: order_create_min_time,
  })
}

export const disabledReceiveTimeSpan = (
  time: Date,
  date: Date,
  service_period: ServicePeriod,
) => {
  const { order_receive_max_time, order_receive_min_time } = service_period
  return disabledSpan(time, date, {
    max: order_receive_max_time,
    min: order_receive_min_time,
  })
}

export const getCustomerStatus = (customer: Customer) => {
  if (!customer.is_reviewed) {
    return { type: 1, desc: t('未审核') }
  }

  if (customer.is_frozen) {
    return { type: 1, desc: t('冻结') }
  }
  return { type: 0, desc: t('正常') }
}

// 是否是合法的下单时间
export const isValidOrderTime = (service_period: ServicePeriod): boolean => {
  const { order_create_min_time, order_create_max_time } = service_period
  const isSecond = isSecondDay(order_create_max_time)
  const now = moment()
  const date = moment(now).startOf('day')
  /**
   * 如果是第二天，周期往前推一天
   * 比如当前时间为6.2 11点，周期为12：00 ~ 第二天11：30(即6.1 12:00 ~ 6.2 11:30)
   * 当前时间是属于上面周期的
   */
  const start = moment(date).add(order_create_min_time, 'ms')
  const end = moment(date).add(order_create_max_time, 'ms')
  const flag = now >= start && now <= end
  // 如果不是跨天，直接返回
  if (!isSecond) {
    return flag
  }
  const prePeriodStart = moment(date).add(+order_create_min_time - dayMM, 'ms')
  const prePeriodEnd = moment(date).add(+order_create_max_time - dayMM, 'ms')
  const preFlag = now >= prePeriodStart && now <= prePeriodEnd
  return flag || preFlag
}

export const getBaseUnitName = (id: string): string => {
  return globalStore.getUnitName(id)
}

export const getOrderDetailUrl = (order: Order): string => {
  const isMenuOrder =
    order.quotation_type === Quotation_Type.WITH_TIME ||
    +order.status! & Order_Status.STATUS_HAS_COMBINE_SSU
  //   return `#/order/order_manage/list/${
  //     isMenuOrder ? 'menu_detail' : 'detail'
  //   }?id=${order?.serial_no}&type=${order.app_type}`

  // 标准版不区分两个view
  return globalStore.isLite
    ? `#/order/order_manage/list/${isMenuOrder ? 'menu_detail' : 'detail'}?id=${
        order?.serial_no
      }&type=${order.app_type}`
    : `#/order/order_manage/list/detail?id=${order?.serial_no}&type=${order.app_type}`
}
// 获取司机app签收图片url
export const getSignImgUrl = async (order_id: string) => {
  const signInfo = await GetSigning({
    signing: {
      order_id,
    },
  })
  const sign_img_url = signInfo?.response?.signing?.image?.path || undefined
  return sign_img_url
}

/** 判断当前计算数值为小数后几位，对应展示
 * 无穷尽小数：取6位展示 + ...
 * 否则正常展示即可
 */
export const isEndless = (b: Big): boolean => {
  const _b = b.toString().split('.')
  const del = _b[1] || ''
  if (del.length > 6) return true
  return false
}

export const getEndlessPrice = (b: Big): string => {
  const _b = b.toString().split('.')
  const del = _b[1] || ''
  if (del.length > 6) {
    return `${b.toFixed(6)}...`
  }
  return toFixedOrder(b).toString()
}

/** 计算销售额
 * 都需要转换成计价单位计算，中间不做任何舍入操作
 * 最后直接舍入保存两位小数展示
 * 销售额 = outsotck_price + aftersale_price, 目前没有其他优惠金额，先不管
 * 不含税销售额 = 销售额 / （1 + 税率）
 */
export const calculateSalePrice = (sku: DetailListItem, withTax = false) => {
  /**
   * 当且仅当定价单位属于辅助单位组的时候，用辅助单位出库数去算金额
   */

  let sale_price = Big(0)
  if (
    !sku.parentId &&
    globalStore.isSameUnitGroup(sku.fee_unit_id!, sku.second_base_unit_id!)
  ) {
    sale_price = Big(
      toBasicUnit(
        String(sku.std_quantity_second) || '0',
        sku,
        'std_quantity_second',
      ),
    ).times(toBasicUnit(String(sku.price) || '0', sku, 'price'))
  } else {
    sale_price = Big(
      toBasicUnit(String(sku.std_quantity) || '0', sku, 'std_quantity'),
    ).times(toBasicUnit(String(sku.price) || '0', sku, 'price'))
  }

  return withTax
    ? toFixedOrder(sale_price)
    : toFixedOrder(
        sale_price.div(
          Big(sku?.tax || 0)
            .div(100)
            .plus(1),
        ),
      )
}

/**
 * @deprecated
 * 获取单位转换后的数量
 */
export const getQuantityByUnit = (
  unitId: string | undefined,
  parentId: string | undefined,
  type: 'calculate' | 'package',
  originVal: string | number,
  rate: number,
): Big => {
  const isCalculateUnit = unitId === parentId
  return type === 'calculate'
    ? isCalculateUnit
      ? Big(originVal || 0)
      : Big(originVal || 0).times(rate || 0)
    : isCalculateUnit
    ? Big(originVal || 0).div(rate || 1)
    : Big(originVal || 0)
}

/**
 * @deprecated
 * 获取单位转换后的金额
 */
export const getPriceByUnit = (
  unitId: string | undefined,
  parentId: string | undefined,
  type: 'calculate' | 'package',
  originVal: string | number,
  rate: number,
): Big => {
  const isCalculateUnit = unitId === parentId
  return type === 'calculate'
    ? isCalculateUnit
      ? Big(originVal || 0)
      : Big(originVal || 0).div(rate || 1)
    : isCalculateUnit
    ? Big(originVal || 0).times(rate || 0)
    : Big(originVal || 0)
}

/**
 * 判断是否组合商品
 */
export const isCombineSku = (item: DetailListItem): boolean =>
  item.sku_is_combine_sku || item?.sku_type === Sku_SkuType.COMBINE

/**
 * 根据sku获取定价单位名称(非编辑态使用)
 */
export const getFeeUnitName = (sku: DetailListItem): string => {
  let { unit, parentUnit, units, unit_cal_info } = sku
  if (!unit || !parentUnit) {
    const unitGroup = (units || unit_cal_info?.unit_lists) as Unit[]

    unit = unitGroup?.find((unit) => unit.unit_id === sku.unit_id)
    parentUnit = unitGroup?.find(
      (parentUnit) => parentUnit.unit_id === unit?.parent_id,
    )
  }
  if (sku.unit_id === sku.fee_unit_id) {
    // 下单单位和定价单位相同
    // @ts-ignore

    // 暂时不展示后面的换算单位,如袋（3斤）
    // return parentUnit
    //   ? `${unit?.name}(${unit?.rate}${parentUnit.name})`
    //   : unit?.name
    return unit?.name || '-'
  } else {
    return globalStore.getUnitName(sku.fee_unit_id!) || '-'
  }
}

/**
 * 获取下单单位名称
 */
export const getOrderUnitName = (parentUnit: Unit | undefined, unit: Unit) => {
  const unitRelation =
    +unit?.unit_id! < SystemUnitId.SYSTEM_UNIT_ID_BEGIN && parentUnit
      ? `(${unit?.rate}${parentUnit.name})`
      : ''
  const name = parentUnit ? `${unit?.name}${unitRelation}` : unit?.name
  return name || '-'
}

const quantityIDMap = {
  quantity: 'unit_id',
  std_quantity: 'std_unit_id',
  std_quantity_second: 'std_unit_id_second',
  ratio: 'unit_id',
}

/**
 * 将价格或者数量，统一转换成基本单位进行计算
 */
export const toBasicUnit = (
  org: string,
  params: any,
  type: 'price' | 'quantity' | 'std_quantity' | 'std_quantity_second' | 'ratio',
): Big => {
  const {
    fee_unit_id,
    unit_id,
    units,
    unit_cal_info,
    base_unit_id,
    second_base_unit_id,
    second_base_unit_ratio,
  } = params
  const unitGroup = units || unit_cal_info?.unit_lists
  try {
    if (type === 'price') {
      /**
       * 转换价格
       * 定价单位有如下情况
       * 1、基本单位组，
       * 2、辅助单位组
       * 3、自定义单位
       */
      if (!(fee_unit_id! < SystemUnitId.SYSTEM_UNIT_ID_BEGIN)) {
        if (
          fee_unit_id === base_unit_id ||
          globalStore.getUnit(fee_unit_id)?.parent_id ===
            globalStore.getUnit(base_unit_id)?.parent_id ||
          globalStore.getUnit(fee_unit_id)?.parent_id === base_unit_id ||
          globalStore.getUnit(base_unit_id)?.parent_id === fee_unit_id
        ) {
          // 基本单位组
          return Big(org).div(
            globalStore.getUnitRate(fee_unit_id, base_unit_id),
          )
        } else {
          // 辅助单位组
          if (fee_unit_id === second_base_unit_id) {
            // 如果是辅助单位
            return Big(org).div(second_base_unit_ratio)
          } else {
            // 辅助单位同系单位
            return Big(org)
              .div(second_base_unit_ratio)
              .div(globalStore.getUnitRate(unit_id, second_base_unit_id))
          }
        }
      } else {
        // 自定义单位
        const { parent_id, rate } =
          unitGroup.find((unit) => unit.unit_id === fee_unit_id) || {}
        if (
          parent_id === base_unit_id ||
          globalStore.getUnit(parent_id)?.parent_id ===
            globalStore.getUnit(base_unit_id)?.parent_id ||
          globalStore.getUnit(parent_id)?.parent_id === base_unit_id ||
          globalStore.getUnit(base_unit_id)?.parent_id === parent_id
        ) {
          // 基本单位组
          return Big(org)
            .div(rate)
            .div(globalStore.getUnitRate(parent_id, base_unit_id))
        } else {
          // 辅助单位组
          return Big(org)
            .div(rate)
            .div(globalStore.getUnitRate(parent_id, second_base_unit_id))
            .div(second_base_unit_ratio)
        }
      }
    } else {
      /**
       * 数量转基本单位，需要用对应的unitID去计算
       * quantity(下单数) => unit_id
       * std_quantity(非辅助单位出库数) => std_unit_id
       * std_quantity_second(辅助单位出库数) => std_unit_id_second
       */
      const id = params[quantityIDMap[type]]
      // 先判断是否是基本单位
      if (!(id! < SystemUnitId.SYSTEM_UNIT_ID_BEGIN)) {
        // 如果不是自定义单位，且不是辅助单位，那么就是基本单位或者其同系单位
        if (
          id === base_unit_id ||
          globalStore.getUnit(id)?.parent_id ===
            globalStore.getUnit(base_unit_id)?.parent_id ||
          globalStore.getUnit(id)?.parent_id === base_unit_id ||
          globalStore.getUnit(base_unit_id)?.parent_id === id
        ) {
          if (id === base_unit_id) {
            // 基本单位
            return Big(org)
          } else {
            // 基本单位同系单位
            return Big(org).times(globalStore.getUnitRate(id, base_unit_id))
          }
        } else {
          // 辅助单位或者其同系单位
          if (id === second_base_unit_id) {
            // 如果是辅助单位
            return Big(org).times(second_base_unit_ratio)
          } else {
            // 辅助单位同系单位
            return Big(org)
              .times(second_base_unit_ratio)
              .times(globalStore.getUnitRate(id, second_base_unit_id))
          }
        }
      } else {
        /**
         * 自定义单位
         * 1、先判断parentId是基本单位组还是辅助单位组
         * 2、找到parentId与基本单位间的转换
         */
        const { parent_id, rate } =
          unitGroup.find((unit) => unit.unit_id === id) || {}
        if (
          parent_id === base_unit_id ||
          globalStore.getUnit(parent_id)?.parent_id ===
            globalStore.getUnit(base_unit_id)?.parent_id ||
          globalStore.getUnit(parent_id)?.parent_id === base_unit_id ||
          globalStore.getUnit(base_unit_id)?.parent_id === parent_id
        ) {
          // 基本单位组
          return Big(org)
            .times(rate)
            .times(globalStore.getUnitRate(parent_id, base_unit_id))
        } else {
          // 辅助单位组
          return Big(org)
            .times(rate)
            .times(globalStore.getUnitRate(parent_id, second_base_unit_id))
            .times(second_base_unit_ratio)
        }
      }
    }
  } catch (error) {
    console.log(`error: 错误的unit关系_sku${params.name}`)
    return Big(0)
  }
}

/**
 * @description: 用于辅助单位出库数相关转化
 * @param {number} std_quantity   待转换的出库数
 * @param {string} std_quantity_unitId  下单单位出库数unitId
 * @param {DetailListItem} item    数据源
 * @param {*} type  转换模式
 * @return {*} number
 */
export const transformOutStock = (
  std_quantity: number,
  std_quantity_unitId: string,
  item: DetailListItem,
  type: 'TO_SECONDUNIT' | 'FROM_SECONDUNIT',
): number => {
  const {
    unit_id,
    units,
    unit_cal_info,
    base_unit_id,
    second_base_unit_id,
    second_base_unit_ratio,
  } = item
  const unitGroup = units || unit_cal_info?.unit_lists
  if (type === 'TO_SECONDUNIT') {
    /**
     * 将下单单位出库数转换成辅助单位出库数，
     * 1、下单单位是基本单位组
     * 2、下单单位是自定义单位
     */
    if (+std_quantity_unitId! < SystemUnitId.SYSTEM_UNIT_ID_BEGIN) {
      // 下单单位出库数是自定义单位
      const { parent_id, rate } =
        unitGroup?.find((unit) => unit.unit_id === std_quantity_unitId) || {}
      if (
        parent_id === base_unit_id ||
        globalStore.getUnit(parent_id!)?.parent_id ===
          globalStore.getUnit(base_unit_id)?.parent_id ||
        globalStore.getUnit(parent_id!)?.parent_id === base_unit_id ||
        globalStore.getUnit(base_unit_id)?.parent_id === parent_id
      ) {
        // parentId基本单位组,    基本单位数量 / second_base_unit_ratio = 辅助单位数量
        return +Big(std_quantity)
          .times(rate!)
          .times(globalStore.getUnitRate(parent_id!, base_unit_id))
          .div(second_base_unit_ratio!)
      } else {
        // parentId辅助单位组，
        return +Big(std_quantity)
          .times(rate!)
          .times(globalStore.getUnitRate(parent_id!, second_base_unit_id!))
      }
    } else {
      // 下单单位出库数是基本单位组
      return +Big(std_quantity)
        .times(globalStore.getUnitRate(std_quantity_unitId!, base_unit_id))
        .div(second_base_unit_ratio!)
    }
  } else if (type === 'FROM_SECONDUNIT') {
    // 下单单位是辅助单位组，此时要从辅助单位出库数转成基本单位出库数
    return +Big(std_quantity)
      .times(
        globalStore.getUnitRate(std_quantity_unitId!, second_base_unit_id!),
      )
      .times(second_base_unit_ratio!)
  } else {
    return 0
  }
}

export const getSkuDefaultUnitId = (
  baseUnitId: string,
  secondBaseUnitId: string | undefined,
  units: (Unit & ListDataItem<any>)[] | undefined,
) => {
  let unit_id = units?.length ? units[0].value : ''
  if (_.find(units, (unitItem) => unitItem.value === baseUnitId)) {
    unit_id = baseUnitId
  } else if (_.find(units, (unitItem) => unitItem.value === secondBaseUnitId)) {
    unit_id = secondBaseUnitId
  }
  return unit_id
}
