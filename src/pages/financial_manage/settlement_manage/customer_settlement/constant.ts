import { t } from 'gm-i18n'
import { App_Type, Filters_Bool } from 'gm_api/src/common'
import {
  BillOrderInfo,
  BillOrder_PayAndAfterState,
  BillOrder_Type,
} from 'gm_api/src/finance'
import { Order_OrderOp } from 'gm_api/src/order'
import moment from 'moment'
import { DetailHeaderForm, F } from './interface'

export enum Business_Type {
  All,
  SALE,
  AFTER_SALE,
}

export enum AllSelect_Types {
  ALL_COMPANY = 1,
  ALL_CUSTOMER,
}

export const dataSource: BillOrderInfo[] = [
  {
    bill_order_id: `${Math.random() * 10000}`,
    order_no: '123',
    customer_name: '老王',
    customer_id: 'aaaaaa',
    company_name: '公司1',
    order_time: Date.now().toString(),
    type: 1,
    pay_after_state: 1,
    outstock_price: '232',
    paid_amount: '323',
    non_pay_amount: '2323',
    order_after_sale_price: '3232',
    relation_bill_orders: [
      {
        bill_order_id: `${Math.random() * 10000}`,
        order_no: '456',
        customer_name: '老张',
        customer_id: 'ccccc',
        company_name: '公司1',
        order_time: Date.now().toString(),
        type: 1,
        pay_after_state: 1,
        outstock_price: '232',
        paid_amount: '323',
        non_pay_amount: '2323',
        order_after_sale_price: '3232',
      },
    ],
  },
  {
    bill_order_id: `${Math.random() * 10000}`,
    order_no: '456',
    customer_name: '老张',
    customer_id: 'bbbbb',
    company_name: '公司2',
    order_time: Date.now().toString(),
    type: 1,
    pay_after_state: 1,
    outstock_price: '232',
    paid_amount: '323',
    non_pay_amount: '2323',
    order_after_sale_price: '3232',
  },
]

export const dataSource4Detail: BillOrderInfo[] = [
  {
    bill_order_id: `${Math.random() * 10000}`,
    order_no: '123',
    customer_name: '老王',
    company_name: '公司1',
    order_time: Date.now().toString(),
    type: 1,
    pay_after_state: 1,
    outstock_price: '232',
    paid_amount: '323',
    non_pay_amount: '2323',
    order_after_sale_price: '3232',
    relation_bill_orders: [
      {
        bill_order_id: `${Math.random() * 10000}`,
        order_no: '456',
        customer_name: '老张',
        company_name: '公司2',
        order_time: Date.now().toString(),
        type: 1,
        pay_after_state: 1,
        outstock_price: '232',
        paid_amount: '323',
        non_pay_amount: '2323',
        order_after_sale_price: '3232',
      },
    ],
  },
  {
    bill_order_id: `${Math.random() * 10000}`,
    order_no: '456',
    customer_name: '老张',
    company_name: '公司2',
    order_time: Date.now().toString(),
    type: 1,
    pay_after_state: 1,
    outstock_price: '232',
    paid_amount: '323',
    non_pay_amount: '2323',
    order_after_sale_price: '3232',
  },
]

/**
 * filter初始值
 */
export const initFilter: F = {
  pay_after_state: 0,
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  dateType: 1,
  serial_no: '',
  is_scan_receipt: Filters_Bool.ALL,
  customize_type_ids: [],
  order_op: Order_OrderOp.ORDEROP_UNSPECIFIED,
  app_type: App_Type.TYPE_STATION,
  resource: '',
  state: 0,
  receive_customer_ids: [],
  type: BillOrder_Type.TYPE_UNSPECIFIED,
}

// const businessType = {
//   [Business_Type.SALE]: t('销售订单'),
//   [Business_Type.AFTER_SALE]: t('售后订单'),
// }

export const businessTypeSelectData = [
  { value: Business_Type.All, text: t('全部类型') },
  { value: Business_Type.SALE, text: t('销售订单') },
  { value: Business_Type.AFTER_SALE, text: t('售后订单') },
]

export const businessTypeMap: { [key: string]: string } = {
  [Business_Type.All]: t('全部类型'),
  [Business_Type.SALE]: t('销售订单'),
  [Business_Type.AFTER_SALE]: t('售后订单'),
}

export const detailHeaderForm: DetailHeaderForm = {
  company_name: '张三的公司',
  pay_type: 1,
  settle_time: moment(),
  total_price: 0,
  customize_settle_voucher: '',
}

export const datePickerTypes = [
  {
    type: 1,
    name: t('按下单日期'),
    expand: false,
  },
  {
    type: 2,
    name: t('按收货日期'),
    expand: false,
  },
  {
    type: 3,
    name: t('按出库日期'),
    expand: false,
    limit: (date: Date) => {
      return moment(date) > moment().add(30, 'day').endOf('day')
    },
  },
]

export enum Is_Batch {
  Batch,
  UnBatch,
}

export const abolishedPayStatus = [
  BillOrder_PayAndAfterState.PAYSTATE_REFUND,
  BillOrder_PayAndAfterState.PAYSTATE_CLOSED,
  BillOrder_PayAndAfterState.STATUS_TO_SUBMIT,
  BillOrder_PayAndAfterState.STATUS_TO_REVIEWED,
  BillOrder_PayAndAfterState.STATUS_TO_RETURNED,
]
