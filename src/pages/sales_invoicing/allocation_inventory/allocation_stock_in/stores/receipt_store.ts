import { makeAutoObservable, toJS } from 'mobx'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'
import {
  Batch_BatchType,
  GetStockSheet,
  GetStockSheetResponse,
  Additional,
  UpdateStockSheet,
  StockSheet_TargetType,
} from 'gm_api/src/inventory'
import type { Shelf } from 'gm_api/src/inventory'
import { formatDataToTree, guid, isValid, sortByMultiRule } from '@/common/util'
import {
  defaultProductDetail,
  defaultReceiptDetail,
} from '@/pages/sales_invoicing/receipt_base_data'
import {
  formatSkuList,
  getDisabledShelfData,
  getSuccessTip,
  getSalesInvoicingSheetData,
  getStockSheetData,
} from '@/pages/sales_invoicing/util'
import {
  RECEIPT_TYPE,
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
} from '@/pages/sales_invoicing/enum'
import type {
  SalesInvoicingSheet,
  ReceiptStatusKey,
} from '@/pages/sales_invoicing/interface'
import { getInfoByArgs } from '@/pages/sales_invoicing/allocation_inventory/util'
import type { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'

export type PDetail = SalesInvoicingSheet.StockInProductDetail

export interface RDetail
  extends Omit<SalesInvoicingSheet.StockInReceiptDetail, 'details'> {
  details: PDetail[]
}

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  shelf_selected: [],
  type: Batch_BatchType.BATCH_TYPE_CONST,
}

const initReceiptDetail: RDetail = {
  ...defaultReceiptDetail,
  details: [{ ...initProductDetail }],
  target_type: StockSheet_TargetType.SHEET_TARGET_TYPE_SUPPLIER,
  sheet_type: RECEIPT_TYPE.purchaseIn, // 采购入库
}
class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  allShelfResponse: Shelf[] = [
    {
      shelf_id: '0',
      create_time: '0',
      update_time: '0',
      delete_time: '0',
      group_id: '0',
      station_id: '0',
      parent_id: '0',
      name: t('未分配'),
      remark: '',
      is_leaf: true,
    },
  ]

  shelfList = []
  receiptLoading = false
  receiptDetail: RDetail = { ...initReceiptDetail }
  productDetails: PDetail[] = [{ ...initProductDetail }]
  additional: Additional = {}
  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  get canEdit() {
    // 用来判断当前状态是否可以编辑
    const { sheet_status } = this.receiptDetail
    if (sheet_status === 1 || sheet_status === 3 || sheet_status === 5) {
      return true
    }
    return false
  }

  get canSubmit() {
    const validFn = (product: PDetail) =>
      !isValid(product?.input_stock?.input?.quantity)
    // 商品是否填写完整
    const isFinished = this.productDetails.some(validFn)

    const isSecondUnit = this.productDetails.some(
      (item) =>
        item.second_base_unit_id !== '0' && !item.second_base_unit_quantity,
    )

    if (isFinished) {
      Tip.danger(t('请先完善商品明细'))
      return false
    }

    if (isSecondUnit) {
      Tip.danger(t('请填写入库数(辅助单位)后再提交'))
      return false
    }

    return true
  }

  getRelationInfo(k: keyof Additional, keyId?: string) {
    if (!this.additional) return {}
    const target = this.additional[k]
    return getInfoByArgs(target, keyId)
  }

  // 从additional里面获取table所对应需要的信息
  getTableColumnData<T extends keyof Additional>(
    kAddition: T,
    targetId: string,
  ) {
    const targetInfo = this.additional[kAddition]
    if (kAddition === 'skuinfos') {
      // 商品结构多层嵌套，需处理
      return targetInfo ? formatSkuList([targetInfo?.[targetId]]) : {}
    }
    return targetInfo?.[targetId]
  }

  fetchStockSheet(stock_sheet_id: string) {
    const req = {
      stock_sheet_id,
      with_additional: true,
    }
    return GetStockSheet(req)
  }

  adapterStockSheet(res: GetStockSheetResponse) {
    const { additional, stock_sheet } = res
    this.additional = additional
    const { in_warehouse_id } = stock_sheet
    // 保存shelfs，不另作请求保存数据
    this.fixShelf(additional.shelfs, in_warehouse_id)
    this.receiptDetail = {
      ...getSalesInvoicingSheetData(res, 'stockIn', {
        shelfList: this.allShelfResponse,
      }),
    }
    this.productDetails = this.receiptDetail.details.map((d) => {
      return {
        ...d,
        value: guid(),
      }
    })
  }

  fixShelf(shelfs: Record<string, Shelf> = {}, warehouse_id?: string) {
    this.allShelfResponse = _.concat(
      this.allShelfResponse,
      Object.values(shelfs!).filter(
        (shelf) => shelf.warehouse_id === warehouse_id,
      ),
    )

    this.shelfList = formatDataToTree(
      getDisabledShelfData(
        _.filter(this.allShelfResponse!, (item) => {
          return item.delete_time === '0'
        }),
      ),
      'shelf_id',
      'name',
    )
  }

  async updateReceipt(receiptAction: ReceiptStatusKey) {
    if (!this.canSubmit) {
      this.changeReceiptLoading(false)
      return Promise.reject(new Error())
    }
    this.receiptDetail.details = this.productDetails

    const keepStatus = ['notApproved', 'cancelApproval']
    let statusName: ReceiptStatusKey
    if (
      keepStatus.includes(
        RECEIPT_STATUS_KEY_NAME[this.receiptDetail.sheet_status],
      ) &&
      receiptAction === 'toBeSubmitted' // 驳回和反审下保存草稿保持原有状态
    ) {
      statusName = RECEIPT_STATUS_KEY_NAME[this.receiptDetail.sheet_status]
    } else {
      statusName = receiptAction
    }

    const data = getStockSheetData(this.receiptDetail, {
      type: 'stockIn',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    return UpdateStockSheet({
      stock_sheet: data,
      stock_sheet_id: this.receiptDetail.stock_sheet_id,
    }).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return json
    })
  }

  /**
   * 区分fetchStockSheet(这个不做adapter)，需要保证adapter依赖数据已经拉取到才用这个
   * @param sheet_id string
   */
  fetchAndAdapterStockSheet(sheet_id: string) {
    return this.fetchStockSheet(sheet_id).then((json) => {
      this.adapterStockSheet(json.response)
      return json
    })
  }

  /**
   * 更新以及重新获取数据,统一管理loading，防止单据异常操作
   * @param receiptAction 同updateStockSheet
   */
  async updateAndGetReceipt(receiptAction: ReceiptStatusKey) {
    this.changeReceiptLoading(true)
    await this.updateReceipt(receiptAction)

    return this.fetchAndAdapterStockSheet(
      this.receiptDetail.stock_sheet_id,
    ).finally(() => {
      this.changeReceiptLoading(false)
    })
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  // 修改productDetils
  changeDetailItem(index: number, changeData: Partial<PDetail>) {
    Object.assign(this.productDetails[index], { ...changeData })
  }

  // 修改基本信息
  changeReceiptDetail<T extends keyof RDetail>(key: T, value: RDetail[T]) {
    this.receiptDetail[key] = value
  }

  sortProductList({ sort_by, sort_direction }: SortItem) {
    let sortItem: SortItem = {} as SortItem
    if (!sort_direction) {
      sortItem = { sort_by: '', sort_direction: null }
    } else {
      sortItem = { sort_by, sort_direction }
      this.productDetails = sortByMultiRule(
        this.productDetails,
        getRuleList(sortItem),
      )
    }
    this.sortItem = sortItem
  }
}

export default new Store()
