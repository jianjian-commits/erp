import _ from 'lodash'
import Big from 'big.js'
import { Order, OrderDetail } from 'gm_api/src/order'
import { map_App_Type } from 'gm_api/src/common'
import { ListOrderWithRelationResponse } from 'gm_api/src/orderlogic'
import { getEndlessPrice, parseSsu } from '@/common/util'
import { t } from 'gm-i18n'
import { Customer } from 'gm_api/src/enterprise'
import { CustomizeOrderDetial } from './types'
import {
  getFeeUnitName,
  getOrderUnitName,
  isCombineSku,
} from '@/pages/order/util'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'

// 价格累加
export function accumulator(price1: number, price2: number) {
  const price = +price1 + +price2
  const result = Big(price || 0).toFixed(2)
  return result
}

/**
 * 同公司同配送单合并打印
 * @param orders 订单
 * @returns null
 */
function deDuplicatOrders(
  orders: Order[],
  customers: { [key: string]: Customer },
) {
  // 整理后需返回的_orders
  const _orders = []
  const _ordersCategory = _.groupBy(orders, 'customer_id_l1')

  for (const _sameOrders of Object.values(_ordersCategory)) {
    // 把所有orde_details.order_details内部加入 address_name和quantity 作明细
    _.forEach(_sameOrders, (order) => {
      const _curCustomer = customers[order.bill_customer_id as string]
      _.forEach(
        order.order_details?.order_details,
        (item: CustomizeOrderDetial<OrderDetail>) => {
          item._originDetails = [
            {
              address_name: _curCustomer.name,
              quantity: item.order_unit_value?.input?.quantity,
            },
          ]
        },
      )
    })

    // 累加同一商品名出库金额、销售金额、下单金额 及order_details
    const sumOrder = _.reduce(_sameOrders, (pre, next) => {
      const _details = pre?.order_details?.order_details?.concat(
        next?.order_details?.order_details ?? [],
      ) as CustomizeOrderDetial<OrderDetail>[]
      // 汇总order_details.order_details到同一订单下
      pre.order_details!.order_details = _details
      // 累加下单金额
      pre.order_price = accumulator(+pre?.order_price!, +next?.order_price!)
      // 累加销售金额
      pre.sale_price = accumulator(+pre?.sale_price!, +next?.sale_price!)
      // 累加出库金额
      pre.outstock_price = accumulator(
        +pre?.outstock_price!,
        +next?.outstock_price!,
      )
      return pre
    })

    // 根据sku_id + unit_id对商品进行分组
    const _OrderDetails = Object.values(
      _.groupBy(
        sumOrder?.order_details?.order_details,
        (item) => `${item.sku_id}_${item.unit_id}`,
      ),
    )
    // 商品详情order_details.order_details
    const skuSum = []

    // 同一商品的下单数、出库数、辅助单位出库数、出库金额累加
    for (const _sameSku of _OrderDetails) {
      skuSum.push(
        _.reduce(
          _sameSku as CustomizeOrderDetial<OrderDetail>[],
          (_pre, _next) => {
            // 合并商品明细来源
            const _originDetails = _pre?._originDetails!.concat(
              _next?._originDetails ?? [],
            )
            // 累加下单数
            _pre!.order_unit_value_v2!.quantity!.val! = accumulator(
              +_pre!.order_unit_value_v2!.quantity!.val!,
              +_next!.order_unit_value_v2!.quantity!.val!,
            )
            // 累加出库数
            _pre!.outstock_unit_value_v2!.quantity!.val = accumulator(
              +_pre?.outstock_unit_value_v2!.quantity!.val!,
              +_next?.outstock_unit_value_v2!.quantity!.val!,
            )
            // 累加辅助单位出库数
            if (_pre!.outstock_second_base_unit_value_v2!.quantity?.val) {
              _pre!.outstock_second_base_unit_value_v2!.quantity!.val =
                accumulator(
                  +_pre?.outstock_second_base_unit_value_v2!.quantity?.val! ||
                    0,
                  +_next?.outstock_second_base_unit_value_v2!.quantity?.val! ||
                    0,
                )
            }

            // 累加出库金额
            _pre.outstock_price = accumulator(
              +_pre?.outstock_price!,
              +_next?.outstock_price!,
            )
            _pre._originDetails = _originDetails
            return _pre
          },
        ),
      )
    }
    sumOrder!.order_details!.order_details =
      skuSum as CustomizeOrderDetial<OrderDetail>[]
    _orders.push(sumOrder)
  }
  return _orders
}

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
  const relation_info: any = {
    ...data.relation,
    ...data.response?.relation_info,
  }
  // 这里要把同一个公司的单合并到一起
  const orders = deDuplicatOrders(
    data.response?.orders as Order[],
    relation_info.customers,
  ) as Order[]
  const printOrderList = _.map(orders, (order: Order) => {
    // 公司名｜父customer名
    const parent_customer_name =
      relation_info.customers[order.customer_id_l1!]?.name
    // _.find(ListCustomer, (item) => item.customer_id === parent_customer_id)
    //   ?.name || ''
    const credit_type =
      relation_info.customers[order.customer_id_l1!]?.credit_type
    // 餐次
    const menu_period_name =
      relation_info.menu_period_groups[order.menu_period_group_id!]?.name || '-'

    const companyInfo =
      relation_info.customers[order.customer_id_l1!]?.settlement
    // 公司财务信息联系人
    const financial_contact_name =
      companyInfo?.china_vat_invoice?.financial_contact_name
    // 公司财务信息联系电话
    const financial_contact_phone =
      companyInfo?.china_vat_invoice?.financial_contact_phone
    return {
      ...order,
      // 基础
      app_type: map_App_Type[order.app_type!],
      menu_period_name: menu_period_name, // 餐次
      financial_contact_name,
      financial_contact_phone,
      // 商户
      company_name: parent_customer_name,
      credit_type: credit_type, // 账期name
      customer_login_account: credit_type, // 公司登录账号
      receive_customer:
        relation_info?.customers?.[order.customer_id_l1!]?.name || '-', // 收货商户
      customized_code:
        relation_info?.customers?.[order.customer_id_l1!]?.customized_code ||
        '-', // 商户自定义编码
      driver_name: relation_info?.group_users?.[order.driver_id!]?.name || '-', // 司机名称
      driver_phone:
        relation_info?.group_users?.[order.driver_id!]?.phone || '-', // 司机电话
      driver_car_license:
        relation_info?.group_users?.[order.driver_id!]?.attrs
          ?.car_license_plate_number || '-', // 车牌号码

      // 父customer相关
      parent_customer_name,

      // 商品详情
      details: _.map(order.order_details?.order_details, (item) => {
        // sku信息
        const skuInfo =
          relation_info?.sku_snaps?.[`${item?.sku_id!}_${item.sku_revision}`]
        // // ssu单位
        // const ssu_unit =
        //   _.find(
        //     item.unit_cal_info?.unit_lists,
        //     (unit) => unit.unit_id === item?.order_unit_value?.input?.unit_id,
        //   )?.name || ''
        // // 出库单位
        // const ssu_outstock_unit =
        //   _.find(
        //     item.unit_cal_info?.unit_lists,
        //     (unit) => unit.unit_id === item.outstock_unit_value?.input?.unit_id,
        //   )?.name || ''

        // 单位名称相关
        const units = item.unit_cal_info?.unit_lists
        const unit = units?.find((unit) => unit.unit_id === item.unit_id)
        const fee_unit = units?.find(
          (unit) => unit.unit_id === item.fee_unit_id,
        )
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
          relation_info?.skus?.[item?.sku_id as string]?.category_infos || []
        // const category_name_1 = categoryInfos[0]?.category_name
        // const category_name_2 = categoryInfos[1]?.category_name
        // const pinlei_name = categoryInfos[2]?.category_name
        const category_name_1 =
          relation_info.category[item.category1_id!]?.name || '-'
        const category_name_2 =
          relation_info.category[item.category2_id!]?.name || '-'
        const pinlei_name =
          relation_info.category[item.category3_id!]?.name || '-'
        const notPackageSubSkuTypeName =
          map_Sku_NotPackageSubSkuType[skuInfo?.not_package_sub_sku_type]

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
        const parse = parseSsu(item.ssu)

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
          ssu_quantity: item.order_unit_value_v2?.quantity?.val,
          ssu_unit,
          ssu_fee_unit,
          ssu_outstock_price: item.outstock_unit_value?.input?.price || '',
          // 出库数
          ssu_outstock_quantity: item.outstock_unit_value_v2?.quantity?.val,
          // 辅助单位出库数
          ssu_outstock_quantity_second:
            item.outstock_second_base_unit_value_v2?.quantity?.val,

          // ssu_outstock_quantity_base: `${Big(
          //   item.outstock_unit_value?.input?.quantity || 0,
          // )
          //   .times(item.ssu.unit.rate || 1)
          //   .toFixed(2)}${globalStore.getUnitName(item.ssu.unit.parent_id)}`, // 出库数（基本单位)
          ssu_outstock_unit,
          ssu_outstock_unit_second,
          category_name_1, // 一级分类
          category_name_2, // 二级分类
          pinlei_name, // 品类
          notPackageSubSkuTypeName, // 分类
          real_item_price: item.outstock_price || 0, // 出库金额
          ssu_price: item.order_unit_value_v2?.price?.val,
          no_tax_price: renderNoTaxPrice(item),
          // std_price: renderStdPrice(item.ssu), // 单价（计量单位）
          // sa_price: renderSalePrice(item.ssu), // 单价（包装单位)
          // no_tax_std_price: renderNoTaxStdPrice(item.ssu), // 单价（计量单位)
          // no_tax_sa_price: renderNoTaxSalePrice(item.ssu), // 单价（包装单位)
          // sa_unit: Price.getUnit() + '/' + item.ssu.unit.name, // 包装单位
          driver_name:
            relation_info?.group_users![order.driver_id!]?.name || '-', // 司机名称
          driver_phone:
            relation_info?.group_users![order.driver_id!]?.phone || '-', // 司机电话
          driver_car_license:
            relation_info?.group_users![order.driver_id!]?.attrs
              ?.car_license_plate_number || '-', // 车牌号码
          receive_customer:
            relation_info?.customers![order?.customer_id_l1!]?.name || '-',
        }
      }),
      order_raw_details: _.map(
        order.order_raw_details?.order_details,
        (item) => {
          return {
            ...item,
            ssu_name: item.sku_name,
            customize_code: item.sku_customize_code || '-', // 商品自定义编码
            // sa_unit: Price.getUnit() + '/' + item.ssu.unit.name, // 包装单位
            ssu_quantity: +item?.order_unit_value?.input?.quantity! || 0, // 下单数
            sa_price: item?.order_unit_value?.input?.price, // 单价（包装单位)
          }
        },
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
  const newDriverSsuConfig = {
    ...defaultTemplate,
    page: {
      ...defaultTemplate.page,
      ...template,
    },
  }

  return _.map(list, (item) => {
    return {
      config: newDriverSsuConfig,
      data: item,
    }
  })
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
    // 把details数组转为key-value
    _.forEach(items.details, (item) => {
      /**
       * 子商品不需要合并，
       */
      const skuIndex =
        isCombineSku(item) || item.parentId
          ? `${item.sku_id}_${item.unit_id}_${item.detail_random_id}`
          : `${item.sku_id}_${item.unit_id}`
      // 用skuid+unitid定位sku
      if (ssuMap[skuIndex]) {
        ssuMap[item.ssu_name].ssuDetails.push({
          receive_customer: item.receive_customer,
          quantity: item.order_unit_value?.input?.quantity, // 下单数（包装单位)
          ssu_outstock_quantity: item.outstock_unit_value?.input?.quantity, // 出库数（包装单位)
          real_item_price: item.real_item_price, // 出库金额
          order_price: item.order_price, // 下单金额
          ssu_unit_name: item.ssu.unit.name,
        })
      } else {
        ssuMap[skuIndex] = {
          ssu_name: item.ssu_name,
          sa_unit: item.sa_unit,
          category_name_1: item.category_name_1,
          pinlei_name: item.pinlei_name,
          unit_text: item.unit_text,
          ssu_unit_name: item.ssu.unit.name,
          ssuDetails: [
            {
              receive_customer: item.receive_customer,
              quantity: item.order_unit_value?.input?.quantity, // 下单数（包装单位)
              ssu_outstock_quantity: item.outstock_unit_value?.input?.quantity, // 出库数（包装单位)
              real_item_price: item.real_item_price, // 出库金额
              order_price: item.order_price, // 下单金额
              ssu_unit_name: item.ssu.unit.name,
            },
          ],
        }
      }
      // 单个商品下单数汇总
      ssuMap[skuIndex].quantity = summation(
        ssuMap[item.ssu_name].ssuDetails,
        'quantity',
      )
      // 单个商品出库数汇总
      ssuMap[skuIndex].ssu_outstock_quantity = summation(
        ssuMap[item.ssu_name].ssuDetails,
        'ssu_outstock_quantity',
      )
      // 出库金额
      ssuMap[skuIndex].real_item_price = summation(
        ssuMap[item.ssu_name].ssuDetails,
        'real_item_price',
      )
      // 下单金额
      ssuMap[skuIndex].order_price = summation(
        ssuMap[item.ssu_name].ssuDetails,
        'order_price',
      )
    })
    items.details = ssuMap
  })
  return kidData
}

export function handleMapOrderIds(OrderIds: Array<object>) {
  return _.map(OrderIds, 'order_id')
}
