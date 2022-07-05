import { toFixedOrder } from '@/common/util'
import item from '@gm-pc/react/src/component/tree/item'
import Big from 'big.js'
import { PagingParams } from 'gm_api/src/common'
import {
  BillOrder,
  BillOrderInfo,
  BillOrder_PayAndAfterState,
  BillOrder_Type,
  CreateCustomerSettleSheet,
  CreateCustomerSettleSheetRequest,
  ListBillOrderBySettle,
  ListSettleBill,
  ListSettleBillRequest,
} from 'gm_api/src/finance'
import _, { rest } from 'lodash'
import { makeAutoObservable, toJS } from 'mobx'
import React from 'react'
import {
  AllSelect_Types,
  Business_Type,
  detailHeaderForm,
  initFilter,
  Is_Batch,
} from './constant'
import { DetailHeaderForm, F, Total } from './interface'

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter = initFilter

  // -----------------------客户结款-------------------------------------

  dataSource: BillOrderInfo[] = []

  setDataSource(dataSource: BillOrderInfo[]) {
    this.dataSource = dataSource
  }

  getParams() {
    const {
      begin,
      end,
      dateType,
      resource,
      receive_customer_ids,
      customize_type_ids,
      ...rest
    } = this.filter
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
    return {
      ...params,
      ...rest,
      app_type: resource ? resource.split('_')[0] : undefined,
      order_op: resource ? resource.split('_')[1] : undefined,
      receive_customer_ids: receive_customer_ids.map((item) => item.value),
      customize_type_ids: customize_type_ids.map((item) => item.value),
    }
  }

  fetchList(isResetCurrent?: boolean) {
    const params = this.getParams()
    if (isResetCurrent) {
      this.pagination.offset = 0
      this.setPaging({ pageSize: this.pagination.limit, current: 1 })
    }
    ListBillOrderBySettle({
      list_bill_order_filter: params,
      paging: this.pagination,
    }).then((res) => {
      this.setDataSource(
        res.response.bill_order_infos?.map((item) => {
          return {
            ..._.omit(item, 'relation_bill_orders'),
            ...(item.relation_bill_orders?.length! > 0
              ? {
                  relation_bill_orders: item.relation_bill_orders?.map(
                    (item2) => ({
                      ..._.omit(item2, 'relation_bill_orders'),
                    }),
                  ),
                }
              : {}),
          }
        }) || [],
      )
      /** 后台业务上只有在第一页的时候，才会返回count */
      if (this.pagination.offset === 0) {
        this.count = Number(res.response.paging.count || '0')
      }
    })
  }

  // ----------------------复选相关--------------------------------------

  selectedRowKeys: React.Key[] = []

  selected: BillOrderInfo[] = []

  updateSelectedRowKeys(keys: React.Key[]) {
    this.selectedRowKeys = keys
  }

  updateSelected(selected: BillOrderInfo[]) {
    this.selected = selected
  }

  allSelectType: AllSelect_Types | undefined = undefined

  setAllSelectType(type: AllSelect_Types | undefined) {
    this.allSelectType = type
  }

  // ----------------------分页相关--------------------------------------
  count = 0

  pagination: PagingParams = { offset: 0, limit: 10, need_count: true }

  paging = { current: 1, pageSize: 10 }

  setPaging(paging: { current: number; pageSize: number }) {
    this.paging = paging
  }

  setPagination(pagination: PagingParams) {
    this.pagination = pagination
  }

  // -------------------------结款详情-----------------------------------
  maxTotalPrice = 0
  minTotalPrice = 0

  get total_waiting_sale_price() {
    const {
      total_after_sale_price = 0,
      total_outstock_price = 0,
      total_paid_price = 0,
    } = this.total
    return (
      +total_outstock_price! - +total_paid_price! - +total_after_sale_price!
    )
  }

  get total_unPay_price() {
    const { total_outstock_price = 0, total_paid_price = 0 } = this.total
    return +total_outstock_price! - +total_paid_price!
  }

  detailHeader: DetailHeaderForm = detailHeaderForm

  updateDetailHeader<K extends keyof DetailHeaderForm>(
    key: K,
    value: DetailHeaderForm[K],
  ) {
    this.detailHeader[key] = value
  }

  init() {
    this.filter = initFilter
    this.selectedRowKeys = []
    this.selected = []
    this.allSelectType = undefined
  }

  updateFilter<K extends keyof F>(field: K, newValue: F[K]) {
    this.filter[field] = newValue
  }

  dataSource4Detail: (BillOrder & { settle_price: string })[] = []

  setDataSource4Detail(dataSource: (BillOrder & { settle_price: string })[]) {
    this.dataSource4Detail = dataSource
  }

  updateDataSource4Detail<
    K extends keyof (BillOrder & { settle_price: string }),
  >(index: number, key: K, value: (BillOrder & { settle_price: string })[K]) {
    const target = this.dataSource4Detail.slice()
    target[index][key] = value
    this.dataSource4Detail = target
  }

  total: Total = {}

  setDataSource4DetailCount(index: number, count: number) {
    this.dataSource4Detail[index].settle_num = count
  }

  async fetchDetailList(isBatch: Is_Batch, bill_order_id?: string[]) {
    let dateParams = {}
    switch (this.filter.dateType) {
      case 1: {
        dateParams = {
          order_time_from_time: `${+this.filter.begin}`,
          order_time_to_time: `${+this.filter.end}`,
        }
        break
      }
      case 2: {
        dateParams = {
          order_receive_from_time: `${+this.filter.begin}`,
          ordeorder_receive_to_timer_time_to_time: `${+this.filter.end}`,
        }
        break
      }
      case 3: {
        dateParams = {
          order_outstock_from_time: `${+this.filter.begin}`,
          order_outstock_to_time: `${+this.filter.end}`,
        }
        break
      }
    }

    const params: ListSettleBillRequest =
      +isBatch === Is_Batch.Batch && this.allSelectType
        ? // todo 加日期筛选
          {
            customer_id: this.selected[0]?.customer_id,
            type: this.allSelectType,
            ...dateParams,
          }
        : {
            bill_order_ids:
              bill_order_id || this.selected.map((s) => s.bill_order_id),
            ...dateParams,
          }

    await ListSettleBill(params).then((res) => {
      this.dataSource4Detail = res.response.bill_orders?.map((item) => ({
        ...item,
        settle_price:
          item.type === BillOrder_Type.TYPE_AFTER_ORDER
            ? toFixedOrder(+item.order_after_sale_price!)
            : toFixedOrder(+item.outstock_price! - +item.paid_amount!),
      }))!
      this.total = _.omit(res.response, 'bill_orders')
      this.detailHeader.total_price = this.total_waiting_sale_price
      this.detailHeader.company_name =
        res.response.bill_orders?.[0]?.company_name || ''
      this.maxTotalPrice = _.reduce(
        this.dataSource4Detail,
        (pre, cur) => {
          return +Big(pre).plus(
            cur.type === BillOrder_Type.TYPE_SALE_ORDER && +cur.settle_price > 0
              ? +cur.settle_price
              : 0,
          )
        },
        0,
      )
      this.minTotalPrice = _.reduce(
        this.dataSource4Detail,
        (pre, cur) => {
          let curPrice = 0
          if (
            cur.type === BillOrder_Type.TYPE_SALE_ORDER &&
            +cur.settle_price < 0
          ) {
            curPrice = +cur.settle_price
          } else if (cur.type === BillOrder_Type.TYPE_AFTER_ORDER) {
            curPrice = -cur.settle_price
          } else {
            curPrice = 0
          }
          return Big(pre).plus(curPrice)
        },
        0,
      )
    })
  }

  async createCustomerSheet() {
    const params: CreateCustomerSettleSheetRequest = {
      settle_sheet: {
        settle_time: `${+this.detailHeader.settle_time}`,
        pay_type: this.detailHeader.pay_type,
        target_id: this.dataSource4Detail[0].company_id,
        total_price: `${this.detailHeader.total_price}`,
        customize_settle_voucher: this.detailHeader.customize_settle_voucher,
        settle_sheet_details: this.dataSource4Detail.map((detail) => {
          return {
            order_no: detail.order_no,
            order_id: detail.order_id,
            after_sale_no: detail.after_sale_no,
            type: detail.type,
            // todo
            pay_after_state:
              detail.type === BillOrder_Type.TYPE_AFTER_ORDER
                ? BillOrder_PayAndAfterState.STATUS_REFUNDED
                : BillOrder_PayAndAfterState.PAYSTATE_PAID,
            after_sale_order_id: detail.after_sale_order_id,
            customer_id: detail.receive_customer_id,
            order_time:
              detail.type === BillOrder_Type.TYPE_AFTER_ORDER
                ? detail.after_sale_create_time
                : detail.order_time,
            outstock_price: detail.outstock_price,
            paid_amount: detail.paid_amount,
            order_after_sale_price: detail.order_after_sale_price,
            settle_price: `${detail.settle_price || 0}`,
          }
        }),
      },
    }
    return CreateCustomerSettleSheet(params)
  }

  distributeSettlePrice() {
    /**
     * 金额按下单时间正序填充，下单日期早的订单优先结算；
     *（特殊逻辑：若售后订单是与销售订单关联的，结算该销售订单时，优先结算售后订单的退款额，再结算销售订单的未付额，若售后订单是独立存在的，则与销售订单一样，按时间顺序结算）
     */
    const { order_relation } = this.total
    /** 已结的被关联的售后单ids */
    const settledAfterSaleIds: string[] = []
    this.dataSource4Detail = _.map(this.dataSource4Detail, (item) => ({
      ...item,
      settle_price: '',
    }))
    let total = this.detailHeader.total_price || 0
    if (!total) return
    _.forEach(this.dataSource4Detail, (item, index) => {
      //   if (total >= 0) {
      if (item.type === BillOrder_Type.TYPE_SALE_ORDER) {
        if (
          order_relation?.[item.order_id!]?.after_sale_order_ids?.length! > 0
        ) {
          _.forEach(
            order_relation?.[item.order_id!]?.after_sale_order_ids,
            (a) => {
              if (settledAfterSaleIds.includes(a)) return false
              const targetIndex = _.findIndex(
                this.dataSource4Detail,
                (u) => u.after_sale_order_id === a,
              )
              // if (
              //   total >=
              //   +this.dataSource4Detail[targetIndex].order_after_sale_price!
              // ) {
              //   this.dataSource4Detail[targetIndex].settle_price = toFixedOrder(
              //     +this.dataSource4Detail[targetIndex].order_after_sale_price!,
              //   )
              //   total += +this.dataSource4Detail[targetIndex].settle_price
              //   settledAfterSaleIds.push(a)
              // } else {
              //   this.dataSource4Detail[targetIndex].settle_price =
              //     toFixedOrder(total)
              //   settledAfterSaleIds.push(a)
              //   total = 0
              //   return false
              // }
              if (total) {
                this.dataSource4Detail[targetIndex].settle_price = toFixedOrder(
                  +this.dataSource4Detail[targetIndex].order_after_sale_price!,
                )
                total += +this.dataSource4Detail[targetIndex].settle_price
                settledAfterSaleIds.push(a)
              }
            },
          )
        }
        if (total >= +item.outstock_price! - +item.paid_amount!) {
          this.dataSource4Detail[index].settle_price = toFixedOrder(
            +item.outstock_price! - +item.paid_amount!,
          )
          total -= +this.dataSource4Detail[index].settle_price
        } else {
          this.dataSource4Detail[index].settle_price = toFixedOrder(total)
          total = 0
          return false
        }
      } else {
        // 未关联销售单的售后单
        if (!settledAfterSaleIds.includes(item.after_sale_order_id!)) {
          if (total >= +item.order_after_sale_price!) {
            this.dataSource4Detail[index].settle_price = toFixedOrder(
              +item.order_after_sale_price!,
            )
            total = total + +this.dataSource4Detail[index].settle_price
          } else {
            this.dataSource4Detail[index].settle_price = toFixedOrder(total)
            total = 0
            return false
          }
        }
        // else {

        //   if (total) {
        //     this.dataSource4Detail[index].settle_price = toFixedOrder(
        //       +this.dataSource4Detail[index].order_after_sale_price!,
        //     )
        //     total += +this.dataSource4Detail[index].settle_price
        //     settledAfterSaleIds.push(item.after_sale_order_id!)
        //   }
        // }
      }
      //   }

      //   else {
      //     if (
      //       item.type === BillOrder_Type.TYPE_SALE_ORDER &&
      //       +item.outstock_price! - +item.paid_amount! < 0
      //     ) {
      //       if (total <= +item.outstock_price! - +item.paid_amount!) {
      //         this.dataSource4Detail[index].settle_price = toFixedOrder(
      //           +item.outstock_price! - +item.paid_amount!,
      //         )
      //         total -= +this.dataSource4Detail[index].settle_price
      //       } else {
      //         this.dataSource4Detail[index].settle_price = toFixedOrder(total)
      //         total = 0
      //         return false
      //       }
      //     } else if (item.type === BillOrder_Type.TYPE_AFTER_ORDER) {
      //       if (total <= -item.order_after_sale_price!) {
      //         this.dataSource4Detail[index].settle_price =
      //           item.order_after_sale_price!
      //         total += +this.dataSource4Detail[index].settle_price
      //       } else {
      //         this.dataSource4Detail[index].settle_price = toFixedOrder(total)
      //         total = 0
      //         return false
      //       }
      //     } else {
      //     }
      //   }
    })
    this.dataSource4Detail = this.dataSource4Detail.slice()
  }
}

export default new Store()
