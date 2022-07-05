import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Tip, Modal } from '@gm-pc/react'
import { getTimestamp } from '@/common/util'
import {
  FilterOptions,
  OrderInfo,
  levelList,
  ScanSearchType,
} from './interface'
import { t } from 'gm-i18n'
import { Role_Type, ListGroupUser } from 'gm_api/src/enterprise'
import {
  ListOrder,
  ListOrderRequest_PagingField,
  CommonListOrder,
  UpdateOrder,
  UpdateOrderStatus,
  Order,
  GetOrder,
  Order_Status,
} from 'gm_api/src/order'
import {
  ListSettleSheet,
  CreateSettleSheet,
  AccountType,
  CreateSettleSheetRequest_OperateType,
  SettleSheet,
  Status_Code,
  TimeType,
  SettleSheet_SheetStatus,
} from 'gm_api/src/finance'
import { Filters_Bool, PagingResult } from 'gm_api/src/common'
import { CreditTypeMap } from './enum'
import { BatchScanReceipt } from 'gm_api/src/orderlogic'
import globalStore from '@/stores/global'

const initFilter: FilterOptions = {
  status: 0,
  pay_status: 0,
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  dateType: 1,
  is_out_stock: '',
  serial_no: '',
  receive_customer_id: '',
  app_id: '',
  service_period_id: '',
  customers: [],
  sale_menus: [],
  has_remark: '',
  sort_remark: '',
  drivers: [],
  is_create_stock_sheet: Filters_Bool.ALL,
  is_scan_receipt: Filters_Bool.ALL,
}

class Store {
  filter: FilterOptions = {
    ...initFilter,
  }

  // 订单列表
  list: OrderInfo[] = []
  paging: PagingResult = { count: 0 }

  // 对账单列表
  settlement_list: SettleSheet[] = []

  selected: string[] = []

  cityList = [] // 城市
  driverList: levelList[] = [] // 司机

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initFilter() {
    this.filter = { ...initFilter }
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  updateFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
  }

  getSearchData() {
    const { filter } = this
    const { begin, end, dateType } = filter
    const appOp = filter.app_id.split('_')
    const baseParams: CommonListOrder = {
      serial_nos: filter.serial_no ? [filter.serial_no] : undefined,
      states: filter.status ? [filter.status as number] : undefined,
      customer_search_text: filter.receive_customer_id || undefined,
      receive_customer_ids: filter.customers.map((v) => v.value),
      driver_ids: filter.drivers.map((v) => v.value),
      pay_states: filter.pay_status ? [filter.pay_status as number] : undefined,
      quotation_ids: filter.sale_menus.map((v) => v.value) || undefined,
      app_types: appOp[0] ? [appOp[0]] : undefined,
      order_op: appOp[1] ? [appOp[1]] : undefined,
      is_out_stock: filter.is_out_stock
        ? filter.is_out_stock === '1'
          ? Filters_Bool.TRUE
          : Filters_Bool.FALSE
        : undefined,
      service_period_id: undefined,
      sorting_remark: filter.sort_remark || undefined,
      is_remark: filter.has_remark
        ? filter.has_remark === '1'
          ? Filters_Bool.TRUE
          : Filters_Bool.FALSE
        : undefined,
      is_create_stock_sheet: this.filter.is_create_stock_sheet,
      is_scan_receipt: filter.is_scan_receipt,
    }

    const params =
      dateType === 1
        ? {
            order_time_from_time: `${+begin}`,
            order_time_to_time: `${+end}`,
          }
        : dateType === 2
        ? {
            order_receive_from_time: `${+begin}`,
            order_receive_to_time: `${+end}`,
          }
        : {
            order_outstock_from_time: `${+begin}`,
            order_outstock_to_time: `${+end}`,
          }
    return { ...params, ...baseParams }
  }

  fetchOrderList(params?: any) {
    const commonQueryParams = this.getCommonQueryParams()
    return ListOrder(
      Object.assign(
        {
          need_not_settle: true,
          // common_list_order: this.getSearchData(),
          // need_total_info: true,
          // relation_info: {
          //   need_customer_info: true,
          //   need_driver_info: true,
          //   need_user_info: true,
          // },
          // sort_by: [
          //   {
          //     field: ListOrderRequest_PagingField.ORDER_TIME,
          //     desc: true,
          //   },
          // ],
        },
        commonQueryParams,
        {
          paging: { ...params.paging },
        },
      ),
    ).then((json) => {
      const { relation_info } = json.response
      const customers = relation_info?.customers || {}
      const groupUsers = relation_info?.group_users || {}
      this.list = (json.response.orders || []).map((v) => ({
        ...v,
        editing: false,
        company: customers![v.customer_id_l1!]?.name!,
        customer: customers![v.receive_customer_id!]?.name!,
        creator: groupUsers[v.creator_id!],
        driver: groupUsers[v.driver_id!],
        tempStateFe: v.state as number,
        credit_type:
          CreditTypeMap[customers![v.receive_customer_id!]?.credit_type!],
        customer_label:
          relation_info?.customer_label![
            relation_info?.customer_label_relation![v.receive_customer_id!]
              ?.values![0]!
          ]?.name!,
      }))
      this.paging = json.response.paging
      return json.response
    })
  }

  // 已有的对账单列表
  fetchAlreadyExistSettlement(isSelectAll: boolean, customer_id?: string) {
    const req = {
      paging: { limit: 999 },
      account_type: AccountType.ACCOUNT_TYPE_CUSTOMER,
      begin_time: getTimestamp(
        moment().startOf('day').add(-29, 'days').toDate(),
      )!, // 搜索30天内有无已存在的结款单据
      end_time: getTimestamp(moment().endOf('day').toDate())!,
      time_type: TimeType.TIME_TYPE_CREATE_TIME,
      sheet_status: [
        SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED,
        SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED,
      ], // 拉取 2已提交未结款 和 5审核不通过
    }
    this.handleBatchParams(req, isSelectAll, {
      target_id: customer_id,
    })
    return ListSettleSheet(req, [Status_Code.CODE_DIFFERENT_SUBJECT]).then(
      (json) => {
        if (json.code === Status_Code.CODE_DIFFERENT_SUBJECT) {
          Tip.danger(t('只有相同的商户单据才能加入对账单'))
          throw Promise.reject(new Error(t('只有相同的商户单据才能加入对账单')))
        } else {
          this.settlement_list = json.response.settle_sheets
        }
        return json
      },
    )
  }

  // 加入已有的对账单
  addInExistSettlement(
    isSelectAll: boolean,
    settleSelectedId: string,
    selected?: string[],
  ) {
    const req = {
      operate_type:
        CreateSettleSheetRequest_OperateType.OPERATE_TYPE_JOIN_SHEET,
      account_type: AccountType.ACCOUNT_TYPE_CUSTOMER,
      join_settle_sheet: _.filter(
        this.settlement_list,
        (item) => item.settle_sheet_id === settleSelectedId,
      )[0],
    }
    this.handleBatchParams(req, isSelectAll, { item_ids: selected })
    // console.warn(
    //   'createSettleSheet',
    //   isSelectAll,
    //   settleSelectedId,
    //   selected,
    //   req,
    // )

    return CreateSettleSheet(req).then((json) => {
      Tip.success(t('加入对账单成功'))
      return json
    })
  }

  // 批量加入对账单
  createSettleSheet(isSelectAll: boolean, stock_sheet_ids?: string[]) {
    const req = {
      account_type: AccountType.ACCOUNT_TYPE_CUSTOMER,
      operate_type:
        CreateSettleSheetRequest_OperateType.OPERATE_TYPE_CREATE_SHEET,
    }
    this.handleBatchParams(req, isSelectAll, { item_ids: stock_sheet_ids })
    return CreateSettleSheet(req).then((json) => {
      Tip.success(t('加入对账单'))
      return json
    })
  }

  setSelected(selected: string[]) {
    this.selected = selected
  }

  fetchDriverList() {
    const req = {
      paging: { limit: 99 },
      role_types: [Role_Type.BUILT_IN_DRIVER], // 这里的请求参数待确认
      need_distribution_contractor: true,
    }
    ListGroupUser(req).then((json) => {
      const driver = _.map(json.response.group_users, (item) => {
        return {
          text: item.name,
          value: item.group_user_id,
        }
      })
      this.driverList = driver
      return json.response
    })
  }

  batchChangeRecieptStatus(
    isSelectAll: boolean,
    selected: string[],
    status: Filters_Bool,
  ) {
    const req = {
      is_scan_receipt: status,
    }
    this.handleBatchParams(req, isSelectAll, { order_ids: selected })
    return BatchScanReceipt(req).then((json) => {
      Modal.hide()
      Tip.success('数据处理中,请在任务栏查看进度！')
      globalStore.showTaskPanel('1')
      return json
    })
  }

  changeReceiptStatus: ScanSearchType = (serial_no, afterFunc) => {
    GetOrder({ serial_no }).then(
      async (res) => {
        const order: Order = res.response.order
        if (+order.status! === Order_Status.STATUS_IS_SIGNED) {
          Tip.danger(t('该订单已回单'))
          return
        }
        const updateRes = await UpdateOrderStatus({
          order_id: order.order_id,
          status_add: Order_Status.STATUS_IS_SIGNED,
          status_sub: Order_Status.STATUS_IS_SIGNED,
        })
        this.doRequest()
        // eslint-disable-next-line promise/always-return
        if (updateRes.code === 0) {
          afterFunc(true)
        }
      },
      () => afterFunc(false),
    )
  }

  handleBatchParams(
    params: object = {},
    isSelectAll: boolean,
    elseParams: object = {},
  ): void {
    if (isSelectAll) {
      Object.assign(params, {
        order_list_query: this.getCommonQueryParams(),
      })
    } else {
      Object.assign(params, elseParams)
    }
  }

  getCommonQueryParams() {
    return {
      common_list_order: this.getSearchData(),
      need_total_info: true,
      relation_info: {
        need_customer_info: true,
        need_driver_info: true,
        need_user_info: true,
      },
      sort_by: [
        {
          field: ListOrderRequest_PagingField.ORDER_TIME,
          desc: true,
        },
      ],
      paging: { limit: 999 },
    }
  }
}

export default new Store()
