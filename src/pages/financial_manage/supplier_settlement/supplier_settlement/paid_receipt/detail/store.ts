import {
  AccountType,
  GetSettleSheetDetail,
  PaySettle,
  SettleSheet,
  SettleSheet_SheetStatus,
  TransactionFlow,
  UpdateSettleSheet,
} from 'gm_api/src/finance'
import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import Big from 'big.js'
import type {
  PaidReceiptDetail,
  Discount,
  RelatedReceiptList,
} from './interface'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  receiptDetail: PaidReceiptDetail = {} as PaidReceiptDetail
  relatedReceiptList: RelatedReceiptList[] = []
  discountList: Discount[] = []
  transactionFlowList: TransactionFlow[] = []

  receiptLoading = false

  get totalDiscount() {
    let total = 0

    _.each(this.discountList, (item) => {
      if (+item.action === 1) {
        total = +Big(total).plus(item.money || 0)
      } else if (+item.action === 2) {
        total = +Big(total).minus(item.money || 0)
      }
    })

    return total
  }

  get shouldPay() {
    return +Big(this.receiptDetail.total_price ?? 0).plus(
      this.totalDiscount ?? 0,
    )
  }

  verifyReceipt() {
    if (this.shouldPay < 0) {
      Tip.danger(t('应付金额不能小于0'))
      return false
    }

    return true
  }

  changeReceiptDetail<T extends keyof PaidReceiptDetail>(
    name: T,
    value: PaidReceiptDetail[T],
  ) {
    this.receiptDetail[name] = value
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  addDiscountListItem(data: any) {
    this.discountList.push(data)
  }

  deleteDiscountListItem(index: number) {
    this.discountList.splice(index, 1)
  }

  fetchDetail(params: any) {
    return GetSettleSheetDetail({
      settle_sheet_id: params.settle_sheet_id,
    }).then((json) => {
      const supplier = json.response.supplier!
      this.receiptDetail = Object.assign(json.response.settle_sheet!, {
        supplier_delete_time: supplier.delete_time!,
        supplier_name: supplier.name,
        supplier_customized_code: supplier.customized_code!,
      })
      this.relatedReceiptList = json.response.stock_sheets!
      this.discountList = _.map(
        json.response.settle_sheet?.amount_discounts!.amount_discounts,
        (item) => {
          const operator_name =
            json.response.relation_group_users![item.creator_id!].username
          return {
            ...item,
            money: +item.discount_amount!,
            reason: item.discount_reason!,
            action: item.discount_type!,
            operator_name,
          }
        },
      )
      this.transactionFlowList = _.map(
        json.response.transaction_flows!,
        (item) => {
          return {
            ...item,
            creator_name:
              json.response.relation_group_users![item.creator_id!].username,
          }
        },
      )

      return json
    })
  }

  getPostSettleSheetData(): SettleSheet {
    const data: SettleSheet = _.omit(this.receiptDetail, [
      'supplier_name',
      'supplier_delete_time',
      'supplier_customized_code',
      'amount_discounts',
    ])
    data.delta_amount = '' + this.totalDiscount
    data.should_amount = '' + this.shouldPay
    data.amount_discounts = {}
    data.amount_discounts.amount_discounts = _.map(
      this.discountList,
      (item) => {
        return {
          create_time: item.create_time,
          creator_id: item.creator_id,
          amount_discount_id: item.amount_discount_id,
          discount_reason: item.reason,
          discount_type: item.action,
          discount_amount: '' + item.money,
          remark: item.remark,
        }
      },
    )

    return data
  }

  updatePaidReceipt(status: SettleSheet_SheetStatus) {
    const data = {
      settle_sheet: this.getPostSettleSheetData(),
      new_sheet_status:
        status === SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED
          ? SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED
          : status,
    }

    if (!this.verifyReceipt()) {
      return Promise.reject(new Error('校验不通过'))
    }

    return UpdateSettleSheet(data)
  }

  async doSomeAndGetDetail(doFunc: () => Promise<unknown>) {
    this.changeReceiptLoading(true)

    await doFunc().catch((err) => {
      this.changeReceiptLoading(false)
      throw Promise.reject(new Error(err))
    })

    return this.fetchDetail({
      settle_sheet_id: this.receiptDetail.settle_sheet_id,
    })
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
  }

  signSettle(data) {
    return PaySettle({
      settle_sheet: this.getPostSettleSheetData(),
      account_type: AccountType.ACCOUNT_TYPE_SUPPLIER,
      settle_amount: '' + data.money,
      arrival_serial_no: data.code,
      remark: data.remark,
    })
  }
}

export default new Store()
