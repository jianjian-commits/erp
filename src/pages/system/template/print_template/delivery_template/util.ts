import globalStore from '@/stores/global'
import _ from 'lodash'
import Big from 'big.js'
import { Order, OrderDetail } from 'gm_api/src/order'
import { Filters_Bool, map_App_Type } from 'gm_api/src/common'
import { ListOrderWithRelationResponse } from 'gm_api/src/orderlogic'
import { getEndlessPrice, parseSsu, toFixedOrder } from '@/common/util'

import { Price } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Customer } from 'gm_api/src/enterprise'
import { imageDomain } from '@/common/service'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import {
  getFeeUnitName,
  getOrderUnitName,
  isCombineSku,
} from '@/pages/order/util'
import { handleUnitName } from '@/pages/order/order_manage/components/detail/util'
import { isZero } from '@/pages/order/number_utils'

export const price = (n?: string) => {
  const result = Big(n || 0).toFixed(2)
  return result === '0.00' ? '0' : result
}

/**
 *
 * @param data
 * @param ListCustomer  父CustomerList，kid打印时获取公司信息
 */
export function handleOrderPrinterData(
  data: ListOrderWithRelationResponse,
  ListCustomer?: Customer[],
) {
  const orders = data.response?.orders
  const relation_info: any = {
    ...data.relation,
    ...data.response?.relation_info,
  }

  const getDetailData = (item: OrderDetail, order: Order) => {
    // sku信息
    const skuInfo =
      relation_info.sku_snaps?.[`${item?.sku_id!}_${item.sku_revision}`]
    // 单位名称相关
    const units = item.unit_cal_info?.unit_lists
    const unit = units?.find((unit) => unit.unit_id === item.unit_id)
    const fee_unit = units?.find((unit) => unit.unit_id === item.fee_unit_id)
    const parentUnit = units?.find(
      (parentUnit) => parentUnit.unit_id === unit?.parent_id,
    )

    // 下单单位
    const ssu_unit = getOrderUnitName(parentUnit, unit!)

    // 定价单位
    const ssu_fee_unit = getFeeUnitName(item as any)
    // 出库单位，轻巧版暂时等于下单单位
    const ssu_outstock_unit =
      globalStore.getUnitName(
        item.outstock_unit_value_v2?.quantity?.unit_id!,
      ) || unit?.name!

    const ssu_outstock_unit_second = globalStore.getUnitName(
      item.outstock_second_base_unit_value_v2?.quantity?.unit_id!,
    )

    const categoryInfos =
      relation_info.sku?.[item.sku_id!]?.category_infos || []
    const category_name_1 =
      relation_info.category[item.category1_id!]?.name || '-'
    const category_name_2 =
      relation_info.category[item.category2_id!]?.name || '-'
    const category_name_3 =
      relation_info.category[item.category3_id!]?.name || '-'
    const pinlei_name = relation_info.category[item.category3_id!]?.name || '-'
    const notPackageSubSkuTypeName =
      map_Sku_NotPackageSubSkuType[skuInfo?.not_package_sub_sku_type]

    // 单价计量
    // const renderOrderStdPrice = (ssu: any) => {
    //   if (ssu.basic_price?.current_price) return t('时价')
    //   const parse = parseSsu(ssu)

    //   return Big(item.order_unit_value.input?.price! || 0)
    //     .div(parse.ssu_unit_rate || 1)
    //     .toFixed(2)
    // }

    const renderNoTaxPrice = (sku: any) => {
      if (!sku?.price && sku.basic_price?.current_price) return t('时价')
      // 不含税单价 = 单价 / （1 + 税额）
      return getEndlessPrice(
        Big(sku?.order_unit_value_v2?.price?.val || 0).div(
          Big(sku?.tax || 0)
            .div(100)
            .plus(1),
        ),
      )
    }
    return {
      ...item,
      // 商品id sku
      // unit_text: unit_text,
      ssu_name: item.sku_name,
      customize_code: item.sku_customize_code || '-', // 商品自定义编码
      description:
        relation_info?.sku_snaps?.[`${item?.sku_id!}_${item.sku_revision}`]
          ?.desc || '-', // 商品描述
      // ssu_price: item.order_unit_value.input?.price || '',
      // 下单数
      ssu_quantity: item.order_unit_value_v2?.quantity?.val,
      ssu_unit,
      ssu_fee_unit,
      ssu_outstock_price: item.outstock_unit_value?.input?.price || '',
      // 出库数
      ssu_outstock_quantity: item.outstock_unit_value_v2?.quantity?.val,
      // 辅助单位出库数
      ssu_outstock_quantity_second:
        item.outstock_second_base_unit_value_v2?.quantity?.val,

      // 出库单位
      ssu_outstock_unit,
      ssu_outstock_unit_second,
      category_name_1, // 一级分类
      category_name_2, // 二级分类
      category_name_3,
      pinlei_name, // 品类
      notPackageSubSkuTypeName, // 类型
      real_item_price: item.outstock_price || 0, // 出库金额
      ssu_price: item.order_unit_value_v2?.price?.val,
      // std_price: renderStdPrice(item.ssu), // 单价（基本单位）
      // sa_price: renderSalePrice(item.ssu), // 单价（包装单位)
      no_tax_price: renderNoTaxPrice(item),
      // no_tax_std_price: renderNoTaxStdPrice(item.ssu), // 单价（计量单位)
      // no_tax_sa_price: renderNoTaxSalePrice(item.ssu), // 单价（包装单位)
      // sa_unit: Price.getUnit() + '/' + item.ssu.unit.name, // 包装单位
      driver_name: relation_info?.group_users![order.driver_id!]?.name || '-', // 司机名称
      driver_phone: relation_info?.group_users![order.driver_id!]?.phone || '-', // 司机电话
      driver_car_license:
        relation_info?.group_users![order.driver_id!]?.attrs
          ?.car_license_plate_number || '-', // 车牌号码
      receive_customer:
        relation_info?.customers![order.receive_customer_id!]?.name || '-',
      sku_type:
        map_Sku_NotPackageSubSkuType[
          relation_info?.sku_snaps?.[`${item?.sku_id!}_${item.sku_revision}`]
            ?.not_package_sub_sku_type
        ] || '-',
    }
  }

  const printOrderList = _.map(orders, (order: Order) => {
    // 路线名
    const route_name =
      relation_info.routes[
        relation_info.customer_routes[order.receive_customer_id!]
      ]?.route_name || ''

    // 父customer_id
    const parent_customer_id =
      relation_info.customers[order.receive_customer_id!]?.parent_id
    // 公司名｜父customer名
    const parent_customer_name =
      _.find(ListCustomer, (item) => item.customer_id === parent_customer_id)
        ?.name || ''
    // 餐次
    const menu_period_name =
      relation_info.menu_period_groups[order.menu_period_group_id!]?.name || '-'
    return {
      ...order,
      // 司机签名地址
      driver_sign_url:
        imageDomain + relation_info.driver_sign?.[order.order_id]?.image.path,
      // 基础
      app_type: map_App_Type[order.app_type!],
      menu_period_name: menu_period_name, // 餐次
      // 商户
      receive_customer:
        relation_info?.customers![order.receive_customer_id!]?.name || '-', // 收货商户
      customized_code:
        relation_info?.customers![order.receive_customer_id!]
          ?.customized_code || '-', // 商户自定义编码
      receiver: order.addresses?.addresses![0]?.receiver || '-', // 收货人
      receive_phone: order.addresses?.addresses![0]?.phone || '-', // 收货人电话
      receive_address: order.addresses?.addresses![0]?.address || '-', // 收货地址
      driver_name: relation_info?.group_users![order.driver_id!]?.name || '-', // 司机名称
      driver_phone: relation_info?.group_users![order.driver_id!]?.phone || '-', // 司机电话
      driver_car_license:
        relation_info?.group_users![order.driver_id!]?.attrs
          ?.car_license_plate_number || '-', // 车牌号码
      route_name, // 线路
      // 父customer相关
      parent_customer_name,
      // 商品详情
      details: _.map(order.order_details?.order_details, (item) =>
        getDetailData(item, order),
      ),
      order_raw_details: _.map(order.order_raw_details?.order_details, (item) =>
        getDetailData(item, order),
      ),
    }
  })
  return printOrderList
}

export enum PayState {
  '未知' = 0,
  '未支付' = 1, // 未支付
  '部分支付' = 2, // 部分支付
  '支付完成' = 3, // 支付完成
  '已退款' = 4, // 已退款
  '已关闭' = 5, // 已关闭
}

export function handleDriverPrintList(
  list: any[],
  defaultTemplate: any,
  template: any,
) {
  // 👓如有配送单,使用配送单的纸张尺寸
  const newDriverConfig = {
    ...defaultTemplate,
    page: {
      ...defaultTemplate.page,
      ...template.page,
    },
  }
  // const newDriverTaskConfig = {
  //   ...defaultTemplate,
  //   page: {
  //     ...defaultTemplate.page,
  //     ...template,
  //   },
  // }
  return _.map(list, (item) => {
    return {
      config: newDriverConfig,
      data: item,
    }
  })
}

/**
 * 处理数据
 */
export function handleKidPrintData(list: any[]) {
  // 按父customer
  const kidData: { [key: string]: any } = _.groupBy(
    list,
    'parent_customer_name',
  )
  // 按ssu
  _.forEach(kidData, (items, key) => {
    kidData[key] = _.reduce(
      items,
      (accumulator: any, cur) => {
        accumulator.parent_customer_name = cur.parent_customer_name
        accumulator.receive_time = cur.receive_time
        accumulator.details.push(...cur.details)
        accumulator.customers.push({ receive_customer: cur.receive_customer })
        return accumulator
      },
      { details: [], customers: [] },
    )
  })
  _.forEach(kidData, (items) => {
    const ssuMap: any = {}
    const list = _.map(items.details, (item) => {
      if (globalStore.isLite) return item
      // 过滤不打印的数据
      if (item?.is_print === Filters_Bool.FALSE) return undefined
      return item
    }).filter(Boolean)
    // 把details数组转为key-value
    _.forEach(list, (item) => {
      const units = item.unit_cal_info?.unit_lists
      const unit = units?.find((unit) => unit.unit_id === item.unit_id)
      /**
       * 子商品不需要合并，
       */
      const skuIndex =
        isCombineSku(item) || item.parentId
          ? `${item.sku_id}_${item.unit_id}_${item.detail_random_id}`
          : `${item.sku_id}_${item.unit_id}`
      // 用skuid+unitid定位sku
      if (ssuMap[skuIndex]) {
        ssuMap[skuIndex].ssuDetails.push({
          receive_customer: item.receive_customer,
          quantity: item.order_unit_value_v2?.quantity?.val, // 下单数
          ssu_outstock_quantity: item.outstock_unit_value_v2?.quantity?.val, // 出库数
          ssu_outstock_quantity_second:
            item.outstock_second_base_unit_value_v2?.quantity?.val, // 辅助单位出库数
          real_item_price: item.real_item_price, // 出库金额
          order_price: item.order_price, // 下单金额
          ssu_unit_name: item.ssu_unit, // 下单单位名称
          ssu_outstock_unit:
            globalStore.getUnitName(
              item.outstock_unit_value_v2?.quantity?.unit_id!,
            ) || unit?.name!, // 出库数单位名称
          ssu_outstock_unit_second: globalStore.getUnitName(
            item.outstock_second_base_unit_value_v2?.quantity?.unit_id!,
          ), // 辅助单位出库数名称
        })
      } else {
        ssuMap[skuIndex] = {
          ssu_name: item.ssu_name,
          // 定价单位
          sa_unit: item.ssu_fee_unit,
          category_name_1: item.category_name_1,
          pinlei_name: item.pinlei_name,
          notPackageSubSkuTypeName: item.notPackageSubSkuTypeName,
          unit_text: item.unit_text,
          ssu_unit_name: item.ssu_unit, // 下单单位名称
          ssuDetails: [
            {
              receive_customer: item.receive_customer,
              quantity: item.order_unit_value_v2?.quantity?.val, // 下单数
              ssu_outstock_quantity: item.outstock_unit_value_v2?.quantity?.val, // 出库数
              ssu_outstock_quantity_second:
                item.outstock_second_base_unit_value_v2?.quantity?.val, // 辅助单位出库数
              ssu_outstock_unit:
                globalStore.getUnitName(
                  item.outstock_unit_value_v2?.quantity?.unit_id!,
                ) || unit?.name!, // 出库数单位名称
              ssu_outstock_unit_second: globalStore.getUnitName(
                item.outstock_second_base_unit_value_v2?.quantity?.unit_id!,
              ), // 辅助单位出库数名称
              real_item_price: item.real_item_price, // 出库金额
              order_price: item.order_price, // 下单金额
              ssu_unit_name: item.ssu_unit, // 下单单位名称
            },
          ],
          ssu_outstock_unit:
            globalStore.getUnitName(
              item.outstock_unit_value_v2?.quantity?.unit_id!,
            ) || unit?.name!, // 出库数单位名称
          ssu_outstock_unit_second: globalStore.getUnitName(
            item.outstock_second_base_unit_value_v2?.quantity?.unit_id!,
          ), // 辅助单位出库数名称
          detail_random_id: item.detail_random_id,
        }
      }
      // 单个商品下单数汇总
      ssuMap[skuIndex].quantity = summation(
        ssuMap[skuIndex].ssuDetails,
        'quantity',
      )
      // 单个商品出库数汇总
      ssuMap[skuIndex].ssu_outstock_quantity = summation(
        ssuMap[skuIndex].ssuDetails,
        'ssu_outstock_quantity',
      )
      // 单个商品辅助单位出库数汇总
      ssuMap[skuIndex].ssu_outstock_quantity_second = isZero(
        summation(ssuMap[skuIndex].ssuDetails, 'ssu_outstock_quantity_second'),
      )
        ? ''
        : summation(ssuMap[skuIndex].ssuDetails, 'ssu_outstock_quantity_second')

      // 出库金额
      ssuMap[skuIndex].real_item_price = summation(
        ssuMap[skuIndex].ssuDetails,
        'real_item_price',
      )

      // 下单金额
      ssuMap[skuIndex].order_price = summation(
        ssuMap[skuIndex].ssuDetails,
        'order_price',
      )
    })
    items.details = ssuMap
  })
  return kidData
}

export function summation(collection: any, key: string) {
  const sum = _.reduce(
    collection,
    (acc, cur) => {
      return Big(acc)
        .plus(cur[key] || 0)
        .toFixed(2)
    },
    '0',
  )
  return sum
}

export function handleMapOrderIds(OrderIds: Array<object>) {
  return _.map(OrderIds, 'order_id')
}
