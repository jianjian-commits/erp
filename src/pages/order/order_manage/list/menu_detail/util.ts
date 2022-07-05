import Big from 'big.js'
import {
  Ssu_Type,
  Quotation,
  SsuTotalInfo,
  Ssu_ShippingFeeUnit,
  UnitValueSet,
  UnitValueSetV2,
  Ssu_Ingredients,
  Unit_Type,
  UnitType,
  Unit,
  Sku as SkuBase,
  Sku_SkuType,
  Ingredients,
} from 'gm_api/src/merchandise'
import { OrderDetail, OrderRelationInfoResponse } from 'gm_api/src/order'
import _ from 'lodash'
import { parseSsu, toFixedOrder } from '@/common/util'
import { Sku, Ssu } from '../../components/interface'
import globalStore from '@/stores/global'
import { getPriceByUnit, toBasicUnit } from '@/pages/order/util'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'
import store from './store'

interface OrderSetting {
  COMBINEROUND_CLOSE: boolean
  COMBINEROUND_UP: boolean
  COMBINEROUND_MID: boolean
  COMBINEROUND_WHEN_BEFORE: boolean
  COMBINEROUND_WHEN_AFTER: boolean
}

export const getOrderDetail = (
  i: number,
  v: Sku,
  cb: (v: Sku) => {
    order_unit_value?: UnitValueSet
    outstock_unit_value?: UnitValueSet
    order_unit_value_v2: UnitValueSetV2
    outstock_unit_value_v2: UnitValueSetV2
  },
) => {
  const {
    summary,
    remark,
    sku_id,
    price,
    quantity,
    std_quantity,
    unit_id,
    fee_unit_id,
    order_detail_id = '0',
    tax,
    supplier_cooperate_model_type,
    ...rest
  } = v

  // 区分新增(order_detail_id === '0')时的传参
  return order_detail_id === '0'
    ? {
        remark,
        sku_id,
        price,
        quantity,
        std_quantity,
        unit_id,
        fee_unit_id,
        order_detail_id,
        tax,
        supplier_cooperate_model_type,
        sort_num: `${i + 1}`,
        ..._.pick(cb(v), ['order_unit_value_v2', 'outstock_unit_value_v2']),
      }
    : {
        ...(summary || {}),
        ...rest,
        sku_id,
        price,
        quantity,
        std_quantity,
        unit_id,
        fee_unit_id,
        order_detail_id,
        tax,
        supplier_cooperate_model_type,
        sort_num: `${i + 1}`,
        ...cb(v),
      }
}

export const wrapDetailList = (
  orderDetails: OrderDetail[],
  ext: OrderRelationInfoResponse | undefined,
  cb?: (d: OrderDetail, i: number) => any,
) => {
  return orderDetails
    .sort((a, b) => +a.sort_num - +b.sort_num)
    .map((v, i) => {
      const {
        sku_id,
        sku_name,
        unit_id,
        sku_customize_code,
        order_unit_value_v2,
        outstock_unit_value_v2,
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

      const category_name =
        texts.length > 1 ? texts.join('/') : texts.length ? texts[0] : ''

      return {
        ..._.omit(sku_snap, 'units'),
        ...rest,
        sku_id,
        unit,
        parentUnit,
        customize_code: sku_customize_code,
        name: sku_name,
        value: sku_id || '',
        text: sku_name || '',
        category_name,
        unit_id,
        quantity,
        std_quantity,
        price,
        ...(cb ? cb(v, i) : {}),
      }
    })
}

export const getOrderSkuList = (
  orderDetails: OrderDetail[] = [],
  relation: OrderRelationInfoResponse = {},
  quotation: Quotation,
): Sku[] => {
  return wrapDetailList(orderDetails, relation, (detail) => {
    const { ingredients, order_detail_id, unit_id, ...rest } = detail
    const units = rest.unit_cal_info?.unit_lists
    const unit = units?.find((unit) => unit.unit_id === unit_id)
    const parentUnit = units?.find(
      (parentUnit) => parentUnit.unit_id === unit?.parent_id,
    )
    return {
      order_detail_id,
      summary: rest,
      unit,
      parentUnit,
      detail_status: detail?.status,
      sort_num: detail.sort_num,
      isNewItem: false,
      basic_price: {
        current_price: !!detail?.sku_unit_is_current_price,
      },
      // 若是组合商品在菜谱中被修改了配比
      feIngredients: ingredients,
      quotationName: quotation?.outer_name || '-',
    }
  })
}

interface SsuInfo extends SsuTotalInfo {
  single_ssu_infos?: SsuTotalInfo[]
}

export const getSsuFromSearch = (
  v: SsuInfo,
  menuList: Ssu[],
  skuList: Ssu[],
  skuStockMap: {
    [key: string]: any
  } = {},
) => {
  const ssu = v.ssu
  const parse = parseSsu(ssu!)

  // 若是订单详情中已存在该商品，进行价格同步
  let detailOrg = null
  if (ssu?.type === Ssu_Type.TYPE_COMBINE) {
    detailOrg = _.find(
      menuList,
      (m) => m.sku_id === ssu.sku_id && m.unit_id === ssu.unit_id,
    )
  } else {
    detailOrg = _.find(
      skuList,
      (m) => m.sku_id === ssu?.sku_id && m.unit_id === ssu?.unit_id,
    )
  }

  // current_price表示时价，组合商品不需要管时价
  return {
    ...ssu,
    ...parse,
    remark: '',
    category_name:
      v?.category_infos?.map((v) => v.category_name)?.join('/') || '未知',
    price: detailOrg
      ? detailOrg.price
      : v?.basic_price?.current_price
      ? 0
      : ssu?.shipping_fee_unit === Ssu_ShippingFeeUnit.PACKAGE
      ? +v.price!
      : +toFixedOrder(Big(v.price || 0).times(parse?.ssu_unit_rate || 1)),
    stdPrice: v?.basic_price?.current_price
      ? 0
      : ssu?.shipping_fee_unit === Ssu_ShippingFeeUnit.BASE
      ? detailOrg
        ? detailOrg.price
        : +v.price!
      : +toFixedOrder(
          Big(detailOrg?.price || v.price || 0).div(parse?.ssu_unit_rate || 1),
        ),
    _skuStock: skuStockMap[v.sku?.sku_id!],
    basic_price: v?.basic_price,
    feIngredients: detailOrg
      ? detailOrg.feIngredients
      : v.basic_price
      ? v.basic_price.ssu_ingredients
      : v.ssu?.ingredients,
    value: ssu?.sku_id! + ssu?.unit_id!,
    text: ssu?.name,
    single_ssu_infos: (v?.single_ssu_infos || []).slice(),
  }
}

const getSsuPrice = (ssu: Ssu, price: string, rate: string): number => {
  const newPrice =
    ssu.shipping_fee_unit === Ssu_ShippingFeeUnit.PACKAGE
      ? parseFloat(price)
      : +toFixedOrder(Big(price).times(rate || 1))
  return newPrice
}

// 编辑后再次进入订单，需要直接用订单详情的价格展示
export const getSku = (
  unit_id: string,
  skuInfo: SkuBase,
  orderOrg: OrderDetail | undefined,
  editOrderOrg: Sku | undefined,
  skuStockMap: {
    [key: string]: any
  } = {},
): Sku => {
  const skuUnitId = unit_id
  let price = null
  let stdPrice = null
  let tax = null
  let units, unit, parentUnit, fee_unit_id, order_detail_id
  // 所有改动都调用此方法更新，所以需要有优先级：editOrderOrg > orderOrg > ssu
  // price包装单位单价
  if (editOrderOrg) {
    order_detail_id = editOrderOrg.order_detail_id
    price = editOrderOrg.price
    stdPrice = editOrderOrg.stdPrice
    tax = editOrderOrg?.tax || ''
    unit = editOrderOrg.unit
    units = editOrderOrg.units
    parentUnit = editOrderOrg.parentUnit
    fee_unit_id = editOrderOrg.fee_unit_id
  } else {
    if (orderOrg) {
      order_detail_id = orderOrg.order_detail_id
      price = orderOrg.order_unit_value_v2?.price?.val
      tax = orderOrg.tax || ''
      fee_unit_id = orderOrg.fee_unit_id
      units = orderOrg.unit_cal_info?.unit_lists
      unit = units?.find((unit) => unit.unit_id === unit_id)
      // TODO 基本单位和辅助单位没有建立关系,等后台
      parentUnit = units?.find(
        (parentUnit) => parentUnit.unit_id === unit?.parent_id,
      )
    } else {
      // todo 这里要拿报价单的单价
      const target = skuInfo
      const {
        items: { basic_price_items },
      } =
        store.ingredientBasicPrice[
          `${target?.sku_id}-${store.order.customer?.quotation.quotation_id}`
        ]
      const {
        fee_unit_price: { val, unit_id },
      } = basic_price_items.find(
        ({ order_unit_id }) => order_unit_id === skuUnitId,
      )
      units = basic_price_items!.map((item) => {
        const unitInfo = target?.units?.units?.find(
          (item2) => item2.unit_id === item.order_unit_id,
        )

        const parentUnitName = globalStore.unitList.find(
          (unit) => unit.value === (unitInfo?.parent_id || item.order_unit_id),
        )?.text

        const name = unitInfo ? unitInfo.name : parentUnitName
        return {
          ...unitInfo,
          value: item.order_unit_id,
          text: name,
          name,
        }
      })
      price = val
      parentUnit = unit = units?.find(
        (unit) => unit.unit_id === skuUnitId || unit.value === skuUnitId,
      )
      fee_unit_id = unit_id
      tax = target?.tax || ''
    }
  }

  const { texts } = getCategoryValue(
    [],
    [skuInfo?.category_id as string],
    store.categoryMap,
  )

  const category_name =
    texts.length > 1 ? texts.join('/') : texts.length ? texts[0] : ''

  return {
    ...skuInfo,
    order_detail_id,
    unit_id,
    fee_unit_id,
    units,
    unit,
    parentUnit,
    remark: '',
    sorting_status: editOrderOrg?.sorting_status || orderOrg?.sorting_status,
    original: { ...skuInfo } as SkuBase,
    category_name,
    price,
    stdPrice,
    tax,
    _skuStock: skuStockMap[skuInfo.sku_id!],
    basic_price: { basic_price_id: '', quotation_id: '' },
    feIngredients: skuInfo?.ingredients,
    value: skuInfo?.sku_id! + skuInfo?.unit_id!,
    text: skuInfo?.name!,
    detail_status: orderOrg?.status!,
    aftersale_price: orderOrg?.aftersale_price!,
    return_refund_value: orderOrg?.return_refund_value!,
    just_refund_value: orderOrg?.just_refund_value!,
  }
}

export const getNotCountUnitQuantity = (
  quantity: number,
  unit: Unit,
  unit_type: UnitType,
) => {
  const baseUnit = globalStore.getUnit(unit?.parent_id)
  const isNotCountUnit =
    unit_type === UnitType.SYSTEM_UNIT && baseUnit.type !== Unit_Type.COUNT

  if (isNotCountUnit) {
    return parseFloat(`${quantity}`) < 0.01 ? 0.01 : quantity
  }

  return quantity
}

/** 针对订单组合商品原料下单数取整规则计算
 * 1、开启
 * 取整规则：向上取整 / 四舍五入
 * 多个组合商品原料汇总取整规则：取整再汇总 / 汇总再取整
 * 2、关闭
 * 按照原有填写直接计算即可
 *
 * 取整规则：
 * 系统单位，且为数量单位，取整
 * 自定义单位，取整
 */
export const getQuantity = (
  quantity: number,
  orderSetting: OrderSetting,
  unit: Unit,
  unit_type: UnitType,
  isSummary: boolean,
): number => {
  const baseUnit = globalStore.getUnit(unit?.parent_id)
  const isCustomUnit = unit_type === UnitType.SSU_UNIT
  const isCountUnit =
    unit_type === UnitType.SYSTEM_UNIT && baseUnit.type === Unit_Type.COUNT

  if (isCustomUnit || isCountUnit) {
    // 根据取整规则做处理,当前不是汇总数据，判断是否汇总后取整
    if (!isSummary && orderSetting.COMBINEROUND_WHEN_AFTER) {
      return quantity
    }

    // 当前数据为汇总数据，判断是否取整后汇总
    if (isSummary && orderSetting.COMBINEROUND_WHEN_BEFORE) {
      return quantity
    }

    // 向上取整
    if (orderSetting.COMBINEROUND_UP) {
      return Math.ceil(quantity)
    }

    // 四舍五入
    if (orderSetting.COMBINEROUND_MID) {
      return Math.round(quantity)
    }
  }

  if (isSummary) {
    return parseFloat(`${quantity}`) < 0.01 ? 0.01 : quantity
  }

  return quantity
}

// 组合商品与普通商品合并 -- 下单数的计算
export const mergeSsuList = (
  menuList: Sku[],
  skuMap: { [key: string]: SkuBase },
  orderDetails: OrderDetail[] | undefined,
  skuList: Sku[] | undefined, // 初始化的时候，skuList是undefined
  orderSetting?: OrderSetting, // 下单取整规则
): Sku[] => {
  const result: Sku[] = []
  const skuIndexMap: { [key: string]: number } = {}

  const merge = (sku: Sku, isIngredients: boolean): void => {
    if (_.isUndefined(skuIndexMap[sku.sku_id! + sku.unit_id!])) {
      if (isIngredients || !skuList) {
        result.push(sku)
      } else {
        result.push({
          base_quantity: sku.quantity!,
          base_std_quantity: sku.std_quantity!,
          // base_real_quantity_fe: sku.real_quantity_fe,
          // base_std_real_quantity_fe: sku.std_real_quantity_fe,
          ..._.omit(sku, [
            'quantity',
            'std_quantity',
            // 'real_quantity_fe',
            // 'std_real_quantity_fe',
          ]),
        })
      }
      skuIndexMap[sku.sku_id! + sku.unit_id!] = result.length - 1
    } else {
      const index = skuIndexMap[sku.sku_id! + sku.unit_id!]

      const orderOrg = _.find(
        orderDetails || [],
        (o) => o.sku_id === sku.sku_id && o.unit_id === sku.unit_id,
      )
      /**
       * 当取整规则是先汇总后取整时，单品和原料要分开计算
       */
      if (!orderOrg) {
        if (!isIngredients) {
          result[index].base_quantity = +Big(
            result[index].base_quantity || 0,
          ).plus(sku.quantity || 0)

          result[index].base_std_quantity = +Big(
            result[index].base_std_quantity || 0,
          ).plus(sku.std_quantity || 0)

          // result[index].base_real_quantity_fe = +Big(
          //   result[index].base_real_quantity_fe || 0,
          // ).plus(sku.real_quantity_fe || 0)
          // result[index].base_std_real_quantity_fe = +Big(
          //   result[index].base_std_real_quantity_fe || 0,
          // ).plus(sku.std_real_quantity_fe || 0)
        } else {
          result[index].quantity = +Big(result[index].quantity || 0).plus(
            sku.quantity || 0,
          )
          result[index].std_quantity = +Big(
            result[index].std_quantity || 0,
          ).plus(sku.std_quantity || 0)

          // result[index].real_quantity_fe = +Big(
          //   result[index].real_quantity_fe || 0,
          // ).plus(sku.real_quantity_fe || 0)
          // result[index].std_real_quantity_fe = +Big(
          //   result[index].std_real_quantity_fe || 0,
          // ).plus(sku.std_real_quantity_fe || 0)
        }
      }
    }
  }
  _.each(menuList, (ssu) => {
    if (ssu.sku_type === Sku_SkuType.COMBINE) {
      _.each(ssu.ingredients?.ingredients, (v) => {
        const skuInfo = _.find(skuMap, (item) => item.sku_id === v.sku_id)!

        // 若是初始化，获取的就是原orderDetail信息
        const orderOrg = _.find(
          orderDetails || [],
          (o) => o.sku_id === v.sku_id && o.unit_id === v.order_unit_id,
        )
        // 若是已经被编辑，应该获取之前的单价信息
        let editOrderOrg = _.find(
          skuList || [],
          (o) => o.sku_id === v.sku_id && o.unit_id === v.order_unit_id,
        )
        if (editOrderOrg) {
          // ! editOrderOrg是基本的sku信息，不包含单位信息，所以需要从orderDetail里面找到
          const { units, unit, parentUnit, fee_unit_id } =
            _.find(
              store.list || [],
              (o) => o.sku_id === v.sku_id && o.unit_id === v.order_unit_id,
            ) || {}

          editOrderOrg = {
            ...editOrderOrg,
            ...{
              units,
              unit,
              parentUnit,
              fee_unit_id,
            },
          }
        }

        /** 获取原料sku的相关信息 */
        let ingredientsSku: Sku = getSku(
          // skuMap[v.sku_id!],
          v.order_unit_id!,
          skuInfo,
          orderOrg,
          editOrderOrg,
          undefined,
        )

        const quantity = +toFixedOrder(Big(ssu.quantity || 0).times(v.ratio))
        const outstockQuantity = +toFixedOrder(
          Big(ssu.quantity || 0).times(v.ratio),
        )

        if (orderOrg) {
          // 下单数
          ingredientsSku.quantity =
            +orderOrg?.order_unit_value_v2?.quantity?.val!

          // 出库数
          ingredientsSku.std_quantity =
            +orderOrg?.outstock_unit_value_v2?.quantity?.val!
        } else {
          // TODO 先不做取整
          // 下单数
          ingredientsSku.quantity = quantity

          // 出库数
          ingredientsSku.std_quantity = outstockQuantity
        }

        ingredientsSku = {
          ...ingredientsSku,
          // 原料下单单位
          unit_id: v.order_unit_id,
          quotationName: ssu.quotationName,
          aftersale_price: orderOrg?.aftersale_price,
        }
        if (skuInfo) merge(ingredientsSku, true)
      })
    } else {
      // 非组合商品也需要同步相关信息，当下单数或单价修改时，出库数以及相关金额计算都需要更新
      // 若是已经被编辑，应该获取之前的单价信息
      const editOrderOrg = _.find(
        skuList || [],
        (o) => o.sku_id === ssu.sku_id && o.unit_id === ssu.unit_id,
      )
      const orderOrg = _.find(
        orderDetails || [],
        (o) => o.sku_id === ssu.sku_id && o.unit_id === ssu.unit_id,
      )
      let newSsu = _.cloneDeep(ssu)
      newSsu = {
        ...newSsu,
        original: { ...ssu },
        quantity: orderOrg
          ? +orderOrg?.order_unit_value_v2?.quantity?.val!
          : newSsu.quantity || 0,
        std_quantity: orderOrg
          ? +orderOrg?.outstock_unit_value_v2?.quantity?.val!
          : newSsu.quantity || 0,
        // 需要判断ssu是如何计价的
        price: editOrderOrg
          ? editOrderOrg.price
          : orderOrg
          ? parseFloat(orderOrg?.order_unit_value_v2?.price?.val || '0')
          : newSsu?.price,
        detail_status: orderOrg?.status,
        aftersale_price: orderOrg?.aftersale_price!,
        return_refund_value: orderOrg?.return_refund_value!,
        just_refund_value: orderOrg?.just_refund_value!,
        tax: editOrderOrg
          ? editOrderOrg.tax
          : orderOrg
          ? orderOrg.tax
          : newSsu.tax,
        sorting_status:
          editOrderOrg?.sorting_status || orderOrg?.sorting_status,
      }
      merge(newSsu, false)
    }
  })
  // @ts-ignore
  return _.map(
    result.filter((v) => v.sku_id && v.unit_id),
    (res, i) => {
      // 判断出库数有没有修改，如果修改了就不进行同步了
      const editOrderOrg = _.find(
        skuList || [],
        (o) => o.sku_id === res.sku_id && o.unit_id === res.unit_id,
      )
      return {
        ...res,
        sort_num: i + 1,
        quantity: skuList
          ? (res.quantity || 0) + +(res.base_quantity || 0)
          : res.quantity || 0,
        std_quantity: skuList
          ? res.sorting_status === 2
            ? editOrderOrg?.std_quantity
            : (res.std_quantity || 0) + +(res.base_std_quantity || 0)
          : res.std_quantity || 0,
      }
    },
  )
}

export const updateSkuByPrice = (
  menuList: Sku[],
  skuList: Sku[],
  ingredient: { sku_id: string; unit_id: string },
): Sku[] => {
  const result: Sku[] = []
  _.each(menuList, (menuSku) => {
    const { sku_id, unit_id } = ingredient
    // 是否含该原料
    const isParentSku = _.find(
      menuSku.ingredients?.ingredients,
      (r) => r.sku_id === sku_id && r.order_unit_id === unit_id,
    )

    // 相同原料商品也需要更新单价
    const isSameSku =
      (menuSku.ingredients?.ingredients || []).length === 0 &&
      menuSku.sku_id === sku_id &&
      menuSku.unit_id === unit_id

    // 重新累加原料的价格
    if (isParentSku) {
      // 先把detail里面的原料拿出来，因为需要用到它们的价格
      // ? 是不是已经把改价的detail改好了价格？updateRowItem
      const orgIngredients = _.filter(
        skuList,
        (sku) =>
          _.findIndex(
            menuSku.ingredients?.ingredients,
            (r) => r.sku_id === sku.sku_id && r.order_unit_id === sku.unit_id,
          ) !== -1,
      )
      const newParentSkuPrice = orgIngredients.reduce(
        (sum, v) => {
          const ratio = _.find(
            menuSku.ingredients?.ingredients,
            (r) => r.sku_id === v.sku_id && r.order_unit_id === v.unit_id,
          )?.ratio
          return {
            price: Big(sum.price || 0).add(
              Big(+v.price! || 0).times(+ratio! || 0),
            ),
          }
        },
        { price: 0 },
      )
      result.push({
        ..._.cloneDeep(menuSku),
        price: `${newParentSkuPrice.price}`,
      })
    } else if (isSameSku) {
      const orgIngredient = _.find(
        skuList,
        (sku) => sku.sku_id === sku_id && sku.unit_id === unit_id,
      )
      result.push({ ..._.cloneDeep(menuSku), price: orgIngredient?.price })
    } else {
      result.push(menuSku)
    }
  })

  return result
}

/**
 * 根据配比修改调整单价
 * @deprecated
 */
export const updateCombineSsuPriceByRatio = (
  skuList: Ssu[],
  ingredients: Ssu_Ingredients,
  unitMap: { [k: string]: any } | undefined,
): number => {
  let price = Big(0)
  _.each(ingredients?.ssu_ratios || [], (s) => {
    const ssu = _.find(
      skuList,
      (ssu) => ssu.sku_id === s.sku_id && ssu.unit_id === s.unit_id,
    ) as Ssu

    // 换成计价单位换算价格
    const _ratio_rate = unitMap
      ? unitMap[`${ssu?.unit?.parent_id}_${s.use_unit_id}`][0]?.rate
      : 1
    const _price_ratio =
      ssu.shipping_fee_unit === Ssu_ShippingFeeUnit.PACKAGE
        ? Big(s.ratio || 0)
            .div(_ratio_rate)
            .div(ssu?.unit?.rate || 1)
        : Big(s.ratio || 0).div(_ratio_rate)

    price = price.plus(
      Big(
        getPriceByUnit(
          ssu.unit.unit_id,
          ssu.unit.parent_id,
          'calculate',
          ssu.price || 0,
          +ssu?.unit?.rate || 1,
        ) ||
          ssu.default_price ||
          0,
      ).times(_price_ratio || 0),
    )
  })

  return parseFloat(price.toFixed(2))
}

/**
 * 根据sku获取对应订单detail
 */
export const getOrderDetailBySsu = (
  sku: Sku,
  orderDetailList: OrderDetail[],
): OrderDetail | undefined => {
  return _.find(
    orderDetailList,
    (o) => o?.sku_id === sku.sku_id && o?.unit_id === sku.unit_id,
  )
}

/**
 *  根据配比修改调整单价
 */
export const updateCombineSkuPriceByRatio = (
  skuList: Sku[],
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
        toBasicUnit(sku?.price || '0', sku, 'price'),
      ),
    )
  })
  return parseFloat(price.toFixed(2))
}
