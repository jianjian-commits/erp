import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { t } from 'gm-i18n'
import {
  GetSettleSheetDetail,
  PaySettle,
  ListAccountBalance,
  AccountType,
  AccountBalance,
  UpdateSettleSheet,
  SettleSheet_SheetStatus,
  SettleSheet,
} from 'gm_api/src/finance'
import { Customer } from 'gm_api/src/enterprise'
import {
  SettlementOptions,
  DetailOptions,
  DetailListOptions,
  TransactionFlowOptions,
} from './interface'
import { Tip, Modal } from '@gm-pc/react'

class Store {
  // 头部
  settle_sheet: DetailOptions = {
    company: '',
    settle_sheet_id: '',
    total_price: '', // 总金额
    need_amount: '', // 待结款
    actual_amount: '', // 已结款
    create_time: '',
    settle_sheet_serial_no: '',
    abstract: '',
    sheet_status: 0,
    credit_type: 0,
  }

  // 订单列表
  detail_list: DetailListOptions[] = []

  // 交易流水
  flow_list: TransactionFlowOptions[] = []

  customer_info: Customer = {
    customer_id: '',
    name: '',
    settlement: {
      china_vat_invoice: {
        financial_contact_name: '',
        financial_contact_phone: '',
      },
    },
  }

  // 结款
  settlement: SettlementOptions = {
    remark: '',
    settle_amount: '',
    arrival_serial_no: '',
    recharge_amount: '',
    is_recharge_amount: '', // 用于校验使用
  }

  account_balance = 0

  receiptLoading = false

  send_account_balance: AccountBalance = {
    account_balance_id: '',
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  doRequest = () => {
    console.log('doRequest')
  }

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  updateSettlement<T extends keyof SettlementOptions>(
    key: T,
    value: SettlementOptions[T],
  ) {
    this.settlement[key] = value
  }

  changeReceiptDetail<T extends keyof DetailOptions>(
    name: T,
    value: DetailOptions[T],
  ) {
    this.settle_sheet[name] = value
  }

  // 获取对账单明细
  fetchSettleSheetDetail(settle_sheet_id: string) {
    return GetSettleSheetDetail({ settle_sheet_id }).then((json) => {
      const {
        customer,
        settle_sheet,
        orders,
        relation_group_users,
        relation_customer,
      } = json.response
      this.settle_sheet = {
        ...settle_sheet!,
        company: customer?.name! || '',
      }

      this.detail_list = _.map(orders, (it) => {
        return {
          ...it,
          customer: relation_customer![it?.receive_customer_id!]?.name!,
        }
      })

      this.flow_list = _.map(json?.response?.transaction_flows!, (item) => {
        return {
          ...item,
          creator_name: relation_group_users![item.creator_id!]?.name!,
        }
      })

      this.customer_info = Object.assign({}, customer)
      return json
    })
  }

  // 余额
  fetchListAccountBalance(target_id: string) {
    return ListAccountBalance({
      target_id,
      paging: { limit: 999 },
    }).then((json) => {
      const { account_balances } = json.response
      if (account_balances.length) {
        this.account_balance = Number(account_balances!.reverse()[0].balance!)
        this.send_account_balance = account_balances![0]
      }
      return json.response
    })
  }

  // 结款
  paySettle(data) {
    const req = {
      settle_sheet: _.omit(this.settle_sheet, ['company']),
      account_balance: this.send_account_balance,
      account_type: AccountType.ACCOUNT_TYPE_CUSTOMER,
      settle_amount: data.settle_amount || undefined,
      arrival_serial_no: data.arrival_serial_no || undefined,
      recharge_amount: data.recharge_amount || undefined,
      remark: data.remark || undefined,
    }

    return PaySettle(req).then((json) => {
      const { settle_sheet } = json.response
      this.clear()
      if (settle_sheet) {
        this.fetchSettleSheetDetail(settle_sheet?.settle_sheet_id!)
        Modal.hide()
        this.doRequest()
        Tip.success(t('结款成功'))
      }
      return json
    })
  }

  // 更新
  updateSettleSheet(settle_sheet: SettleSheet) {
    const req = {
      settle_sheet: settle_sheet,
      new_sheet_status: SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID,
    }
    return UpdateSettleSheet(req)
  }

  writeOffSettleSheet(index: number) {
    const req = {
      settle_sheet: _.omit(this.settle_sheet, ['company']),
      new_sheet_status: SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID,
      transaction_flow: _.omit(this.flow_list[index], ['creator_name']),
    }

    return UpdateSettleSheet(req).then((json) => {
      const { settle_sheet } = json.response
      if (settle_sheet) {
        this.fetchSettleSheetDetail(settle_sheet?.settle_sheet_id!)
        this.doRequest()
        Tip.success(t('冲账成功'))
      }
      return json
    })
  }

  updatePaidReceipt(status: SettleSheet_SheetStatus) {
    const data = {
      settle_sheet: _.omit(this.settle_sheet, ['company']),
      new_sheet_status:
        status === SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED
          ? SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED
          : status,
    }

    return UpdateSettleSheet(data)
  }

  async doSomeAndGetDetail(doFunc: () => Promise<unknown>) {
    this.changeReceiptLoading(true)

    await doFunc().catch((err) => {
      this.changeReceiptLoading(false)
      throw Promise.reject(new Error(err))
    })
    const { settle_sheet_id } = this.settle_sheet
    return this.fetchSettleSheetDetail(settle_sheet_id)
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch((err) => {
        this.changeReceiptLoading(false)
      })
  }

  clear() {
    this.settlement = {
      remark: '',
      settle_amount: '',
      arrival_serial_no: '',
      recharge_amount: '',
      is_recharge_amount: '',
    }
  }
}

export default new Store()
