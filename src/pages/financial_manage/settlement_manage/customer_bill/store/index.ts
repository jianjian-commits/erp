import { PagingParams } from 'gm_api/src/common'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { Bill } from '../interface'
import { FilterParams, DATE_RANGE_TYPE } from '../filter'
import moment from 'moment'
import {
  ListBillOrder,
  ListBillOrderFilter,
  ListBillOrderRequest,
} from 'gm_api/src/finance'

/** 默认分页参数 */
const createDefaultPaging = (): PagingParams => ({
  offset: 0,
  limit: 10,
  need_count: true,
})

/** 默认筛选参数 */
const createDefaultFilterParams = (): Partial<FilterParams> => ({
  timeRange: {
    begin: moment().startOf('day').add(-29, 'day').toDate(),
    end: moment().endOf('day').toDate(),
    dateType: 1,
  },
  customeLabelId: '',
})

interface GetListParams extends Partial<FilterParams> {
  /** 分页信息 */
  paging?: PagingParams
}

/**
 * 财务模块 - 客户账单列表 store
 */
class CustomerBillListStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 客户账单列表数据 */
  list: Bill[] = []

  private _setList(value: Bill[]) {
    this.list = value
  }

  /** 缓存分页数据 */
  private _paging = createDefaultPaging()

  /** 获取分页数据（接口请求时使用） */
  private _getPaging(paging?: PagingParams) {
    if (_.isPlainObject(paging)) {
      this._paging = paging as PagingParams
      return paging
    }
    // 重新筛选时才会执行到此处
    const result = createDefaultPaging()
    result.limit = this._paging.limit
    return result
  }

  /**
   * 筛选参数
   * 这里的值仅作为初始化、接口请求时使用。并不能控制筛选组件内的值。
   */
  filterParams = createDefaultFilterParams()

  /** 获取筛选参数（接口请求时使用） */
  private _getFilterParams(params?: GetListParams): GetListParams {
    const { paging, ...filter } = params || {}
    const pagin = this._getPaging(paging)
    if (!_.isEmpty(filter)) {
      return { paging: pagin, ...filter }
    }
    return { paging: pagin, ...this.filterParams }
  }

  /**
   * 当前请求时使用的筛选参数（与 filterParams 不同，此处为接口参数名）
   */
  currentFilterOrderParams: ListBillOrderFilter | undefined

  /**
   * 跳转详情时需要使用的 search 参数
   */
  get filterTimeParams() {
    const {
      order_time_from_time,
      order_time_to_time,
      order_receive_to_time,
      order_outstock_to_time,
      order_receive_from_time,
      order_outstock_from_time,
    } = this.currentFilterOrderParams || {}

    return new URLSearchParams(
      _.pickBy(
        {
          order_time_from_time,
          order_time_to_time,
          order_receive_to_time,
          order_outstock_to_time,
          order_receive_from_time,
          order_outstock_from_time,
        },
        (item) => !_.isNil(item),
      ) as Record<string, string>,
    ).toString()
  }

  /** 转换筛选参数为接口参数 */
  private _transformFilterParams(params?: GetListParams) {
    const filter = this._getFilterParams(params)
    const customerIds = _.map(filter.customers, (item) => item.value)
    const handleTime = (
      value: FilterParams['timeRange'],
    ): ListBillOrderFilter | undefined => {
      switch (value.dateType) {
        case DATE_RANGE_TYPE.ORDER_DATE: {
          return {
            order_time_from_time: `${value.begin.getTime()}`,
            order_time_to_time: `${value.end.getTime()}`,
          }
        }
        case DATE_RANGE_TYPE.OUT_DATE: {
          return {
            order_outstock_from_time: `${value.begin.getTime()}`,
            order_outstock_to_time: `${value.end.getTime()}`,
          }
        }
        case DATE_RANGE_TYPE.RECEIPT_DATE: {
          return {
            order_receive_from_time: `${value.begin.getTime()}`,
            order_receive_to_time: `${value.end.getTime()}`,
          }
        }
        // no default
      }
    }

    this.currentFilterOrderParams = handleTime(filter.timeRange!)

    const result: ListBillOrderRequest = {
      list_bill_order_filter: {
        ...this.currentFilterOrderParams,
        receive_customer_ids: customerIds,
        customer_label_ids: filter.customeLabelId
          ? [filter.customeLabelId]
          : undefined,
      },
      paging: filter.paging!,
    }
    return result
  }

  setFilterParams(params: GetListParams) {
    this.filterParams = params
  }

  /** 获取客户账单列表数据 */
  async getList(params?: GetListParams) {
    try {
      const filter = this._transformFilterParams(params)
      const { response } = await ListBillOrder(filter)
      this._setList(
        _.map(response.bill_order_infos, (item): Bill => {
          return {
            customerId: item.customer_id!,
            customerCode: item.customized_code || '',
            customerName: item.customer_name || '',
            amountPayable: item.outstock_price || '',
            amountPaid: item.paid_amount || '',
            outstandingAmount: item.non_pay_amount || '',
            amountAfterSale: item.order_after_sale_price || '',
            amountToBeSettled: item.non_settlement_amount || '',
          }
        }),
      )
      return response
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /** 清空 store 数据 */
  clear() {
    this._paging = createDefaultPaging()
    this.filterParams = createDefaultFilterParams()
    this.list = []
  }
}

/**
 * 财务模块 - 客户账单列表 store
 */
export default new CustomerBillListStore()
