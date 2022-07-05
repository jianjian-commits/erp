import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import Big from 'big.js'
import { Ssu, OrderInfo, Sku } from '../../components/interface'
import {
  GetOrder,
  Order,
  OrderDetail,
  OrderRelationInfoResponse,
} from 'gm_api/src/order'
import { toFixedOrder } from '@/common/util'
import {
  BasicPrice,
  GetManySkuResponse_SkuInfo,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { App_Type } from 'gm_api/src/common'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import {
  GetOrderSettings,
  OrderSettings_CombineRound,
} from 'gm_api/src/preference'

import { initSsu } from '../../components/init'
import {
  getOrderDetail,
  getOrderSkuList,
  mergeSsuList,
  updateSkuByPrice,
  getQuantity,
} from './util'
import { getSignImgUrl, toBasicUnit } from '@/pages/order/util'
import shopStore from '@/pages/system/shop_decoration/shop_meal/store'
import referenceMixin from '@/pages/order/order_manage/store/reference'
import { DataNode } from '@/common/interface'
import { fetchTreeData } from '@/common/service'

interface MenuOrderInfo extends OrderInfo {
  view_type: 'view' | 'edit'
}

export type SkuMap = { [key: string]: Sku }

interface OrderSetting {
  COMBINEROUND_CLOSE: boolean
  COMBINEROUND_UP: boolean
  COMBINEROUND_MID: boolean
  COMBINEROUND_WHEN_BEFORE: boolean
  COMBINEROUND_WHEN_AFTER: boolean
}

const initOrderSetting = {
  COMBINEROUND_CLOSE: true,
  COMBINEROUND_UP: false,
  COMBINEROUND_MID: false,
  COMBINEROUND_WHEN_BEFORE: false,
  COMBINEROUND_WHEN_AFTER: false,
}

const initOrderInfo: MenuOrderInfo = {
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
  view_type: 'view',
  group_users: {},
  quotation_id: '',
  customer_users: {},
  sign_img_url: undefined,
}

class Store {
  order: MenuOrderInfo = {
    ...initOrderInfo,
  }

  list: Sku[] = []

  menuList: Sku[] = []

  loading = true

  hasEditPermission = true

  skuMap: SkuMap = {}

  /**
   * 保存原料报价单信息，如单价，定价单位，最小下单数等
   */
  ingredientBasicPrice: BasicPrice = {}

  orderSetting: OrderSetting = { ...initOrderSetting }

  reference = referenceMixin

  relation: OrderRelationInfoResponse | undefined

  /** 商品分类map */
  categoryMap: { [key: string]: DataNode } = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
    this.getCategoryMap()
  }

  /** 获取商品分类数据 */
  async getCategoryMap() {
    const { categoryMap } = await fetchTreeData()
    this.categoryMap = await categoryMap
  }

  get summary() {
    const { order } = this
    const orderPrice = +order.order_price! || 0
    const outStockPrice = +order.outstock_price! || 0
    const salePrice = +order.sale_price! || 0
    const freightPrice = +order.freight_price! || 0
    if (order.view_type !== 'view') {
      const result = this.list
        .filter((v) => v.sku_id && v.unit_id)
        .reduce(
          (sum, v) => {
            const {
              quantity,
              price,
              std_quantity = '0',
              fee_unit_id,
              unit_id,
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
                Big(toBasicUnit(quantity || '0', v, 'quantity')).times(
                  toBasicUnit(price || '0', v, 'price'),
                ),
              )

              outStockPrice = toFixedOrder(
                Big(toBasicUnit(std_quantity || '0', v, 'quantity')).times(
                  toBasicUnit(price || '0', v, 'price'),
                ),
              )
            }
            return {
              orderPrice: Big(sum?.orderPrice || 0).add(order_price || 0),
              // TODO 目前出库数单位与下单数一致
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
            .minus(Big(+order.aftersale_price! || 0))
            .minus(Big(+order.coupon_price! || 0)),
        ),
        freightPrice,
      }
    }
    return { orderPrice, outStockPrice, salePrice, freightPrice }
  }

  init(): void {
    this.order = { ...initOrderInfo }
    this.list = []
    this.menuList = []
    this.ingredientBasicPrice = {}
  }

  updateIngredientBasicPrice(basicPrice: BasicPrice) {
    this.ingredientBasicPrice = { ...this.ingredientBasicPrice, ...basicPrice }
  }

  updateSkuMap(key: string, value: Sku): void {
    if (this.skuMap[key]) {
      this.skuMap[key] = value
    } else {
      this.skuMap = {
        ...this.skuMap,
        [key]: value,
      }
    }
  }

  updateOrderInfo<T extends keyof MenuOrderInfo>(
    key: T,
    value: MenuOrderInfo[T],
  ): void {
    this.order[key] = value
  }

  updateMenuRowItem<T extends keyof Sku>(
    index: number,
    key: T,
    value: Sku[T],
  ): void {
    this.menuList[index][key] = value
  }

  // feIngredients是新保存的一份配比，用于记录当前的配比信息
  updateMenuRowIngredients(
    menuIndex: number,
    ratioIndex: number,
    ratio: string | undefined,
  ): void {
    const ingredients = this.menuList[menuIndex].feIngredients || {}
    ingredients.ingredients![ratioIndex].ratio = ratio!
  }

  addMenuListRow(index = this.menuList.length): void {
    this.menuList.splice(index + 1, 0, { ...initSsu })
  }

  updateMenuListRow(index: number, row: Sku = initSsu): void {
    Object.assign(this.menuList[index], { ...row })
  }

  deleteMenuListRow(
    index: number,
    orderSetting?: OrderSetting, // 下单取整规则
  ): void {
    this.menuList.splice(index, 1)
    // 更新订单明细
    this.updateMergeSku(
      this.menuList.filter((s) => s.sku_id && s.unit_id),
      this.skuMap,
      undefined,
      this.list,
      orderSetting,
    )
  }

  updateRowItem<T extends keyof Sku>(
    index: number,
    key: T,
    value: Sku[T],
  ): void {
    this.list[index][key] = value
  }

  setEditPermission(permission: Permission): void {
    this.hasEditPermission = globalStore.hasPermission(permission)
  }

  /**
   * 更新明细
   */
  updateMergeSku(
    menuList: Sku[],
    skuMap: SkuMap = this.skuMap,
    orderDetails: OrderDetail[] | undefined = undefined,
    skuList: Sku[] | undefined = undefined,
    orderSetting?: OrderSetting, // 下单取整规则
  ): void {
    const newSsuList = mergeSsuList(
      menuList,
      skuMap,
      orderDetails,
      skuList,
      orderSetting,
    ) // 合并ssu
    this.list = newSsuList.slice()
  }

  addMergeSsu(
    menuList: Ssu[],
    skuMap: SkuMap = this.skuMap,
    orderDetails: OrderDetail[] | undefined = undefined,
    ssuList: Ssu[] | undefined = undefined,
  ): void {
    const newSsuList = mergeSsuList(menuList, skuMap, orderDetails, ssuList) // 合并ssu
    this.list = _.concat(this.list, newSsuList)
  }

  /** 明细中商品价格改动，需要同步组合商品价格 ssu.price */
  updateCombineSkuPrice(sku_id: string, unit_id: string): void {
    /** 判断当前修改商品为组合商品原料, 更新组合商品的单价信息 */
    const menuSkus = updateSkuByPrice(this.menuList, this.list, {
      sku_id,
      unit_id,
    })
    this.menuList = menuSkus.slice()
  }

  /** 获取订单取整设置 */
  fetchOrderSetting(): Promise<unknown> {
    return GetOrderSettings().then((res) => {
      const { combine_round_method } = res.response.order_settings
      const method = 1 << 3
      const when = 1 << 5
      const close =
        (combine_round_method! &
          OrderSettings_CombineRound.COMBINEROUND_CLOSE) ===
        1
      const combine_method = combine_round_method! & (method - 1)
      const combine_method_when = combine_round_method! & (when - method)

      this.orderSetting = {
        COMBINEROUND_CLOSE: close,
        COMBINEROUND_UP: close
          ? false
          : combine_method === OrderSettings_CombineRound.COMBINEROUND_UP,
        COMBINEROUND_MID: close
          ? false
          : combine_method === OrderSettings_CombineRound.COMBINEROUND_MID,
        COMBINEROUND_WHEN_BEFORE: close
          ? false
          : combine_method_when ===
            OrderSettings_CombineRound.COMBINEROUND_WHEN_BEFORE,
        COMBINEROUND_WHEN_AFTER: close
          ? false
          : combine_method_when ===
            OrderSettings_CombineRound.COMBINEROUND_WHEN_AFTER,
      }
      return null
    })
  }

  async fetchOrder(id: string): Promise<unknown> {
    this.loading = true
    await shopStore.getData()
    return GetOrder({
      serial_no: id,
      relation_info: {
        need_customer_info: true,
        need_quotation_info: true,
        need_sku_info: true,
        need_user_info: true,
      },
    }).then(async (json) => {
      await this.fetchOrderSetting()
      const { order_id, order_raw_details, order_details, state, ...rest } =
        json.response.order!
      const relation = json.response.relation_info!
      const customer = (relation?.customers || {})[rest.receive_customer_id!]
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
        ].includes(item.type)
        return isValid && isValidType
      })
      // 周期报价单子报价单
      const childQuotation = _.get(
        relation?.quotations,
        _.get(childQuotationParentId, quotation?.quotation_id || ''),
      )
      // 司机app签收图片url
      const sign_img_url = await getSignImgUrl(order_id)
      let settlement = customer.settlement
      if (customer.level === 2) {
        const parent = (relation?.customers || {})[customer.parent_id || '']
        settlement = {
          ...settlement,
          china_vat_invoice: { ...parent?.settlement?.china_vat_invoice! },
        }
      }
      // todo
      this.skuMap = relation.sku_snaps || {}
      this.relation = relation
      this.order = {
        ...rest,
        order_id,
        state,
        view_type: 'view',
        service_period_id: rest.service_period?.service_period_id!,
        group_users: relation?.group_users!,
        customer_users: relation?.customer_users!,
        customer: customer
          ? {
              ...customer,
              quotation,
              value: customer.customer_id,
              text: `${customer.name}(${customer.customized_code})`,
              settlement,
            }
          : undefined,
        order_raw_details,
        order_details,
        sign_img_url,
      }

      this.menuList = getOrderSkuList(
        order_raw_details?.order_details?.slice(),
        relation,
        quotation!,
      )
      const newSsuList = mergeSsuList(
        this.menuList,
        relation.sku_snaps || {},
        order_details?.order_details,
        undefined,
        this.orderSetting,
      ) // 合并ssu
      this.list = newSsuList.map((item) => {
        return {
          ...item,
          quotationName:
            _.filter(
              [quotation?.inner_name, childQuotation?.inner_name],
              (v) => !_.isEmpty(v),
            ).join('-') || '-',
        }
      })
      this.loading = false
      this.reference.fetchReferencePrices(this.list as any)
      return json.response
    })
  }

  /** 处理数据，包括针对原料的下单数取整规则 */
  getUpdateParams(): Promise<Order | Record<string, any>> {
    const { order, menuList, skuMap, orderSetting, list } = this
    // 这里需要重新处理原料数据，根据下单取整规则由前端处理原料下单数后传给后台
    const materialList = mergeSsuList(
      menuList,
      skuMap,
      undefined,
      list,
      orderSetting,
    )

    return Promise.resolve({
      ..._.omit(order, 'quotation_id'),
      order_raw_details: {
        // 菜谱中的商品
        order_details: menuList
          .filter((v) => v.sku_id && v.unit_id)
          .map((v, i) => {
            return getOrderDetail(
              i,
              v,
              ({ quantity, price, unit_id, fee_unit_id }) => {
                return {
                  // 出库数会随着单价跟配比变动
                  order_unit_value_v2: {
                    quantity: {
                      unit_id: unit_id!,
                      val: `${quantity || 0}`!,
                    },
                    price: {
                      unit_id: fee_unit_id!,
                      val: `${price}`,
                    },
                  },
                  outstock_unit_value_v2: {
                    quantity: {
                      unit_id: unit_id!,
                      val: `${quantity || 0}`!,
                    },
                    price: {
                      unit_id: fee_unit_id!,
                      val: `${price}`,
                    },
                  },
                }
              },
            )
          }),
      },
      order_details: {
        order_details: materialList
          .filter((v) => v.sku_id && v.unit_id)
          .map((v, i) => {
            const org = _.find(
              this.order.order_details?.order_details,
              (de) => de.sku_id === v.sku_id && de.unit_id === v.unit_id,
            )
            return getOrderDetail(
              i,
              v,
              ({ quantity, std_quantity, price, unit_id, fee_unit_id }) => {
                return {
                  ...org,
                  tax: v.tax || '0', // 税率为空要传0，不然提交报错
                  order_unit_value_v2: {
                    quantity: {
                      unit_id: unit_id!,
                      val: `${toFixedOrder(quantity || 0)}`,
                    },
                    price: {
                      unit_id: fee_unit_id!,
                      val: `${price}`,
                    },
                  },
                  outstock_unit_value_v2: {
                    quantity: {
                      unit_id: unit_id!,
                      val: `${toFixedOrder(std_quantity || 0)}`,
                    },
                    price: {
                      unit_id: fee_unit_id!,
                      val: `${price}`,
                    },
                  },
                }
              },
            )
          }),
      },
    })
  }
}

export default new Store()
