import moment from 'moment'
import Big from 'big.js'
import type { ServicePeriod } from 'gm_api/src/enterprise'
import { OrderDetail, OrderRelationInfoResponse, Order } from 'gm_api/src/order'
import { toFixedOrder } from '@/common/util'
import _ from 'lodash'
import {
  BasicPrice,
  BasicPriceItem,
  Ingredients,
  ListBasicPriceByCustomerIDResponse,
  ListBestSaleSkuResponse,
  Quotation,
  Sku_SkuType,
  Unit,
  UnitValueSetV2,
} from 'gm_api/src/merchandise'
import { DetailListItem } from '../interface'
import { getQuantity } from '@/pages/order/order_manage/list/menu_detail/util'
import globalStore from '@/stores/global'
import store from './store'
import { ListSkuStock } from 'gm_api/src/inventory'
import { TableSelectDataItem } from '@gm-pc/react'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'
import { isCombineSku, toBasicUnit } from '@/pages/order/util'

// Todo 当前时间是上一个收货周期
export const getReceiveTime = (
  servicePeriod: ServicePeriod,
  orderTime = `${+new Date()}`,
) => {
  const now = moment()
  const initDay = moment(new Date(+orderTime)).startOf('day')
  const {
    order_receive_max_time,
    order_receive_min_date,
    order_receive_min_time,
  } = servicePeriod

  let firstAvailTime = moment(initDay)
    .add(order_receive_min_date, 'day')
    .add(order_receive_min_time, 'ms')
  if (+order_receive_min_date === 0 && now > firstAvailTime) {
    firstAvailTime = moment(initDay).add(order_receive_max_time, 'ms')
  }

  return {
    receiveTime: `${+firstAvailTime.toDate()}`,
    origin: servicePeriod,
  }
}

/**
 * @description: 根据orderdetail组装list,
 * @param {OrderDetail} orderDetails
 * @param {OrderRelationInfoResponse} ext
 * @param {function} cb 执行一些额外操作
 * @return {*}
 */
export const wrapDetailList = (
  orderDetails: OrderDetail[],
  ext?: OrderRelationInfoResponse | undefined,
  cb?: (d: OrderDetail, i: number) => Partial<DetailListItem>,
): DetailListItem[] => {
  const result = orderDetails
    .sort((a, b) => +a.sort_num - +b.sort_num)
    .map((v, i) => {
      const {
        sku_id,
        sku_name,
        unit_id,
        sku_customize_code,
        order_unit_value_v2,
        outstock_unit_value_v2,
        outstock_second_base_unit_value_v2,
        tax,
        ...rest
      } = v
      const sku_snap = _.find(
        ext?.sku_snaps,
        (value, key) => key === sku_id + '_' + rest.sku_revision,
      )

      const quantity = order_unit_value_v2?.quantity?.val
      const price = order_unit_value_v2?.price?.val
      // 出库数，出库单位
      const std_quantity = outstock_unit_value_v2?.quantity?.val
      const std_unit_id = outstock_unit_value_v2?.quantity?.unit_id
      const std_quantity_second =
        outstock_second_base_unit_value_v2?.quantity?.val
      const std_unit_id_second =
        outstock_second_base_unit_value_v2?.quantity?.unit_id

      const units = rest.unit_cal_info?.unit_lists
      const unit = units?.find((unit) => unit.unit_id === unit_id)
      const parentUnit = units?.find(
        (parentUnit) => parentUnit.unit_id === unit?.parent_id,
      )

      const { texts } = getCategoryValue(
        [],
        [sku_snap?.category_id as string],
        store.categoryMap,
      )

      const category_name = (
        texts.length > 1 ? texts.join('/') : texts.length ? texts[0] : ''
      ) as string

      return {
        ..._.omit(sku_snap, 'units'),
        ...rest,
        tax,
        sku_id,
        unit,
        parentUnit,
        customize_code: sku_customize_code || '',
        name: sku_name || '',
        value: sku_id || '',
        text: sku_name || '',
        category_name,
        unit_id,
        quantity,
        std_unit_id,
        std_quantity,
        std_quantity_second,
        std_unit_id_second,
        price,
        no_tax_price: toFixedOrder(
          Big(price || 0).div(
            Big(tax || 0)
              .div(100)
              .plus(1),
          ),
        ),
        isUsingSecondUnitOutStock: !!std_unit_id_second,
        ...(cb ? cb(v, i) : {}),
      }
    })
  return result
}

// 组合商品原料info
export const makeIngredientSkuList = (
  ingredient: DetailListItem,
  parentId: string,
  quotation_id: string,
  quotation?: Quotation,
  cb?: (ssuInfo: any) => any,
) => {
  const { texts } = getCategoryValue(
    [],
    [ingredient?.category_id as string],
    store.categoryMap,
  )

  const category_name =
    texts.length > 1 ? texts.join('/') : texts.length ? texts[0] : ''

  const result = {
    ...ingredient,
    remark: '',
    category_name,
    price: '',
    value: ingredient?.sku_id! + ingredient?.unit_id!,
    text: ingredient?.name!,
    parentId,
    quotationName: quotation?.outer_name || '-',
    isNewItem: true,
  }

  return {
    ...result,
    ...(cb ? cb(result) : {}),
  }
}

/**
 * @description: * 合并原料,如果存在单品和原料重复，取原料单价
 * parentId用来判断是否原料
 * @param {OrderDetail} list
 * @return {*}
 */
export const mergeOrderDetails = <
  T extends OrderDetail & Pick<DetailListItem, 'parentId'>,
>(
  list: T[],
): Omit<T, 'parentId'>[] => {
  const result: Omit<T, 'parentId'>[] = []
  // 相同商品分组
  const obj = _.groupBy(list, (item) => `${item.sku_id}_${item.unit_id}`)

  const getUnitValueV2Val = (
    orderDetail: OrderDetail,
    key: keyof Pick<
      OrderDetail,
      'outstock_unit_value_v2' | 'order_unit_value_v2'
    >,
  ) => {
    return +(+(orderDetail[key]?.quantity?.val || 0))
  }

  _.forEach(obj, (value) => {
    const detail = {
      // 取原料单价
      ...(value.find((item) => item.parentId) || value[0]),
    }
    const {
      order_unit_value_v2_quantity_val,
      outstock_unit_value_v2_quantity_val,
      base_sku_quantity_val,
      base_sku_outstock_quantity_val,
      // isUpdate,
    } = value.reduce(
      (pre, cur) => {
        if (!cur.parentId) {
          pre.base_sku_quantity_val = Big(pre.base_sku_quantity_val)
            .plus(getUnitValueV2Val(cur, 'order_unit_value_v2'))
            .toNumber()
          pre.base_sku_outstock_quantity_val = Big(
            pre.base_sku_outstock_quantity_val,
          )
            .plus(getUnitValueV2Val(cur, 'outstock_unit_value_v2'))
            .toNumber()
        } else {
          pre.order_unit_value_v2_quantity_val = Big(
            pre.order_unit_value_v2_quantity_val,
          )
            .plus(getUnitValueV2Val(cur, 'order_unit_value_v2'))
            .toNumber()
          pre.outstock_unit_value_v2_quantity_val = Big(
            pre.outstock_unit_value_v2_quantity_val,
          )
            .plus(getUnitValueV2Val(cur, 'outstock_unit_value_v2'))
            .toNumber()
        }
        return pre
      },
      {
        order_unit_value_v2_quantity_val: 0,
        outstock_unit_value_v2_quantity_val: 0,
        base_sku_quantity_val: 0,
        base_sku_outstock_quantity_val: 0,
      },
    )
    /**
     * 判断取整规则
     * 如果是先汇总再取整
     * 原料先汇总再取整，最后再加上单品
     */

    // TODO 先不取整，后面补上
    _.set(
      detail,
      'order_unit_value_v2.quantity.val',
      toFixedOrder(
        // getQuantity(
        //   order_unit_value_v2_quantity_val,
        //   globalStore.orderSetting,
        //   detail.ssu.unit,
        //   detail.ssu.unit_type,
        //   false,
        // ) + base_sku_quantity_val,
        order_unit_value_v2_quantity_val + base_sku_quantity_val,
      ),
    )
    _.set(
      detail,
      'outstock_unit_value_v2.quantity.val',
      toFixedOrder(
        // getQuantity(
        //   outstock_unit_value_v2_quantity_val,
        //   globalStore.orderSetting,
        //   detail.ssu.unit,
        //   detail.ssu.unit_type,
        //   false, //  目前不知道什么时候要传isSummary=TRUE
        // ) + base_sku_outstock_quantity_val,
        outstock_unit_value_v2_quantity_val + base_sku_outstock_quantity_val,
      ),
    )

    result.push(_.omit(detail, 'parentId'))
  })
  return result
}

/**
 * @description: 合并订单处理
 * @param {Order} order    已存在的订单，被合并的对象
 * @param {Order} beMerge    本次新建的订单
 * @return {*}
 */
// 仅合并商品数据
export const orderDiffMerge = (order: Order, beMerge: Order): Order => {
  const orderRawDetail = [
    ...(order.order_raw_details?.order_details || []),
    ...(beMerge.order_raw_details?.order_details || []),
  ].map((v, i) => ({ ...v, sort_num: `${i + 1}` }))

  const orderDetail = [
    ...(order.order_details?.order_details || []),
    ...(beMerge.order_details?.order_details || []),
  ].map((v, i) => ({
    ...v,
    sort_num: `${i + 1}`,
  }))

  return {
    ..._.omit(order, 'quotation_id'),
    order_raw_details: {
      order_details: orderRawDetail,
    },
    order_details: {
      order_details: orderDetail,
    },
  }
}

/** 处理套账 - 加单数字段 */
export const handleAddOrderValue = (
  unitId?: string,
  rawData?: UnitValueSetV2,
): UnitValueSetV2 | undefined => {
  if (_.isNil(unitId)) {
    return undefined
  }
  if (!_.isPlainObject(rawData)) {
    return undefined
  }
  if (_.isNil(rawData?.quantity)) {
    return undefined
  }
  const result: UnitValueSetV2 = {
    quantity: {
      unit_id: rawData?.quantity?.unit_id || unitId,
      val: rawData?.quantity?.val,
    },
  }
  return result
}

/**
 * @description: 一般是提交的时候调用，拼装orderdetail
 * @param {DetailListItem} list
 * @param {*} type
 * @param {*} needOutStockData 是否需要构造出库数数据,默认构造
 * @return {*}
 */
export const wrapOrderDetail = (
  list: DetailListItem[],
  type: 'orderRawDetail' | 'orderDetail',
  needOutStockData = true,
): (OrderDetail & Pick<DetailListItem, 'parentId'>)[] => {
  return list.map((v, i) => {
    const {
      summary,
      remark,
      sku_id,
      price,
      quantity,
      std_quantity,
      second_base_unit_id,
      std_unit_id_second,
      std_quantity_second,
      unit_id,
      fee_unit_id,
      std_unit_id,
      order_detail_id,
      tax,
      supplier_cooperate_model_type,
      parentId,
      detail_random_id,
      ingredients,
      // 套账字段 - 加单数
      add_order_value1,
      add_order_value2,
      add_order_value3,
      add_order_value4,
      // 套账字段 - 是否在配送单打印
      is_print,
      isUsingSecondUnitOutStock,
      sku_unit_is_current_price,
      ...rest
    } = v
    // 编辑时，不要改变商品原本的orderdetailId
    let orderDetailId = order_detail_id

    /**
     * 轻巧版list主体是order_details，且没有detail_random_id可以确立同一个sku(普通商品)在RAW和DETIAL的关系, 所以构造orderRawDetail的时候，要从store.orgOrderDetailIdMap里拿到对应的order_detail_id
     * 标准版是order_raw_details,所以构造order_details的时候，要根据detail_random_id从store.order.order_details里拿到对应的order_detail_id
     */
    if (globalStore.isLite) {
      if (type === 'orderRawDetail')
        orderDetailId = store.orgOrderDetailIdMap[order_detail_id] || '0'
    } else {
      if (type === 'orderDetail')
        orderDetailId =
          _.find(
            _.get(store, 'order.order_details.order_details', []),
            (r) =>
              r.detail_random_id === detail_random_id &&
              r.sku_id === sku_id &&
              r.unit_id === unit_id,
          )?.order_detail_id ||
          order_detail_id ||
          '0'
    }

    const extraFields4Combine = {
      ingredients,
    }
    return {
      ...(_.omit(summary, ['order_unit_value', 'outstock_unit_value']) || {}),
      sku_is_combine_sku: isCombineSku(v),
      order_detail_id: orderDetailId || '0',
      unit_id,
      fee_unit_id,
      sku_id,
      remark,
      sort_num: `${i + 1}`,
      order_unit_value_v2: {
        quantity: {
          unit_id: unit_id || '',
          val: String(quantity),
        },
        price: {
          unit_id: fee_unit_id || '',
          val: String(price || '0'),
        },
      },
      ...(needOutStockData
        ? {
            outstock_unit_value_v2: {
              quantity: {
                unit_id: (globalStore.isLite ? unit_id : std_unit_id) || '',
                val: String(std_quantity),
              },
              // 传出去的时候，order_unit_value_v2保持一致
              price: {
                unit_id: fee_unit_id || '',
                val: String(price || '0'),
              },
            },
          }
        : {}),
      /**
       * 可能存在辅助单位出库数
       * 此时quantity.unit_id有两种情况
       * 1、是由非辅助单位出库数转换来的，那么此时unit_id一定是second_base_unit_id
       * 2、下单单位是辅助单位组，此时unit_id可能是second_base_unit_id的同系单位的unit_id
       */
      ...(needOutStockData && isUsingSecondUnitOutStock && !globalStore.isLite
        ? {
            outstock_second_base_unit_value_v2: {
              quantity: {
                unit_id: std_unit_id_second || '',
                val: String(std_quantity_second),
              },
              price: {
                unit_id: fee_unit_id || '',
                val: String(price || '0'),
              },
            },
          }
        : {}),
      tax: tax || '0', // 税率为空要传0，不然提交报错
      supplier_cooperate_model_type,
      type: type === 'orderRawDetail' ? 1 : 2,
      parentId,
      detail_random_id,
      // 套账字段 - 加单数
      add_order_value1: handleAddOrderValue(unit_id, add_order_value1),
      add_order_value2: handleAddOrderValue(unit_id, add_order_value2),
      add_order_value3: handleAddOrderValue(unit_id, add_order_value3),
      add_order_value4: handleAddOrderValue(unit_id, add_order_value4),
      // 套账字段 - 是否在配送单打印
      is_print,
      sku_unit_is_current_price:
        sku_unit_is_current_price && String(price || '0') !== '0'
          ? false
          : sku_unit_is_current_price,
      ...extraFields4Combine,
    }
  })
}

/**
 * @description: 处理sku
 * @param {function} setList
 * @param {string} quotation_id
 * @param {object} json
 * @param {*} isMenuOrder 是否菜谱订单
 * @param {*} Promise
 * @return {*}
 */
export const handleFetchSkuResponse = async (
  setList: (list: (TableSelectDataItem<string> & DetailListItem)[]) => void,
  quotation_id: string,
  json: {
    response: ListBasicPriceByCustomerIDResponse | ListBestSaleSkuResponse
  },
  isMenuOrder = false,
): Promise<any> => {
  // sku数据
  const list = (_.values(json.response.sku_map) as DetailListItem[]) || []
  // 过滤后的当前报价单的sku
  const basicPrices = json.response.basic_prices as BasicPrice[]

  const ingredient_basic_price = json.response?.ingredient_basic_price
  // 原料信息
  // const single_ssu_infos = json.response.single_ssu_infos || []
  // const res = await ListSkuStock({
  //   paging: { limit: 999 },
  //   unit_stock_map: true,
  //   sku_ids: list.map((v) => v.sku?.sku_id!),
  // })
  // const skuStockMap = list2Map(res.response.sku_stocks, 'sku_id')
  const res = basicPrices.map((basic_price) => {
    // TODO，由于去掉了SSU,这个parse单位的先不在这里处理
    // const sku = v.sku!
    // const parse = parseSsu(ssu)
    const ingredientsInfo: DetailListItem[] = []

    const sku = list.find((sku) => sku.sku_id === basic_price.sku_id)
    if (!sku) {
      return undefined
    }

    const skuPrices = basic_price.items?.basic_price_items || []

    let units, unit_id, fee_unit_id, price

    if (globalStore.isLite) {
      /**
       * 轻巧版，默认带出下单单位，可选基本单位同系单位
       */
      unit_id = skuPrices[0]?.order_unit_id
      price = skuPrices[0]?.fee_unit_price.val
      const baseUnitType = globalStore.unitList.find(
        (unit) => unit.unit_id === sku?.base_unit_id,
      )?.type
      units = _.find(
        globalStore.getSameUnitGroup(),
        (item) => item[0]?.type === baseUnitType,
      )
      fee_unit_id = unit_id
    } else {
      units = skuPrices!.map((item) => {
        const target = sku?.units?.units?.find(
          (item2) => item2.unit_id === item.order_unit_id,
        )

        const parentUnitName = globalStore.unitList.find(
          (unit) => unit.value === (target?.parent_id || item.order_unit_id),
        )?.text

        const name = target
          ? `${target.name}(${target.rate}${parentUnitName})`
          : parentUnitName
        return {
          ...target,
          value: item.order_unit_id,
          text: name,
          name,
        }
      })
    }

    const { texts } = getCategoryValue(
      [],
      [sku?.category_id as string],
      store.categoryMap,
    )

    const category_name =
      texts.length > 1 ? texts.join('/') : texts.length ? texts[0] : ''

    let combineSkuInit
    // 获取组合商品下的原料信息
    // TODO
    if (sku?.sku_type === Sku_SkuType.COMBINE) {
      /**
       * 如果是组合商品，那么不需要选择下单单位
       * 所以要初始化price,quantity,unit_id,fee_unit_id
       * 以及出库数相关字段 std_unit_id, std_quantity,
       */
      combineSkuInit = {
        price: skuPrices[0].fee_unit_price.val,
        quantity: '1',
        unit_id: units?.[0].value,
        fee_unit_id: skuPrices[0].fee_unit_price.unit_id,
        unit: units?.[0],
        std_unit_id: units?.[0].value,
        std_quantity: '1',
      }
      _.forEach(sku?.ingredients?.ingredients, (ingredient, index) => {
        const target = _.find(list, (sku) => sku.sku_id === ingredient.sku_id)

        const basic_price_items =
          ingredient_basic_price?.[`${target?.sku_id}-${quotation_id}`]?.items
            ?.basic_price_items
        const basic_price_items_menu =
          basic_price.ingredient_items?.basic_price_items?.[index]

        let val, unit_id, units

        // *子商品的basicprice，报价单放在ingredient_basic_price， 菜谱放在ingredient_items
        if (isMenuOrder) {
          val = basic_price_items_menu?.fee_unit_price?.val
          unit_id = basic_price_items_menu?.fee_unit_price?.unit_id
          units = [basic_price_items_menu]!.map((item) => {
            const unitInfo = target?.units?.units?.find(
              (item2) => item2.unit_id === item.order_unit_id,
            )

            const parentUnitName = globalStore.unitList.find(
              (unit) =>
                unit.value === (unitInfo?.parent_id || item.order_unit_id),
            )?.text

            const name = unitInfo
              ? `${unitInfo.name}(${unitInfo.rate}${parentUnitName})`
              : parentUnitName
            return {
              ...unitInfo,
              value: item.order_unit_id,
              text: name,
              name,
            }
          })
        } else {
          val = basic_price_items?.find(
            ({ order_unit_id }) => order_unit_id === ingredient.order_unit_id,
          )?.fee_unit_price.val
          unit_id = basic_price_items?.find(
            ({ order_unit_id }) => order_unit_id === ingredient.order_unit_id,
          )?.fee_unit_price.unit_id
          units = basic_price_items!.map((item) => {
            const unitInfo = target?.units?.units?.find(
              (item2) => item2.unit_id === item.order_unit_id,
            )

            const parentUnitName = globalStore.unitList.find(
              (unit) =>
                unit.value === (unitInfo?.parent_id || item.order_unit_id),
            )?.text

            const name = unitInfo
              ? `${unitInfo.name}(${unitInfo.rate}${parentUnitName})`
              : parentUnitName
            return {
              ...unitInfo,
              value: item.order_unit_id,
              text: name,
              name,
            }
          })
        }

        const ingredientSkuInit = {
          price: val,
          quantity: ingredient.ratio,
          unit_id: ingredient.order_unit_id,
          fee_unit_id: unit_id,
          std_unit_id: ingredient.order_unit_id,
          std_quantity: ingredient.ratio,
          units,
          unit: units.find((unit) => unit.value === ingredient.order_unit_id),
        }

        target &&
          ingredientsInfo.push(
            makeIngredientSkuList(
              target,
              sku.sku_id!,
              quotation_id || '',
              undefined,
              (sku) => Object.assign(sku, ingredientSkuInit),
            ) as any,
          )
      })
    }
    return {
      ...sku,
      remark: '',
      category_name,
      // 单价放进map里，选了下单单位才能确定单价
      prices: skuPrices,
      price: price ?? '',
      // 下单单位，
      units: units,
      unit_id: unit_id ?? '',
      fee_unit_id: fee_unit_id ?? '',
      quantity: null,
      ...(isCombineSku(sku!) ? combineSkuInit : {}),
      value: sku?.sku_id || '',
      text: sku?.name || '',
      ingredientsInfo,
      feIngredients: sku?.ingredients,
      // 加一个标志，这个sku是否开启了辅助单位，用于辅助单位出库数
      isUsingSecondUnitOutStock: !!Number(sku?.second_base_unit_id),
    }
  })

  const result = res.filter((item) => !_.isNil(item))
  setList(result)

  return result
}

/**
 * 根据下单单位得到sku定价单位和单价
 */
export const getFeePriceByUnit = (
  unit: string,
  prices: BasicPriceItem[],
  units: Unit[],
  tax: string,
): { fee_unit_id: string; price: string; no_tax_price: string } => {
  const priceTarget = prices.find(
    (item) => item.order_unit_id === unit,
  ) as BasicPriceItem
  if (!priceTarget && globalStore.isLite) {
    return {
      fee_unit_id: unit,
      price: '',
      no_tax_price: '',
    }
  } else {
    const {
      order_unit_id,
      fee_unit_price, // 这个unit_id是定价单位
    } = priceTarget

    const { unit_id, val = '0' } = fee_unit_price!
    // const { rate } = units.find((item) => item.unit_id === unit)!

    return {
      fee_unit_id: unit_id,
      price: val,
      no_tax_price: toFixedOrder(
        Big(val || 0).div(
          Big(tax || 0)
            .div(100)
            .plus(1),
        ),
      ),
    }
  }

  // 定价单位定价
  // if (order_unit_id !== unit_id) {
  //   // 获取rate
  //   const { rate } = units.find((item) => item.unit_id === unit)!
  //   return {
  //     fee_unit_id: unit_id,
  //     price: Big(val).times(rate).toString(),
  //   }
  // } else {
  //   return {
  //     fee_unit_id: unit_id,
  //     price: val,
  //   }
  // }
}

/**
 * 获取单价后面需要展示的单位名称(编辑态使用)
 */
export const handleUnitName = (sku: DetailListItem): string => {
  if (sku.unit_id === sku.fee_unit_id) {
    const unitGroup = sku.units || sku.unit_cal_info?.unit_lists
    // 下单单位和定价单位相同
    // @ts-ignore
    // 如果name为undefined,这个单位是非自定义单位，用text
    const { name, text } =
      unitGroup?.find(
        (unit) => unit.value === sku.unit_id || unit.unit_id === sku.unit_id,
      ) || {}
    return name || text || '-'
  } else {
    return globalStore.getUnitName(sku.fee_unit_id!) || '-'
  }
}

/**
 * @description: 组合商品原料顺序,构建list。
 * 普通商品的detail_random_id以10开头
 * @param {DetailListItem} orderDetail
 * @param {DetailListItem} OrderRawDetail
 * @return {*}
 */
export const handleDetailListWithCombineSku = (
  orderDetail: DetailListItem[],
  OrderRawDetail: DetailListItem[],
) => {
  const result = OrderRawDetail.slice()
  const details = orderDetail.slice()
  const detailMap = _.groupBy(details, (d) => d.detail_random_id)
  _.forEach(detailMap, (ingredients, detail_random_id) => {
    if (!detail_random_id.startsWith('10')) {
      const combineIndex = _.findIndex(
        result,
        (r) => r.detail_random_id === detail_random_id,
      )
      _.forEach(ingredients, (i) => {
        i.parentId = result[combineIndex].sku_id
      })
      result[combineIndex].ingredientsInfo = ingredients
      result.splice(combineIndex + 1, 0, ...ingredients)
    }
  })

  return result.map((item, index) => ({ ...item, sort_num: `${index++}` }))
}

/**
 * @description: 根据配比修改调整单价
 * @param {DetailListItem} skuList
 * @param {Ingredients} ingredients
 * @param {*} number
 * @return {*}
 */
export const updateCombineSkuPriceByRatio = (
  skuList: DetailListItem[],
  ingredients: Ingredients,
): number => {
  let price = Big(0)
  _.each(ingredients.ingredients, (ingredient) => {
    const sku = _.find(
      skuList,
      (sku) =>
        sku.unit_id === ingredient.order_unit_id &&
        sku.sku_id === ingredient.sku_id,
    )

    price = price.plus(
      Big(toBasicUnit(ingredient.ratio || '0', sku, 'ratio')).times(
        toBasicUnit(String(sku?.price) || '0', sku, 'price'),
      ),
    )
  })
  return parseFloat(price.toFixed(2))
}

/**
 * @description: 获取双单位出库数的展示文本
 * @param {DetailListItem} d
 * @return {*}
 */
export const doubleUnitOutStockText = (d: DetailListItem): string => {
  if (d.std_quantity_second && d.std_unit_id_second) {
    // 此时需要展示双单位,辅助单位一定在右边
    return (
      toFixedOrder(d.std_quantity! || 0) +
      (globalStore.getUnitName(d.std_unit_id!) || d.unit?.name!) +
      '/' +
      toFixedOrder(d.std_quantity_second || 0) +
      globalStore.getUnitName(d.std_unit_id_second)
    )
  } else {
    return toFixedOrder(d.std_quantity! || 0) + d.unit?.name!
  }
}
