import { DataNode } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import { toFixedOrder } from '@/common/util'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'
import { Customer } from '@/pages/order/order_manage/components/interface'
import { getOrderUnitName } from '@/pages/order/util'
import { MoreSelectDataItem, Tip } from '@gm-pc/react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Filters_Bool } from 'gm_api/src/common'
import { Route } from 'gm_api/src/delivery'
import { GroupUser } from 'gm_api/src/enterprise'
import {
  Quotation,
  Unit,
  UnitValue,
  UnitValueSet,
} from 'gm_api/src/merchandise'
import {
  CommonListOrder,
  DetailList,
  ListOrderRequest_PagingField,
  OrderDetail,
  OrderRelationInfoResponse,
} from 'gm_api/src/order'
import {
  ExportSortingPerformance,
  ExportSortingSheet,
  ListOrderDetailWithRelation,
  OrderRelationInfo,
} from 'gm_api/src/orderlogic'
import { OpType, UpdateSortingTask } from 'gm_api/src/sorting'
import _ from 'lodash'
import { action, makeAutoObservable, toJS } from 'mobx'
import moment from 'moment'
import { SearchType } from '../components/searh_filter'
import { SORTING_STATUS_LIST } from './enum'
import { Filter, List } from './interface'

const begin_date = moment().startOf('day').toDate()
const end_date = moment().endOf('day').toDate()

/**
 * 初始的筛选条件
 */
const initFilter = {
  time_type: 1,
  begin_time: begin_date,
  end_time: end_date,

  search_type: SearchType.SERIAL_NO,

  serial_no: '',
  customer_info: '',
  ssu_info: '',
  status: 0,
  sort_status: 0,
  print_status: Filters_Bool.ALL,

  driver_selected: [] as MoreSelectDataItem<string>[],
  route_selected: [] as MoreSelectDataItem<string>[],
  quotation_ids: [] as MoreSelectDataItem<string>[],
  category: [],

  receive_customer_id: '',
}

/**
 * 分拣列表的类，表示经过筛选后的分拣列表
 */
class Order {
  filter: Filter = { ...initFilter }

  list: List[] = []
  /** 保存原始的数据格式，用于更新 */
  originList: DetailList[] = []

  relation_info: OrderRelationInfoResponse & OrderRelationInfo = {}

  pagination: any = {}

  params: any = {}
  categoryMap: any = {}

  categoryData: DataNode[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /**
   * 初始化筛选条件
   */
  init() {
    this.filter = { ...initFilter }
  }

  /**
   * 重置筛选条件
   */
  reset() {
    this.init()
  }

  async fetchCategory() {
    const { categoryTreeData, categoryMap } = await fetchTreeData()
    this.categoryData = categoryTreeData
    this.categoryMap = categoryMap
  }

  /**
   * 根据筛选条件获取各种属性
   * @return {Object} 包含各种筛选属性的对象
   */
  getParams() {
    const { filter } = this
    const { begin_time, end_time, time_type } = filter

    const baseParams: CommonListOrder = {
      // 订单号
      serial_nos:
        filter.search_type === SearchType.SERIAL_NO && filter.serial_no
          ? [filter.serial_no]
          : undefined,
      // 商户信息
      customer_search_text:
        (filter.search_type === SearchType.CUSTOMER_INFO &&
          filter.customer_info) ||
        undefined,

      driver_ids: filter.driver_selected.map((v) => v.value),
      quotation_ids: filter.quotation_ids.map((v) => v.value) || undefined,
      states: filter.status
        ? [filter.status as number]
        : SORTING_STATUS_LIST.map((item) => item.value), // 全部的时候，也要过滤掉待分拣的
      is_print: filter.print_status,
      receive_customer_ids: [],
    }
    const params =
      time_type === 1
        ? {
            order_time_from_time: `${+begin_time}`,
            order_time_to_time: `${+end_time}`,
          }
        : {
            order_receive_from_time: `${+begin_time}`,
            order_receive_to_time: `${+end_time}`,
          }
    return { ...params, ...baseParams }
  }

  /**
   * 获取分拣列表
   * @param  {any}                                 params 获取列表的限制条件
   * @return {ListOrderDetailWithRelationResponse}        分拣列表的响应数据
   */
  fetchList(params?: any) {
    const { filter } = this
    const { category } = filter
    this.params = params
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
    return ListOrderDetailWithRelation({
      route_ids: this.filter.route_selected.map((v) => v.value),

      relation: {
        need_customer_route_info: true,
      },
      filter: {
        ...categorys,
        sorting_status: filter.sort_status ? [filter.sort_status] : undefined,
        common_list_order: this.getParams(),
        need_total_info: true,
        need_sorting_count_info: true,
        relation_info: {
          need_customer_info: true,
          need_driver_info: true,
          need_user_info: true,
          need_sku_info: true,
          need_quotation_info: true,
        },
        // 商品信息
        sku_q:
          filter.search_type === SearchType.SSU_INFO ? filter.ssu_info : '',
        // sort_by: [
        //   {
        //     field: ListOrderRequest_PagingField.ORDER_TIME,
        //     desc: true,
        //   },
        // ],
        ...params,
      },
    }).then((json) => {
      const data = json.response.response
      const relation = json.response.relation

      const customers = data?.relation_info?.customers
      const groupUsers = data?.relation_info?.group_users

      this.relation_info = { ...data?.relation_info, ...relation }
      this.originList = data?.details as DetailList[]

      this.list = (data?.details as DetailList[]).map((v) => {
        const order = v.order
        const detail = v.detail as OrderDetail

        const sku_snap = _.find(
          this.relation_info?.sku_snaps,
          (_, key) => key === detail?.sku_id + '_' + detail?.sku_revision,
        )

        const { order_unit_value_v2, sorting_quantity, unit_cal_info } = detail
        const units = unit_cal_info?.unit_lists
        const orderQuantityUnit = units?.find(
          (unit) => unit.unit_id === order_unit_value_v2?.quantity?.unit_id,
        )
        const weightQuantityUnit = units?.find(
          (unit) => unit.unit_id === sorting_quantity?.input?.unit_id,
        )
        const { texts } = getCategoryValue(
          [],
          [sku_snap?.category_id as string],
          this.categoryMap,
        )
        const category_name =
          texts.length > 1 ? texts.join('/') : texts.length ? texts[0] : ''

        return {
          customer: (
            customers as {
              [key: string]: Customer
            }
          )[order?.receive_customer_id as string],
          driver: (
            groupUsers as {
              [key: string]: GroupUser
            }
          )[order?.driver_id as string],
          // 线路
          _route:
            (!_.isEmpty(this.relation_info) &&
              (
                this.relation_info.routes as {
                  [key: string]: Route
                }
              )[
                (
                  this.relation_info.customer_routes as {
                    [key: string]: string
                  }
                )[order?.receive_customer_id as string]
              ]?.route_name) ||
            t('无'),

          _order_print_status: parseInt(order?.status as string),

          // 编辑状态
          editing: false,

          // 称重数
          weightQuantity: +(sorting_quantity?.input?.quantity as string) || 0,
          weightQuantityUnit: getOrderUnitName(
            undefined,
            weightQuantityUnit as Unit,
          ),
          // 下单数
          orderQuantity: order_unit_value_v2?.quantity?.val || '0',
          orderQuantityUnit: getOrderUnitName(
            undefined,
            orderQuantityUnit as Unit,
          ),

          categoryName: category_name,
          quotationName:
            this.getQuotation(order?.quotation_id as string) || '-',

          // 必须把detail放在order前面，因为他们都有state属性，需要用order的state覆盖掉detail的
          ...detail,
          sku: sku_snap,
          ...order,
        }
      })

      return json.response
    })
  }

  /** 更新称重数（更新个数量也太麻烦了吧 - -+）
   * @param  {string}  order_detail_id 订单ID
   * @param  {string}  quantity        计量单位
   * @return {Promise}                 更新称重数的请求
   */
  updateWeight(order_detail_id: string, quantity: string) {
    const orderDetail = _.find(
      this.originList,
      (item) => item.detail?.order_detail_id === order_detail_id,
    )
    if (orderDetail) {
      const sort = orderDetail?.detail?.sorting_quantity || {}

      // 更新数量要重新计算input和calculate
      const unitValue = {
        unit_id: sort?.input?.unit_id,
        quantity: quantity,
        price: sort?.input?.price,
      }

      sort.input = unitValue as UnitValue
    }

    return this.updateList(order_detail_id)
  }

  /**
   * 更新分拣列表
   * @param {string}                              id 分拣的ID
   * @param {Response<UpdateSortingTaskResponse>}    更新后的响应数据
   */
  updateList(id: string) {
    const sortingTasks = this.originList
      .map((l) => toJS(l.detail as OrderDetail))
      .find((l) => l.order_detail_id === id)
    if (!sortingTasks) {
      return Promise.reject(new Error('找不到任务id'))
    }
    return UpdateSortingTask({
      sorting_tasks: [sortingTasks],
      op_type: OpType.SETWEIGHT,
    }).then((res) => {
      if (res.response?.sorting_conflict) {
        throw res
      }
      return res
    })
  }

  /**
   * 设置筛选条件的属性
   * @param {T}         field 筛选的属性
   * @param {Filter[T]} value 属性的值
   */
  setFilter<T extends keyof Filter>(field: T, value: Filter[T]) {
    this.filter[field] = value
  }

  /**
   * 导出绩效
   * @return {Promise} 导出绩效的请求
   */
  exportSortingPerformance() {
    return ExportSortingPerformance({
      filter: this.getParams(),
    })
  }

  // -------------------------- 一些工具函数 ---------------------------------

  /**
   * 更新编辑状态
   * @param {List}    data 分拣的列表
   * @param {boolean} bool 编辑状态，true表示正在编辑，false表示不在编辑
   */
  @action
  updateEditing(data: List, bool: boolean) {
    data.editing = bool
  }

  /**
   * 更新列表项目的值
   * @param {number} index 列表项目的编号
   * @param {T}      key   项目的属性
   * @param {any}    value 项目属性的值
   */
  @action
  updateListItem<T extends keyof List>(index: number, key: T, value: any) {
    this.list[index][key] = value
  }

  // /**
  //  * 获取sku分类，默认格式 x/x/x
  //  * @param  {string}   skuId  sku的ID
  //  * @param  {Function} format 格式化的函数
  //  * @return {any}             格式化后的sku分类
  //  */
  // getCategory(skuId: string, format?: (c: CategoryInfo[]) => any) {
  //   if (!format) {
  //     format = (cts) => cts.map((c) => c.category_name).join('/')
  //   }
  //   const categoryInfo =
  //     (
  //       this.relation_info.skus as {
  //         [key: string]: GetManySkuResponse_SkuInfo
  //       }
  //     )[skuId].category_infos || []
  //   return format(categoryInfo)
  // }

  /**
   * 根据报价单id获取报价单，默认返回名称
   * @param  {string}   quotationId 报价单ID
   * @param  {Function} format      格式化的函数
   * @return {any}                  格式化后的报价单
   */
  getQuotation(quotationId: string, format?: (q: Quotation) => any) {
    if (!format) {
      format = (q) => q.inner_name
    }

    const quotationInfo =
      (
        this.relation_info.quotations as {
          [key: string]: Quotation
        }
      )[quotationId] || {}
    return format(quotationInfo)
  }

  /**
   * 计算单位转换后的数量
   * @param  {UnitValueSet} unitSet 计算单位集合
   * @param  {any}          parse   转换的函数
   * @return {any}                  转换后的数量，base=计量，pack=包装（base前期命名错了，懒得改，知道就行）
   * quantity 是计量数量还是包装数量需要计算才能知道，虽然现在一定是包装单位
   */
  getUnitNumber(unitSet: UnitValueSet, parse: any) {
    const quantity = +(unitSet.input?.quantity as string) || 0
    const base = unitSet?.input?.unit_id === parse.ssu_unit_parent_id // 判断quantity的单位
    const rate = parse.ssu_unit_rate || 1

    if (base) {
      return {
        base: quantity,
        pack: +toFixedOrder(Big(quantity).div(rate || 1)),
      }
    } else {
      return {
        base: +toFixedOrder(Big(quantity).times(rate || 1)),
        pack: quantity,
      }
    }
  }

  exportSortingSheet() {
    const { filter } = this
    const { category } = filter
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
    const request = {
      route_ids: filter.route_selected.map((v) => v.value),

      filter: {
        ...categorys,
        sorting_status: filter.sort_status ? [filter.sort_status] : undefined,
        common_list_order: this.getParams(),
        need_total_info: true,
        need_sorting_count_info: true,
        // 商品信息
        sku_q:
          filter.search_type === SearchType.SSU_INFO ? filter.ssu_info : '',
        sort_by: [
          {
            field: ListOrderRequest_PagingField.ORDER_TIME,
            desc: true,
          },
        ],
        ...this.params,
      },
    }
    return ExportSortingSheet({ filter: request })
  }
}

export default new Order()
