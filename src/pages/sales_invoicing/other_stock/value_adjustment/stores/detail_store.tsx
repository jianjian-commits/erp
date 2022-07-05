import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { GetAdjustSheet } from 'gm_api/src/inventory'
import { AdjustSheet, AdjustSheet_Detail } from 'gm_api/src/inventory/types'

import {
  getAdjustAdditional,
  handleCreator,
} from '@/pages/sales_invoicing/util'
import { RECEIPT_TYPE } from '@/pages/sales_invoicing/enum'

class Store {
  headDetail: AdjustSheet = { adjust_sheet_id: '', details: {} }

  adjustList: AdjustSheet_Detail[] = []

  type: string = ''

  sheetList = [
    {
      text: 'stockIn',
      value: [
        RECEIPT_TYPE.purchaseIn,
        RECEIPT_TYPE.productIn,
        RECEIPT_TYPE.materialIn,
        RECEIPT_TYPE.saleRefundIn,
        RECEIPT_TYPE.otherIn,
      ],
    },
    {
      text: 'stockOut',
      value: [
        RECEIPT_TYPE.saleOut,
        RECEIPT_TYPE.materialOut,
        RECEIPT_TYPE.purchaseRefundOut,
        RECEIPT_TYPE.otherOut,
        // RECEIPT_TYPE.unspecified,
      ],
    },
  ]

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.headDetail = { adjust_sheet_id: '' }
    this.adjustList = []
    this.type = ''
  }

  fetchAdjustSheet({ adjust_sheet_id }: { adjust_sheet_id: string }) {
    const req = Object.assign({ adjust_sheet_id }, { with_additional: true })
    return GetAdjustSheet(req).then((json) => {
      const { adjust_sheet, additional } = json.response
      this.headDetail = Object.assign(adjust_sheet, {
        creator_name: handleCreator(
          additional?.group_users,
          adjust_sheet.creator_id!,
          'username',
        ),
      })
      this.adjustList = getAdjustAdditional(adjust_sheet.details!, additional!)!
      this.judgeInOut()
      return json.response
    })
  }

  judgeInOut() {
    const { stock_sheet_type } = this.headDetail
    this.type = _.find(this.sheetList, ({ value }) =>
      _.includes(value, stock_sheet_type),
    )?.text!
  }
}
export default new Store()
