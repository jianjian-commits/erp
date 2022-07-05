import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { MULTI_SUFFIX } from 'gm-x-printer'
import { price } from '../../util'
import { coverDigit2Uppercase } from '@/common/util'
import { CreditTypeSelect } from '@/pages/customer/enum'
import { Filters_Bool } from 'gm_api/src/common'
import globalStore from '@/stores/global'

/**
 * 生成双栏商品展示数据
 * @param list
 * @param categoryTotal
 * @return {Array}
 */
function generateMultiData(list: [], categoryTotal?: any) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}], 转化为 [{a:1, a#2:3}, {a:2, a#2: 4}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length

  while (index < len) {
    const sku1: any = skuGroup[index]
    const sku2: any = {}
    _.each(skuGroup[1 + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    multiList.push({
      ...sku1,
      ...sku2,
    })

    index += 2
  }

  if (categoryTotal) {
    multiList.push(categoryTotal)
  }

  return multiList
}

function generateMultiData2(list: any, categoryTotal?: any) {
  const multiList = []
  // 假设skuGroup = [{a: 1}, {a:2}, {a: 3}, {a: 4}], 转化为 [{a:1, a#2:3}, {a:2, a#2: 4}]
  const skuGroup = list

  let index = 0
  const len = skuGroup.length
  const middle = Math.ceil(len / 2)

  while (index < middle) {
    const sku1 = skuGroup[index]
    const sku2 = {}
    _.each(skuGroup[middle + index], (val, key) => {
      sku2[key + MULTI_SUFFIX] = val
    })

    multiList.push({
      ...sku1,
      ...sku2,
    })

    index += 1
  }

  if (categoryTotal) {
    multiList.push(categoryTotal)
  }

  return multiList
}

// 非表格数据
function generateCommon(data: any, appId?: string) {
  return {
    // 非table-基础
    公司信息: data.company_name,
    公司编码: data.customized_code,
    登陆账号: data.username,
    联系人: data.financial_contact_name,
    联系电话: data.financial_contact_phone,
    账期: CreditTypeSelect.find((x) => x.value === data.credit_type)?.text,
    打印时间: moment().format('YYYY-MM-DD HH:mm:ss'),

    // 非table-金额
    下单金额: data.order_price,
    出库金额: data.outstock_price,
    销售金额: data.sale_price,
  }
}

// 大写金额数据
function generateUpperPrice(data: any) {
  return {
    下单金额_大写: coverDigit2Uppercase(data.order_price),
    优惠金额_大写: coverDigit2Uppercase(data.coupon_price),
    出库金额_大写: coverDigit2Uppercase(data.outstock_price),
    运费_大写: coverDigit2Uppercase(data.freight_price),
    售后金额_大写: coverDigit2Uppercase(data.aftersale_price),
    // 销售金额_大写: coverDigit2Uppercase(data.total_pay),
  }
}

// 普通订单数据，处理商品异常、退货、非商品异常的汇总数据
function generateOrderData(rawList: any) {
  const list = _.filter(rawList, (item) => {
    if (globalStore.isLite) return item
    // 过滤不打印的数据
    if (item?.is_print === Filters_Bool.FALSE) return undefined
    return item
  }).filter(Boolean)
  return _.map(list, (v, index) => {
    return {
      序号: index + 1,
      // 基础
      商品名: v.ssu_name,
      类别: v.category_name_1,
      // 规格: v.unit_text,
      明细: v._originDetails.reduce((all: any, sku: any) => {
        return all + `${sku.address_name}*${sku.quantity}<br/>`
      }, ''),

      // 单位
      // 计量单位: v.ssu.unit.name,
      // 包装单位: v.ssu.unit.name,
      下单单位: v.ssu_unit,
      定价单位: v.ssu_fee_unit,
      出库单位: v.ssu_outstock_unit,
      辅助出库单位: v.ssu_outstock_unit_second,
      // 数量
      下单数: v.ssu_quantity,
      出库数: v.ssu_outstock_quantity,
      辅助单位出库数: v.ssu_outstock_quantity_second
        ? price(v.ssu_outstock_quantity_second)
        : '',
      // 出库数_计量单位: v.ssu_outstock_quantity_base,
      // 出库数_包装单位: v.ssu_outstock_quantity,

      // 金额
      // 单价_计量单位: v.std_price,
      // 单价_包装单位: v.sa_price,
      单价: v.ssu_price,
      出库金额: price(v.outstock_price),
      多单位数量: v.multiple_unit || '-',

      _origin: v,
    }
  })
}

// 组合商品数据处理
function generateCombineData(list: any) {
  return _.map(list, (v, index) => {
    return {
      序号: index + 1,

      // 商品
      组合商品_名: v.ssu_name,
      组合商品_自定义编码: v.customize_code,

      // 价格
      组合商品_单价: v.sa_price,

      // 数量
      组合商品_下单数: v.ssu_quantity,

      // 单位
      // 组合商品_包装单位: v.ssu.unit.name,
      组合商品_包装单位: v.ssu_unit,

      // 金额相关
      组合商品_下单金额: price(v.order_price),

      _origin: v,
    }
  })
}

/**
 * 处理订单数据
 * @param data
 * @param noAbnormal 是否不需要异常表格
 * @returns {{_table: {orders_category: [], reward: *, orders_category_multi: [], abnormal: ([]|[]|*), orders_category_multi_vertical: [], orders: *, orders_multi_vertical: [], orders_multi: Array}, common: {结款周期, 自提点联系方式: *, 下单时间_无年份: string, 销售额_含运税_大写: string|*, 下单时间_日期_无年份: string, 收货时间_日期_无年份: string, 当前时间: string, 收货时间: string, 当前时间_日期: string, 商品税额_大写: string|*, 原总金额: string, 收货时间_时间: string, 配送时间_日期_无年份: string, 销售经理电话, barcode: *, 线路, 收货地址: *, 收货时间_无年份: string, 配送时间: string, 收货人: *, 城区, 打印人: *, 满载框数, 优惠金额_大写: string|*, 收货人电话: *, 当前时间_日期_无年份: string, 当前时间_无年份: string, 订单溯源码, 当前时间_时间: string, 承运商: *, 下单时间_时间: string, 司机电话, 商户ID: string, 运费_大写: string|*, 收货时间_日期: string, 收货商户: *, 出库金额: string, 授信额度: string, 税额: string, 配送时间_日期: string, 下单员: *, 账户名: *, 商户公司: *, 自提点负责人: *, 结款方式: *, qrcode: string, 优惠金额: string, 异常金额: string, 收货方式: *, 商户自定义编码: *, 订单备注: *, 配送时间_无年份: string, 街道, 销售经理, 箱数: *, 原总金额_大写: string|*, 下单时间_日期: string, 下单金额: string, 下单时间: string, 自提点名称: *, 支付状态: *, 订单类型: string, 销售额_含运税: string, 下单金额_大写: string|*, 分拣序号: string, 配送时间_时间: string, 出库总数_销售单位: number, 异常金额_大写: string|*, 订单号: *, 车型, 下单总数_销售单位: number, 车牌号码, 运费: string, 出库金额_大写: string|*, 司机名称, 城市, 下单账号: *}, _origin: *, _counter: []}}
 */
function order(data: any, appId?: string) {
  // 处理数据
  // 商品列表
  const ssuList = data.details
  // 组合商品数据
  const combineList = data.order_raw_details
  /* ----------- 普通  ------------ */
  const kOrders = generateOrderData(ssuList)
  // /* ----------- 双栏 -------------- */
  const kOrdersMulti = generateMultiData(kOrders)
  // /* ----------- 双栏 (纵向)-------------- */
  const kOrdersMultiVertical = generateMultiData2(kOrders)

  // 按一级分类分组
  const groupByCategory1 = _.groupBy(kOrders, (v) => v._origin.category_name_1)

  // /* -------- 分类 和 双栏 + 分类 ------- */
  let kCategory: any[] = []
  let kCategoryMulti = []
  let kCategoryMultiVertical = []
  const kCounter: any[] = [] // 分类汇总
  // 组合商品表
  const combination = generateCombineData(combineList)

  let index = 1
  _.forEach(groupByCategory1, (value, key) => {
    // 分类小计
    let subtotal: any = Big(0)
    const list = _.map(value, (sku) => {
      subtotal = subtotal.plus(sku._origin.real_item_price)
      return {
        ...sku,
        序号: index++,
      }
    })
    subtotal = subtotal.toFixed(2)
    const categoryTotal = {
      _special: {
        text: `${key}小计：${subtotal}`,
        upperCaseText: `${key}小计：${subtotal}&nbsp;&nbsp;&nbsp;大写：${coverDigit2Uppercase(
          subtotal,
        )}`,
      },
    }

    //   // 商品分类汇总数组
    kCounter.push({ text: key, len: value.length, subtotal })

    //   /* -------- 分类  ------------- */
    kCategory = kCategory.concat(list, categoryTotal)
    /* -------- 双栏 + 分类 ------- */
    kCategoryMulti = kCategoryMulti.concat(
      generateMultiData(list, categoryTotal),
    )
    /* -------- 双栏 + 分类（纵向） ------- */
    kCategoryMultiVertical = kCategoryMultiVertical.concat(
      generateMultiData2(list, categoryTotal),
    )
  })

  return {
    common: {
      ...generateCommon(data, appId),
      ...generateUpperPrice(data),
    },
    _counter: kCounter, // 分类商品统计
    _table: {
      orders: kOrders, // 普通
      orders_multi: kOrdersMulti, // 双栏
      orders_multi_vertical: kOrdersMultiVertical, // 双栏（纵向）
      orders_category: kCategory, // 分类
      orders_category_multi: kCategoryMulti, // 分类 + 双栏
      orders_category_multi_vertical: kCategoryMultiVertical, // 分类+双栏（纵向）
      combination: combination, // 组合商品
      combination_multi: generateMultiData(combination), // 组合商品 + 双栏
    },
    _origin: data,
  }
}

export default order
