import { Plan_Process } from '@/pages/production/plan_management/plan/enum'
import {
  ListProductionOrderFilter,
  ProducePlanConditionType,
  ProductionOrderExpand,
} from '@/pages/production/plan_management/plan/interface'
import { filterProductionOrders } from '@/pages/production/plan_management/plan/util'
import {
  CreateProductionOrder,
  GetProductionOrder,
  ListProductionLine,
  ListProductionOrder,
  ListProductionOrderRequest,
  ListProductionOrderRequest_PagingField,
  ProductionOrder,
  ProductionOrder_State,
  ProductionOrder_TimeType,
  ReqCreateProductionOrder,
  UpdateProductionOrder,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import moment from 'moment'
const initProducePlanCondition: ProducePlanConditionType = {
  productionOrderId: '0',
  isProduce: true,
  // todo 直接用Plan_Process会报错 无法理解
  tab: '1' as Plan_Process,
}

const initProductionPlanFilter: ListProductionOrderFilter = {
  begin_time: moment().add(-3, 'day').startOf('day').toDate(),
  end_time: moment().add(3, 'day').endOf('day').toDate(),
  state: ProductionOrder_State.STATE_UNSPECIFIED,
  production_line_id: '0',
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 服务于计划下的模块 */
  producePlanCondition = {
    ...initProducePlanCondition,
  }

  productionPlanFilter: ListProductionOrderFilter = {
    ...initProductionPlanFilter,
  }

  productionPlanList: ProductionOrderExpand[] = []

  productionLineList: { label: string; text: string; value: string }[] = []

  updateKey = 1

  fetchListProductionLine() {
    return ListProductionLine({ paging: { limit: 999 } }).then((res) => {
      this.productionLineList = _.map(
        res.response.production_lines,
        ({ name, production_line_id }) => ({
          label: name!,
          text: name!,
          value: production_line_id,
        }),
      )
    })
  }

  initData() {
    this.producePlanCondition = { ...initProducePlanCondition }
    this.productionPlanFilter = {
      ...initProductionPlanFilter,
    }
    this.productionPlanList = []
  }

  HandleProductionOrder() {
    const { productionOrderId } = this.producePlanCondition
    const productionPlanList = this.productionPlanList
    GetProductionOrder({
      production_order_id: productionOrderId,
      need_amount_sum: true,
    }).then((json) => {
      const order = json.response.production_order
      const _productionPlanList = _.map(
        productionPlanList,
        (productionPlan) => {
          if (productionPlan.production_order_id !== order.production_order_id)
            return productionPlan
          else {
            const newValue = {
              ...productionPlan,
              plan_amount_sum: order.plan_amount_sum,
              output_amount_sum: order.output_amount_sum,
            }
            return newValue
          }
        },
      )
      this.productionPlanList = _productionPlanList
    })
  }

  getData(productionOrderId?: string): ListProductionOrderRequest {
    const { begin_time, end_time, ...res } = this.productionPlanFilter
    const params = {
      time_type: ProductionOrder_TimeType.TIME_TYPE_DELIVERY,
      begin_time: +begin_time + '',
      end_time: +end_time + '',
      need_amount_sum: true,
      need_production_line: true,
      sort_by: [
        {
          field: ListProductionOrderRequest_PagingField.DELIVERY_TIME,
          desc: true,
        },
        {
          field: ListProductionOrderRequest_PagingField.CREATE_TIME,
          desc: true,
        },
      ],
      paging: { limit: 999 },
      production_order_ids: [productionOrderId!],
      need_last_delivery_time_sort: true,
      ...res,
    }
    return params
  }

  updateProducePlanCondition(value: Partial<ProducePlanConditionType>) {
    this.producePlanCondition = {
      ...this.producePlanCondition,
      ...value,
    }
  }

  /** 搜索计划相关 */
  updateProductionPlanFilter<T extends keyof ListProductionOrderFilter>(
    key: T,
    value: ListProductionOrderFilter[T],
  ) {
    this.productionPlanFilter[key] = value
    this.fetchList()
  }

  updateProductionPlanAllFilter(value: ListProductionOrderFilter) {
    this.productionPlanFilter = value
    this.fetchList()
  }

  fetchList(productionOrderId?: string) {
    const params = this.getData()
    return ListProductionOrder({ ...params }).then((res) => {
      const { production_orders, production_lines } = res.response
      // 新建需求跳转回来后将对应的计划放到第一个
      const productionOrders = filterProductionOrders(
        production_orders,
        productionOrderId,
      )
      const productionOrder = productionOrders?.[0]
      this.productionPlanList = _.map(productionOrders, (v) => ({
        lineName: production_lines?.[v.production_line_id!]?.name || '',
        ...v,
      }))

      this.producePlanCondition = {
        ...this.producePlanCondition,
        productionOrder,
        productionOrderId: productionOrder?.production_order_id || '0',
      }
      this.updateKey += 1
    })
  }

  createProductionOrder(params: ReqCreateProductionOrder) {
    const { delivery_time, ...res } = params
    return CreateProductionOrder({
      production_order: {
        delivery_time: '' + moment(delivery_time).endOf('day'),
        ...res,
      },
    })
  }

  updateProductionOrder(production_order: ProductionOrder) {
    return UpdateProductionOrder({ production_order })
  }
}

export default new Store()
