import { makeAutoObservable, reaction } from 'mobx'
import Big from 'big.js'
import { OrderInfo, DetailListItem } from '../interface'
import {
  GetOrder,
  GetSalePriceData,
  Order,
  OrderRelationInfoResponse,
} from 'gm_api/src/order'
import {
  wrapDetailList,
  mergeOrderDetails,
  wrapOrderDetail,
  getReceiveTime,
  handleDetailListWithCombineSku,
} from './util'
import { initSsu } from '../init'
import { toFixedOrder } from '@/common/util'
import { App_Type, Filters_Bool } from 'gm_api/src/common'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { getSignImgUrl, isCombineSku, toBasicUnit } from '@/pages/order/util'
import shopStore from '@/pages/system/shop_decoration/shop_meal/store'
import referenceMixin from '@/pages/order/order_manage/store/reference'
import _, { debounce } from 'lodash'
import moment from 'moment'
import { MoreSelectDataItem } from '@gm-pc/react'
import {
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { DataNode } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import { isZero } from '@/pages/order/number_utils'
import { ListBomSku } from 'gm_api/src/production'

const initOrderInfo: OrderInfo = {
  order_id: '',
  bill_customer_id: '',
  addresses: { addresses: [] },
  customer: undefined,
  receive_customer_id: '', // 收货人id
  serial_no: '', // 订单号
  state: 1,
  app_type: App_Type.TYPE_STATION,
  service_period_id: '',
  service_period: undefined,
  receive_time: undefined,
  remark: '',
  order_time: undefined,
  view_type: 'create',
  repair: false,
  group_users: {},
  status: undefined,
  sign_img_url: undefined,
  quotation_id: '',
  customer_users: {},
  // todo
  customize_type_id: '',
}

class Store {
  order: OrderInfo = {
    ...initOrderInfo,
  }

  list: DetailListItem[] = [{ ...initSsu }]

  loading = true

  isRanking = false

  hasEditPermission = true

  type: App_Type = App_Type.TYPE_UNSPECIFIED // 判断订单的类型

  /** @description 操作的发布抽屉打开 */
  publishPurchase = false

  /** @description 点击打开时候获取的index */
  index = 0

  reference = referenceMixin
  orgOrderDetailIdMap: Record<string, string> = {}

  relation: OrderRelationInfoResponse | undefined
  customerList: MoreSelectDataItem<string>[] = []

  /** 商品分类map */
  categoryMap: { [key: string]: DataNode } = {}

  /** 最近采购价|最近入库价 */
  priceOf: keyof GetSkuReferencePricesResponse_ReferencePrices =
    'purchase_reference_prices'

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
    globalStore.fetchOrderSetting()
    this.getCategoryMap()
  }

  setType(type: App_Type) {
    this.type = type
  }

  /** 获取商品分类数据 */
  async getCategoryMap() {
    const { categoryMap } = await fetchTreeData()
    this.categoryMap = await categoryMap
  }

  /** 订单加单总金额 */
  get totalAddOrderPrice() {
    const { list } = this
    const priceList = _.map(list, (item) => {
      const {
        add_order_price1,
        add_order_price2,
        add_order_price3,
        add_order_price4,
      } = item
      const totalAddOrderPrice = Big(add_order_price1 || 0)
        .plus(add_order_price2 || 0)
        .plus(add_order_price3 || 0)
        .plus(add_order_price4 || 0)
      /** 单条数据总加单金额 */
      return totalAddOrderPrice.toString()
    })
    const totalAddOrderPrice = _.reduce(
      priceList,
      (res, next) => {
        return res.plus(next)
      },
      Big(0),
    )
    return totalAddOrderPrice.toString()
  }

  get summary() {
    const { order, totalAddOrderPrice } = this
    const orderPrice = +(order.order_price || 0)
    const outStockPrice = +(order.outstock_price || 0)
    const salePrice = +(order.sale_price || 0)
    const freightPrice = +(order.freight_price || 0)
    const afterSales = Big(Number(order?.aftersale_price) || 0).toFixed(2)
    if (order.view_type !== 'view') {
      const result = this.list
        .filter((item) => !isCombineSku(item)) // 组合商品按照原料统计
        .reduce(
          (sum, v) => {
            const {
              quantity,
              price,
              std_quantity = '0',
              std_quantity_second = '0',
              fee_unit_id,
              unit_id,
              parentId,
              units,
              unit_cal_info,
              base_unit_id,
              second_base_unit_id,
              second_base_unit_ratio,
            } = v
            let order_price = ''
            let outStockPrice = ''
            if (unit_id) {
              order_price = toFixedOrder(
                Big(toBasicUnit(String(quantity || '0'), v, 'quantity')).times(
                  toBasicUnit(String(price || '0'), v, 'price'),
                ),
              )
              // 出库金额的计算要区分子商品和普通商品，因为子商品没有双出库数，直接用std_quantity计算
              outStockPrice =
                parentId || !v.isUsingSecondUnitOutStock
                  ? toFixedOrder(
                      Big(
                        toBasicUnit(
                          String(std_quantity || '0'),
                          v,
                          'std_quantity',
                        ),
                      ).times(toBasicUnit(String(price || '0'), v, 'price')),
                    )
                  : toFixedOrder(
                      Big(
                        toBasicUnit(
                          String(
                            (globalStore.isSameUnitGroup(
                              fee_unit_id!,
                              second_base_unit_id!,
                            )
                              ? std_quantity_second
                              : std_quantity) || '0',
                          ),
                          v,
                          globalStore.isSameUnitGroup(
                            fee_unit_id!,
                            second_base_unit_id!,
                          )
                            ? 'std_quantity_second'
                            : 'std_quantity',
                        ),
                      ).times(toBasicUnit(String(price || '0'), v, 'price')),
                    )
            }

            return {
              orderPrice: Big(sum?.orderPrice || 0).add(order_price || 0),
              outStockPrice: Big(sum?.outStockPrice || 0).add(
                outStockPrice || 0,
              ),
            }
          },
          { orderPrice: Big(0), outStockPrice: Big(0) },
        )
      return {
        orderPrice: toFixedOrder(result.orderPrice),
        outStockPrice: toFixedOrder(result.outStockPrice),
        salePrice: toFixedOrder(
          Big(result.outStockPrice)
            .add(Big(freightPrice))
            .minus(Big(+(order.aftersale_price || 0)))
            .minus(Big(+(order.coupon_price || 0))),
        ),
        afterSales,
        /** 总加单金额 */
        totalAddOrderPrice,
        /** 套账出库金额 */
        fakeOutstockPrice: result.outStockPrice
          .plus(totalAddOrderPrice)
          .toString(),
        /** 套账下单金额 */
        fakeOrderPrice: result.orderPrice.plus(totalAddOrderPrice).toString(),
      }
    }
    return {
      orderPrice,
      outStockPrice,
      salePrice,
      freightPrice,
      afterSales,
      /** 总加单金额 */
      totalAddOrderPrice: order.total_add_order_price,
      /** 套账出库金额 */
      fakeOutstockPrice: order.fake_outstock_price,
      /** 套账下单金额 */
      fakeOrderPrice: order.fake_order_price,
    }
  }

  init() {
    this.order = { ...initOrderInfo }
    this.list = [{ ...initSsu }]
    this.orgOrderDetailIdMap = {}
    // this.customerList = []
  }

  setCustomerList(list: MoreSelectDataItem<string>[]) {
    this.customerList = list
  }

  getCustomerNameById(id: string) {
    return this.customerList.find((item) => item.value === id)?.text || ''
  }

  // 商户保持一致
  init4Copy(order?: OrderInfo) {
    const { service_period, service_period_id, repair, customer } =
      order || this.order
    this.order = { ...initOrderInfo }
    const { receiveTime } = getReceiveTime(service_period!)
    store.updateOrderInfo('customer', customer)
    store.updateOrderInfo('receive_time', receiveTime)
    store.updateOrderInfo('service_period', service_period)
    store.updateOrderInfo('service_period_id', service_period_id)
    repair &&
      store.updateOrderInfo(
        'order_time',
        `${+moment()
          .startOf('day')
          .add(service_period!.order_create_min_time, 'ms')
          .toDate()}`,
      )
    this.orgOrderDetailIdMap = {}
  }

  updateOrderInfo<T extends keyof OrderInfo>(key: T, value: OrderInfo[T]) {
    this.order[key] = value
  }

  setList(list: DetailListItem[] = [{ ...initSsu }]) {
    this.list = list
  }

  setRanking(bool: boolean) {
    this.isRanking = bool
  }

  addRow(index = this.list.length, detailItem: DetailListItem = initSsu) {
    this.list.splice(index + 1, 0, { ...detailItem })
  }

  /**
   * @description: 对list的增加操作
   * @param {number} index
   * @param {DetailListItem} row
   * @return {*}
   */
  updateRow(index: number, row: DetailListItem = { ...initSsu }) {
    // Object.assign(this.list[index], { ...row })
    // 切换商品后应该直接指向新数据，而不是用Object.assign保留原先的残留数据
    // 如果这个index上一次对应的是组合商品，应当清除原料
    // 删除原料
    if (isCombineSku(this.list[index])) {
      this.list.splice(index + 1, this.list[index]?.ingredientsInfo?.length)
    }
    this.list[index] = { is_print: Filters_Bool.TRUE, ...row }
    console.log(row)
  }

  /**
   * @description: 对list的删除操作
   * @param {number} index
   * @param {number} ingredientsCount
   * @return {*}
   */
  deleteRow(index: number, ingredientsCount?: number) {
    this.list.splice(index, ingredientsCount ? ingredientsCount + 1 : 1)
  }

  getRowItem<T extends keyof DetailListItem>(index: number, key: T) {
    return this.list[index][key]
  }

  /**
   * @description: 修改list里的field
   * @param {number} index
   * @param {T} key
   * @param {DetailListItem} value
   * @return {*}
   */
  updateRowItem<T extends keyof DetailListItem>(
    index: number,
    key: T,
    value: DetailListItem[T],
  ) {
    this.list[index][key] = value
  }

  setEditPermission(permission: Permission) {
    this.hasEditPermission = globalStore.hasPermission(permission)
  }

  async fetchOrder(id: string) {
    this.loading = true
    await shopStore.getData()
    return GetOrder({
      serial_no: id,
      relation_info: {
        need_customer_info: true,
        need_quotation_info: true,
        need_sku_info: true,
        need_user_info: true,
        need_menu_info: true,
      },
      need_fake_detail: true,
    }).then(async (json) => {
      const { order_details, order_raw_details, state, order_id, ...rest } =
        json.response.order
      // 司机app签收图片url
      const sign_img_url = await getSignImgUrl(order_id)
      // 这里税率相关的涉及商户开票信息，可能需要从 parent customer 查找
      const relation = json.response.relation_info
      this.relation = relation
      const customer = (relation?.customers || {})[rest.receive_customer_id!]
      let settlement = customer.settlement
      if (customer.level === 2) {
        const parent = (relation?.customers || {})[customer.parent_id || '']
        settlement = {
          ...settlement,
          china_vat_invoice: { ...parent?.settlement?.china_vat_invoice! },
        }
      }
      /**
       * order里面去掉了quotation_id，不用它来做索引了直接去quotations里面找type是WITHOUT_TIME的报价单
       */
      // const quotation = (relation?.quotations || {})[rest.quotation_id!]
      const quotationIds =
        json.response.relation_info?.customer_quotation_relation?.[
          rest.receive_customer_id!
        ]?.values || []
      const childQuotationParentId =
        relation?.parent_child_quotation_id_map || {}
      const quotation = _.find(relation?.quotations, (item) => {
        const isValid = quotationIds.includes(item.quotation_id)
        const isValidType = [
          Quotation_Type.WITHOUT_TIME,
          Quotation_Type.PERIODIC,
          Quotation_Type.WITH_TIME,
        ].includes(item.type)
        return isValid && isValidType
      })
      // 周期报价单子报价单
      const childQuotation = _.get(
        relation?.quotations,
        _.get(childQuotationParentId, quotation?.quotation_id || ''),
      )
      const menu = relation?.menu_relation?.[rest.menu_id!]

      this.order = {
        ...rest,
        order_details,
        order_raw_details,
        order_id,
        state,
        view_type: 'view',
        service_period_id: rest.service_period?.service_period_id! || '',
        group_users: relation?.group_users!,
        customer: customer
          ? {
              ...customer,
              quotation: quotation!,
              value: customer.customer_id,
              text: `${customer.name}(${customer.customized_code})`,
              settlement,
            }
          : undefined,
        sign_img_url,
      }

      // 保存后端返回的orderRowDetail和orderDetail的ID的对应关系,仅针对轻巧版
      if (globalStore.isLite) {
        _.forEach(order_details?.order_details, (item1) => {
          _.forEach(order_raw_details?.order_details, (item2) => {
            const {
              sort_num: sort_num1,
              sku_id: sku_id1,
              unit_id: unit_id1,
              order_unit_value_v2: {
                price: { val: priceVal1 },
                quantity: { val: quantityVal1 },
              },
            } = item1
            const {
              sort_num: sort_num2,
              sku_id: sku_id2,
              unit_id: unit_id2,
              order_unit_value_v2: {
                price: { val: priceVal2 },
                quantity: { val: quantityVal2 },
              },
            } = item2
            // 保证是同一个sku
            if (
              sku_id1 === sku_id2 &&
              unit_id1 === unit_id2 &&
              sort_num1 === sort_num2 &&
              priceVal1 === priceVal2 &&
              quantityVal1 === quantityVal2
            ) {
              this.orgOrderDetailIdMap[item1.order_detail_id] =
                item2.order_detail_id
            }
          })
        })
      }

      // 现在普通普通下单不包含组合商品时，取orderdetail的数据，
      const list = wrapDetailList(
        globalStore.isLite
          ? order_details?.order_details || []
          : handleDetailListWithCombineSku(
              order_details?.order_details! as DetailListItem[],
              order_raw_details?.order_details! as DetailListItem[],
            ) || [],
        relation,
        (detail) => {
          const value1 = detail.add_order_value1?.quantity?.val
          const value2 = detail.add_order_value2?.quantity?.val
          const value3 = detail.add_order_value3?.quantity?.val
          const value4 = detail.add_order_value4?.quantity?.val

          return {
            add_order_value1: isZero(value1)
              ? undefined
              : detail.add_order_value1,
            add_order_value2: isZero(value2)
              ? undefined
              : detail.add_order_value2,
            add_order_value3: isZero(value3)
              ? undefined
              : detail.add_order_value3,
            add_order_value4: isZero(value4)
              ? undefined
              : detail.add_order_value4,
            summary: detail,
            sort_num: detail.sort_num,
            isNewItem: false,
            basic_price: {
              current_price: !!detail?.sku_unit_is_current_price,
            },
            status: detail?.status,
            accept_value: detail?.accept_value,
            outstock_unit_value_v2: detail?.outstock_unit_value_v2,
            menu,
            quotationName:
              _.filter(
                [quotation?.inner_name, childQuotation?.inner_name],
                (v) => !_.isEmpty(v),
              ).join('-') || '-',
            detail_status: detail?.status!, // 加一个detail_status，update的时候去掉
            tax_price: detail?.tax_price,
            feIngredients: detail.ingredients,
          }
        },
      )
      this.list = list
      this.loading = false
      !globalStore.isLite &&
        this.reference.fetchReferencePrices(this.list as any)
      this.getBomList()
      return json
    })
  }

  getUpdateParams(): Promise<Order> {
    const { order, list } = this
    /**
     * 如果修改订单的时候不包含组合商品，order_details不合并，order_raw_details与order_details保持一致
     * 如果包含组合商品，order_details合并
     */
    let order_details = []
    if (globalStore.isLite) {
      order_details = list.find((sku) => isCombineSku(sku))
        ? mergeOrderDetails(
            wrapOrderDetail(
              list.filter((v) => v.sku_id && v.unit_id && !isCombineSku(v)),
              'orderDetail',
            ),
          )
        : wrapOrderDetail(
            list.filter((v) => v.sku_id && v.unit_id && !v.parentId),
            'orderDetail',
          )
    } else {
      order_details = wrapOrderDetail(
        list.filter((v) => v.sku_id && v.unit_id && !isCombineSku(v)),
        'orderDetail',
      )
    }
    return Promise.resolve({
      ..._.omit(order, 'quotation_id'),
      customize_type_id: order.customize_type_id || undefined,
      // order_raw_details,所有下单商品，不包括组合商品的原料
      order_raw_details: {
        order_details: wrapOrderDetail(
          list.filter((v) => v.sku_id && v.unit_id && !v.parentId),
          'orderRawDetail',
        ),
      },
      // order_details,不传组合商品。  --原料以及单品相同时累加
      order_details: {
        order_details: order_details,
      },
    })
  }

  getCreateParams() {
    const { order, list } = this
    /**
     * 如果新建订单的时候不包含组合商品，order_details不合并，order_raw_details与order_details保持一致
     * 如果包含组合商品，order_details合并
     */
    let order_details = []
    if (globalStore.isLite) {
      order_details = list.find((sku) => isCombineSku(sku))
        ? mergeOrderDetails(
            wrapOrderDetail(
              list.filter((v) => v.sku_id && v.unit_id && !isCombineSku(v)),
              'orderDetail',
              false,
            ),
          )
        : wrapOrderDetail(
            list.filter((v) => v.sku_id && v.unit_id && !v.parentId),
            'orderDetail',
            false,
          )
    } else {
      order_details = wrapOrderDetail(
        list.filter((v) => v.sku_id && v.unit_id && !isCombineSku(v)),
        'orderDetail',
        false,
      )
    }

    return Promise.resolve({
      order_id: '0',
      bill_customer_id: order.customer?.customer_id,
      receive_customer_id: order.customer?.customer_id,
      service_period: order.service_period,
      receive_time: order.receive_time,
      remark: order.remark,
      order_time: order.repair ? order.order_time : undefined,
      app_type: App_Type.TYPE_STATION,
      customize_type_id: order.customize_type_id || undefined,
      addresses: {
        addresses: order.customer?.attrs?.addresses,
      },
      /**
       * Order去掉quotation_id字段
       */
      // quotation_id: order.customer?.quotation.quotation_id,
      // order_raw_details,所有下单商品，不包括组合商品的原料
      order_raw_details: {
        order_details: wrapOrderDetail(
          list.filter((v) => v.sku_id && v.unit_id && !v.parentId),
          'orderRawDetail',
          false,
        ),
      },
      // order_details,不传组合商品。
      order_details: {
        order_details: order_details,
      },
    })
  }

  /**
   * @description: feIngredients是新保存的一份配比，用于记录当前的配比信息
   * @param {number} combineIndex
   * @param {number} ratioIndex
   * @param {string} ratio
   * @return {*}
   */
  updateMenuRowIngredients(
    combineIndex: number,
    ratioIndex: number,
    ratio: string | undefined,
  ): void {
    const ingredients = this.list[combineIndex].feIngredients || {}
    ingredients.ingredients![ratioIndex].ratio = ratio!
  }

  /**
   * 重置加单数
   * 修改下单单位后需要重置加单数
   */
  resetAddOrderValue(index: number) {
    this.updateRowItem(index, 'add_order_value1', undefined)
    this.updateRowItem(index, 'add_order_value2', undefined)
    this.updateRowItem(index, 'add_order_value3', undefined)
    this.updateRowItem(index, 'add_order_value4', undefined)
  }

  /** @description 控制发布的采购计划Drawer */
  setPublishPurchase(bool: boolean, index?: number) {
    this.publishPurchase = bool
    this.index = index || 0
  }

  /** @description 发布采购加计划 */
  publishPurchaseTask() {
    console.log('这里请求接口')
  }

  /** @description 根据sku_id获取到有没有bom */
  getBomList() {
    const sku_ids = _.map(this.list, (item) => item.sku_id!)
    const list_sku_v2_request = {
      filter_params: { sku_ids },
      paging: { limit: 999 },
    }
    ListBomSku({ list_sku_v2_request }).then((json) => {
      const sku = json.response.list_sku_v2_response?.skus || []
      _.forEach(sku, (item) => {
        const index = _.findIndex(this.list, (i) => i.sku_id === item.sku_id)
        if (index !== -1) {
          this.list[index].is_bom_type = true
        }
      })
    })
  }
}

const store = new Store()
export default store

export { initSsu }

reaction(
  () => {
    if (globalStore.isLite || store.order.view_type === 'view') {
      return []
    }
    const result = _.map(store.list, (item) => ({
      add_order_value1: item.add_order_value1,
      add_order_value2: item.add_order_value2,
      add_order_value3: item.add_order_value3,
      add_order_value4: item.add_order_value4,
      price: item.price,
      quantity: item.quantity,
      std_quantity: item.std_quantity,
      unit_id: item.unit_id,
    }))
    return result
  },
  (state) => {
    _.forEach(state, (item, index) => {
      const {
        add_order_value1,
        add_order_value2,
        add_order_value3,
        add_order_value4,
        unit_id: unitId,
      } = item
      const unit_id = unitId || ''
      // 该值可能为 null，解构赋值声明默认对 null 无效
      const quantity = item.quantity || 0
      const price = item.price || 0
      const std_quantity = item.std_quantity || 0

      const value1 = add_order_value1?.quantity?.val || 0
      const value2 = add_order_value2?.quantity?.val || 0
      const value3 = add_order_value3?.quantity?.val || 0
      const value4 = add_order_value4?.quantity?.val || 0
      const add_order_price1 = Big(value1).times(price).toString()
      const add_order_price2 = Big(value2).times(price).toString()
      const add_order_price3 = Big(value3).times(price).toString()
      const add_order_price4 = Big(value4).times(price).toString()
      store.updateRowItem(index, 'add_order_price1', add_order_price1)
      store.updateRowItem(index, 'add_order_price2', add_order_price2)
      store.updateRowItem(index, 'add_order_price3', add_order_price3)
      store.updateRowItem(index, 'add_order_price4', add_order_price4)
      // 总加单数
      store.updateRowItem(index, 'total_add_order_value', {
        quantity: {
          unit_id,
          val: Big(value1).plus(value2).plus(value3).plus(value4).toFixed(2),
        },
      })
      // 总加单金额
      store.updateRowItem(
        index,
        'total_add_order_price',
        Big(add_order_price1 || 0)
          .plus(add_order_price2 || 0)
          .plus(add_order_price3 || 0)
          .plus(add_order_price4 || 0)
          .toFixed(2),
      )
      /**
       * 套账下单金额
       * 套账下单金额=套账下单总数 * 单价
       * 套账下单总数=下单数+加单数1+加单数2+加单数3+加单数4
       */
      store.updateRowItem(
        index,
        'fake_order_price',
        Big(quantity)
          .plus(value1)
          .plus(value2)
          .plus(value3)
          .plus(value4)
          .times(price)
          .toFixed(2),
      )
      /**
       * 套账出库金额
       * 套账出库金额=套账出库总数 * 单价
       * 套账出库总数=出库数+加单数1+加单数2+加单数3+加单数4
       */
      store.updateRowItem(
        index,
        'fake_outstock_price',
        Big(std_quantity)
          .plus(value1)
          .plus(value2)
          .plus(value3)
          .plus(value4)
          .times(price)
          .toFixed(2),
      )
    })
  },
)

// 订单详情选择\更改商品\订单后，刷新参考成本
reaction(
  () => {
    const ids = store.list.map((item) => [item.sku_id, item.unit_id])
    return ids
  },
  debounce(() => {
    store.reference.fetchReferencePrices(store.list as any)
    store.reference.fetchSalePriceData(
      store.list
        .filter((item) => item.sku_id && item.unit_id)
        .map((item) => {
          return {
            sku_id: item.sku_id,
            unit_id: item.unit_id,
            order_unit_id: item.unit_id,
            receive_customer_id: store.order.customer?.customer_id!,
          }
        }),
    )
    // store.reference.fetchSkuReferencePrices(
    //   store.list
    //     .filter((item) => item.sku_id && item.unit_id)
    //     .map((item) => {
    //       return {
    //         sku_id: item.sku_id,
    //         unit_id: item.unit_id,
    //         order_unit_id: item.unit_id,
    //       }
    //     }),
    // )
  }, 10),
  {
    scheduler: (run) => {
      // 轻巧版不需要
      !globalStore.isLite && run()
    },
  },
)
