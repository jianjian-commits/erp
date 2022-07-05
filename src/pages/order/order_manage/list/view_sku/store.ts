import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'

import type { SkuDetail } from '../../../interface'
import {
  ListOrderDetail,
  CommonListOrder,
  ListOrderDetailRequest_AcceptState,
  FakeType,
} from 'gm_api/src/order'
import {
  BatchDeleteOrderDetail,
  BatchDeleteOrderDetailRequest,
} from 'gm_api/src/orderlogic'
import {
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { Filters_Bool, PagingResult } from 'gm_api/src/common'
import shopStore from '@/pages/system/shop_decoration/shop_meal/store'
import referenceMixin from '@/pages/order/order_manage/store/reference'
import globalStore from '@/stores/global'
import { DataNode } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import { t } from 'gm-i18n'
import type { F } from './interface'
import { getCustomerRoute } from '../utils'

const initFilter = {
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
  sku_unit_is_current_price: Filters_Bool.ALL,
  route: [],
  order_type: [],
  customize_type_ids: [],
}

class Store {
  filter: F = {
    ...initFilter,
  }

  paging: PagingResult = {
    count: '0',
  }

  list: SkuDetail[] = []

  reference = referenceMixin

  categoryData: DataNode[] = []

  /** 最近采购价|最近入库价 */
  priceOf: keyof GetSkuReferencePricesResponse_ReferencePrices =
    'purchase_reference_prices'

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
      route_ids: filter.route.map((v) => v.value),
      service_period_id: undefined,
      sorting_remark: filter.sort_remark || undefined,
      customize_type_ids: customize_type_ids.map((item) => item.value),
      menu_period_group_ids: _.map(
        filter.menu_period_group_ids,
        ({ value }) => value,
      ),
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
      ...(globalStore.isLite
        ? {}
        : {
            fake_types: [
              FakeType.FAKE_TYPE_TRUE,
              FakeType.FAKE_TYPE_FALSE,
              FakeType.FAKE_TYPE_TRUE_AND_FALSE,
            ],
          }),
      sku_unit_is_current_price: filter.sku_unit_is_current_price,
    }

    if (filter.supplier_cooperate_model_type !== -1) {
      req.supplier_cooperate_model_type = filter.supplier_cooperate_model_type
    }

    return req
  }

  async fetchList(params?: any) {
    await shopStore.getData()
    try {
      const json = await ListOrderDetail(
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
      )
      const routes = await getCustomerRoute(
        _.map(
          json.response.details,
          (item) => item.order?.receive_customer_id!,
        ),
      )
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
          const {
            unit_cal_info,
            unit_id,
            sku_id,
            sku_name,
            sku_customize_code,
            order_unit_value_v2,
            outstock_unit_value_v2,
            outstock_second_base_unit_value_v2,
          } = v.detail!
          const units = unit_cal_info?.unit_lists
          const unit = units?.find((unit) => unit.unit_id === unit_id)
          const parentUnit = units?.find(
            (parentUnit) => parentUnit.unit_id === unit?.parent_id,
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

          const quotationIds =
            json.response.relation_info?.customer_quotation_relation?.[
              v?.order?.receive_customer_id!
            ]?.values || []
          // * 客户可以同时绑定报价单和菜谱，所以要根据这个订单的类型来找quotation
          const quotation = _.find(quotations, (item) => {
            const isValid = quotationIds.includes(item.quotation_id)
            const isValidStatus = [
              Quotation_Type.WITHOUT_TIME,
              Quotation_Type.PERIODIC,
              Quotation_Type.WITH_TIME,
            ].includes(item.type)
            return (
              v.order?.quotation_type === item.type && isValid && isValidStatus
            )
          })
          // 周期报价单子报价单
          const childQuotation = _.get(
            quotations,
            _.get(childQuotationParentId, quotation?.quotation_id || ''),
          )
          const menu = menus?.[v.order?.menu_id!]

          const route = routes[v?.order?.receive_customer_id!]

          return {
            ..._.omit(sku_snap, 'units'),
            ...v.detail!,
            quantity,
            price,
            std_quantity,
            std_unit_id,
            std_quantity_second,
            std_unit_id_second,
            isUsingSecondUnitOutStock: !!std_unit_id_second,
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
            route: {
              name: route?.route_name,
              id: route?.route_id,
            },
          }
        }) || []
      this.list = list as any
      this.paging = json.response.paging
      !globalStore.isLite && this.reference.fetchReferencePrices(this.list)

      this.reference.fetchSalePriceData(
        this.list.map((item) => {
          return {
            order_unit_id: item.unit_id,
            unit_id: item.unit_id,
            sku_id: item.sku_id,
            receive_customer_id: item.customer.customer_id,
          }
        }),
      )
      // this.reference.fetchSkuReferencePrices(
      //   this.list.map((item) => {
      //     return {
      //       order_unit_id: item.unit_id,
      //       unit_id: item.unit_id,
      //       sku_id: item.sku_id,
      //     }
      //   }),
      // )

      return json.response
    } catch (error) {
      return Promise.reject(error)
    }
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
