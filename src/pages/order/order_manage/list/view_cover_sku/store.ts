import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'

import type { SkuDetail } from '../../../interface'
import {
  ListOrderDetail,
  CommonListOrder,
  ListOrderDetailRequest_AcceptState,
  OrderDetail,
} from 'gm_api/src/order'
import {
  BatchDeleteOrderDetail,
  BatchDeleteOrderDetailRequest,
} from 'gm_api/src/orderlogic'
import { Quotation_Type } from 'gm_api/src/merchandise'
import { Filters_Bool, PagingResult } from 'gm_api/src/common'
import shopStore from '@/pages/system/shop_decoration/shop_meal/store'
import referenceMixin from '@/pages/order/order_manage/store/reference'
import globalStore from '@/stores/global'
import { DataNode } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import { t } from 'gm-i18n'
import type { F, InputKey } from './interface'

const initFilter: F = {
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  dateType: 1,
  status: 0,
  pay_status: 0,
  is_out_stock: '',
  sort_remark: '',
  serial_no: '',
  receive_customer_id: '',
  app_id: '',
  service_period_id: '',
  category: [],
  is_weight: '',
  is_create_purchase_task: Filters_Bool.ALL,
  is_create_production_task: Filters_Bool.ALL,
  sku_is_process: Filters_Bool.ALL,
  sort_status: 0,
  customers: [],
  sale_menus: [],
  drivers: [],
  sku_q: '',
  menu_period_group_ids: [],
  // 验收状态
  accept_state: ListOrderDetailRequest_AcceptState.ACCEPT_STATUS_UNSPECIFIED,
  manual_purchase: 0,
  supplier_cooperate_model_type: -1,
  order_type: [],
  customize_type_ids: [],
}

// 计算总金额、加单总数的遍历 key
const addOrderKeyList = [
  'add_order_value1',
  'add_order_value2',
  'add_order_value3',
  'add_order_value4',
] as const

// 计算每一项对应加单金额
const addOrderPriceQuantityKey = [
  'add_order_price1',
  'add_order_price2',
  'add_order_price3',
  'add_order_price4',
] as const

type CountAddOrderValueKey = typeof addOrderKeyList[number]
class Store {
  filter: F = {
    ...initFilter,
  }

  paging: PagingResult = {
    count: '0',
  }

  list: SkuDetail[] = []

  orderData = {
    addOrderValueTotal: 0,
  }

  reference = referenceMixin

  categoryData: DataNode[] = []

  doRequest = (): any => {
    return null
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  initFilter() {
    this.filter = { ...initFilter }
  }

  updateFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value
  }

  updateSku<T extends keyof SkuDetail>(
    index: number,
    key: T,
    value: SkuDetail[T],
  ) {
    this.list[index][key] = value
  }

  onChangeSkuData<T extends InputKey>(
    index: number,
    key: InputKey,
    value: SkuDetail[T],
  ) {
    this.list[index][key] = value

    const { addOrderValueTotal, addOrderPriceTotal } =
      this.getTotalAddOrderValue(this.list[index])

    const { fakeOrderPrice, fakeOutstockPrice } = this.getTotalFakePrice(
      this.list[index],
    )

    if (key === 'outstock_unit_value_v2') {
      // 出库金额
      this.list[index].outstock_price = '' + this.getTotalOutStockPrice(index)
      // 套账出库总金额
      this.list[index].fake_outstock_price = '' + fakeOutstockPrice
    }

    if (addOrderKeyList.indexOf(key as any) > -1) {
      // 总加单
      this.list[index].total_add_order_value = {
        quantity: {
          ...this.list[index]?.total_add_order_value?.quantity,
          val: '' + addOrderValueTotal,
          unit_id: this.list[index]?.unit_id!,
        },
      }
      // 套账下单总金额
      this.list[index].fake_order_price = '' + fakeOrderPrice
      // 套账出库金额
      this.list[index].fake_outstock_price = '' + fakeOrderPrice
      // 每一项加单金额
      this.getAddOrderPriceQuantity(index)
      // 总加单金额
      this.list[index].total_add_order_price = '' + addOrderPriceTotal
    }
  }

  // 总加单总数 = 加单1 + 2 + 3 + 4
  // 总加单金额 = 加单金额1 + 2 + 3 + 4
  getTotalAddOrderValue(curOrderDetail: OrderDetail) {
    let addOrderValueTotal = 0 // 总加单总数
    let addOrderPriceTotal = 0 // 总加单金额
    const orderPrice = +curOrderDetail.order_unit_value_v2?.price?.val!
    for (const key of addOrderKeyList) {
      if (curOrderDetail[key]?.quantity?.val) {
        addOrderValueTotal += +curOrderDetail[key]?.quantity?.val!
        addOrderPriceTotal += +curOrderDetail[key]?.quantity?.val! * orderPrice
      }
    }
    return {
      addOrderValueTotal: String(addOrderValueTotal),
      addOrderPriceTotal: String(addOrderPriceTotal),
    }
  }

  // 计算每一项加单金额的量
  getAddOrderPriceQuantity(index: number, list = this.list) {
    // 循环赋值每一项
    addOrderPriceQuantityKey.forEach((it, idx) => {
      const addOrderValueKey = addOrderKeyList[idx]
      if (list[index][addOrderValueKey]?.quantity?.val) {
        list[index][it] = this.getAddOrderPrice(addOrderValueKey, list[index])
      }
    })
  }

  // 加单金额 = 加单数 * 单价
  getAddOrderPrice(
    valueKey: CountAddOrderValueKey,
    curOrderDetail: OrderDetail,
  ) {
    if (curOrderDetail[valueKey]?.quantity?.val) {
      return String(
        +curOrderDetail[valueKey]?.quantity?.val! *
          +curOrderDetail.order_unit_value_v2?.price?.val!,
      )
    }
    return ''
  }

  // 出库金额 = 出库数 * 单价
  getTotalOutStockPrice(index: number) {
    return String(
      +this.list[index].order_unit_value_v2?.price?.val! *
        +this.list[index].outstock_unit_value_v2?.quantity?.val!,
    )
  }

  // 计算套账出库金额
  // 计算套账下单金额
  getTotalFakePrice(curOrderDetail: OrderDetail) {
    const { addOrderPriceTotal } = this.getTotalAddOrderValue(curOrderDetail)

    return {
      // 计算套账下单金额 = 下单金额 + 总加单金额
      fakeOrderPrice: String(
        +curOrderDetail.order_price! + Number(addOrderPriceTotal),
      ),
      // 计算套账出库金额 = 出库金额 + 总加单金额
      fakeOutstockPrice: String(
        +curOrderDetail.outstock_price! + Number(addOrderPriceTotal),
      ),
    }
  }

  getParams() {
    const { filter } = this
    const { begin, end, dateType, category, customize_type_ids } = this.filter
    const appOp = filter.app_id.split('_')
    const baseParams: CommonListOrder = {
      serial_nos: filter.serial_no ? [filter.serial_no] : undefined,
      states: filter.status ? [filter.status as number] : undefined,
      customer_search_text: filter.receive_customer_id || undefined,
      receive_customer_ids: filter.customers.map((v) => v.value),
      pay_states: filter.pay_status ? [filter.pay_status as number] : undefined,
      quotation_ids: filter.sale_menus.map((v) => v.value) || undefined,
      app_types: appOp[0] ? [appOp[0]] : undefined,
      order_op: appOp[1] ? [appOp[1]] : undefined,
      is_out_stock: filter.is_out_stock
        ? filter.is_out_stock === '1'
          ? Filters_Bool.TRUE
          : Filters_Bool.FALSE
        : undefined,
      driver_ids: filter.drivers.map((v) => v.value),
      service_period_id: undefined,
      sorting_remark: filter.sort_remark || undefined,
      menu_period_group_ids: _.map(
        filter.menu_period_group_ids,
        ({ value }) => value,
      ),
      customize_type_ids: customize_type_ids.map((item) => item.value),
    }
    const params =
      dateType === 1
        ? {
            order_time_from_time: `${+begin}`,
            order_time_to_time: `${+end}`,
          }
        : {
            order_receive_from_time: `${+begin}`,
            order_receive_to_time: `${+end}`,
          }

    const categorys: Record<string, string> = {}

    category.map((item, index) => {
      switch (index) {
        case 0: {
          categorys.category_id_1 = item
          break
        }
        case 1: {
          categorys.category_id_2 = item
          break
        }
        case 2: {
          categorys.category_id_3 = item
          break
        }
        default: {
          Tip.danger(t('商品分类不应超过三级'))
          throw new Error('SPU CATEGORY ERROR')
        }
      }
    })

    const req: any = {
      common_list_order: {
        ...params,
        ...baseParams,
      },
      ...categorys,
      sku_is_weight: filter.is_weight
        ? filter.is_weight === '1'
          ? Filters_Bool.TRUE
          : Filters_Bool.FALSE
        : undefined,
      is_create_purchase_task: filter.is_create_purchase_task,
      is_create_production_task: filter.is_create_production_task,
      sorting_status: filter.sort_status ? [filter.sort_status] : undefined,
      sku_q: filter.sku_q || undefined,
      accept_state: filter.accept_state || 0,
      manual_purchase: filter.manual_purchase || 0,
      fake_types: [2, 3],
    }

    if (filter.supplier_cooperate_model_type !== -1) {
      req.supplier_cooperate_model_type = filter.supplier_cooperate_model_type
    }

    return req
  }

  async fetchList(params?: any) {
    await shopStore.getData()
    return ListOrderDetail(
      Object.assign(
        {
          ...this.getParams(),
          relation_info: {
            need_customer_info: true,
            need_quotation_info: true,
            need_sku_info: true,
            need_driver_info: true,
            need_user_info: true,
            need_menu_period_group: true,
            need_menu_info: true,
          },
        },
        params,
      ),
    ).then(async (json) => {
      const details = json.response.details! || []
      const relation = json.response.relation_info
      const customers = relation?.customers || {}
      const quotations = relation?.quotations || {}
      const menus = relation?.menu_relation

      const childQuotationParentId =
        json.response.relation_info?.parent_child_quotation_id_map || {}
      const menu_period_groups =
        json.response.relation_info?.menu_period_groups || {}
      const list =
        details.map((v) => {
          const sku_snap = _.find(
            relation?.sku_snaps,
            (value, key) =>
              key === v.detail?.sku_id + '_' + v.detail?.sku_revision,
          )
          const { unit_cal_info, unit_id } = v.detail!
          const units = unit_cal_info?.unit_lists
          const unit = units?.find((unit) => unit.unit_id === unit_id)
          const parentUnit = units?.find(
            (parentUnit) => parentUnit.unit_id === unit?.parent_id,
          )
          const quotationIds =
            json.response.relation_info?.customer_quotation_relation?.[
              v?.order?.receive_customer_id!
            ]?.values || []
          const quotation = _.find(quotations, (item) => {
            const isValid = quotationIds.includes(item.quotation_id)
            const isValidStatus = [
              Quotation_Type.WITHOUT_TIME,
              Quotation_Type.PERIODIC,
            ].includes(item.type)
            return isValid && isValidStatus
          })
          // 周期报价单子报价单
          const childQuotation = _.get(
            quotations,
            _.get(childQuotationParentId, quotation?.quotation_id || ''),
          )
          const menu = menus?.[v.order?.menu_id!]
          return {
            ..._.omit(sku_snap, 'units'),
            ...v.detail!,
            unit,
            parentUnit,
            canDelete: v.can_delete,
            editing: false,
            order: v.order,
            customer: customers[v?.order?.receive_customer_id!],
            quotationName: _.filter(
              [quotation?.inner_name, childQuotation?.inner_name],
              (v) => !_.isEmpty(v),
            ).join('-'),
            quotation,
            menu,
            // quotation: quotations[v.order?.quotation_id!],
            menu_period_group:
              menu_period_groups[v.order?.menu_period_group_id!],
            add_order_price1: this.getAddOrderPrice(
              'add_order_value1',
              v.detail!,
            ),
            add_order_price2: this.getAddOrderPrice(
              'add_order_value2',
              v.detail!,
            ),
            add_order_price3: this.getAddOrderPrice(
              'add_order_value3',
              v.detail!,
            ),
            add_order_price4: this.getAddOrderPrice(
              'add_order_value4',
              v.detail!,
            ),
            total_add_order_price: this.getTotalAddOrderValue(v.detail!)
              .addOrderPriceTotal,
            fake_order_price: this.getTotalFakePrice(v.detail!).fakeOrderPrice,
            fake_outstock_price: this.getTotalFakePrice(v.detail!)
              .fakeOutstockPrice,
          }
        }) || []
      this.list = list as any
      this.paging = json.response.paging
      !globalStore.isLite && this.reference.fetchReferencePrices(this.list)
      return json.response
    })
  }

  // 批量删除订单中的商品
  batchDeleteOrderDetails(ssuIds: string[], isSelectAll: boolean) {
    const params: BatchDeleteOrderDetailRequest = {
      filter: {
        ...this.getParams(),
        detail_ids: isSelectAll ? undefined : ssuIds,
        paging: { limit: 100 },
      },
    }
    return BatchDeleteOrderDetail(params).then(() => {
      Tip.success(
        '商品批量删除中，详细删除结果通过右侧“任务”栏中“批量任务”查看',
      )
      return null
    })
  }

  /**
   * 商品分类
   */
  async fetchCategory() {
    const { categoryTreeData } = await fetchTreeData()
    this.categoryData = categoryTreeData
  }
}

export default new Store()
