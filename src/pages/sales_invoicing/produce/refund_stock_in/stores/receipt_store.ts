import { makeAutoObservable } from 'mobx'
import _ from 'lodash'

import {
  ListShelf,
  UpdateStockSheet,
  CreateStockSheet,
  GetStockSheet,
  Batch_BatchType,
  Shelf,
  GetStockSheetResponse,
  ListMaterialInSku,
} from 'gm_api/src/inventory'
import { ListSupplier } from 'gm_api/src/enterprise'
import {
  SalesInvoicingSheet,
  ComSupplier,
  ComShelf,
  ComSkuItem,
  ReceiptStatusKey,
  ComSsuItem,
  LevelProcess,
} from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
  RECEIPT_TYPE,
} from '@/pages/sales_invoicing/enum'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import {
  adapterMoreSelectComData,
  formatDataToTree,
  isValid,
  sortByMultiRule,
  toFixedSalesInvoicing,
} from '@/common/util'
import {
  defaultReceiptDetail,
  defaultProductDetail,
} from '@/pages/sales_invoicing/receipt_base_data'
import {
  getDisabledShelfData,
  getSalesInvoicingSheetData,
  getStockSheetData,
  getSuccessTip,
} from '@/pages/sales_invoicing/util'
import Big from 'big.js'

import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

import type { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'
import {
  ListProcessor,
  Processor,
  MaterialOrder,
  ListMaterialOrderResponse,
} from 'gm_api/src/production'

// type MySortItem = SortItem<'sku_name' | ''>

interface RDetail
  extends Omit<SalesInvoicingSheet.RefundPlanStockInReceiptDetail, 'details'> {
  details: PDetail[]
  material_order_id: string
  material_order_serial_no: string
}

type PDetail = SalesInvoicingSheet.RefundPlanStockInProductDetail

interface ErrorMap {
  stockError: boolean
  batchDeleteError: boolean
}

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  type: Batch_BatchType.BATCH_TYPE_CONST,
  shelf_selected: [],
  batch_selected: [],
  production_task_serial_no: '',
  production_task_id: '',
}

const initReceiptDetail: RDetail = {
  ...defaultReceiptDetail,
  details: [{ ...initProductDetail }],
  sheet_type: RECEIPT_TYPE.materialIn, // ????????????
}

class Store {
  receiptDetail: RDetail = { ...initReceiptDetail }
  productDetails: PDetail[] = [{ ...initProductDetail }]
  shelfList: ComShelf[] = []
  supplierList: ComSupplier[] = []
  processors: LevelProcess[] = []
  processorsList: Processor[] = []
  listMaterialOrder: MaterialOrder[] = []

  shelfResponse: Shelf[] = []

  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  errorMap: ErrorMap = {
    stockError: false,
    batchDeleteError: false,
  }

  receiptLoading = false

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productDetails = [{ ...initProductDetail }]
  }

  get productSelected(): SalesInvoicingSheet.SkuSelectedDetail[] {
    return _.map(this.productDetails, (item) => {
      return {
        spu_id: item.spu_id!,
        spu_name: item.spu_name,
        sku_id: item.sku_id,
        sku_name: item.sku_name,
        sku_base_unit_id: item.sku_base_unit_id,
        sku_base_unit_name: item.sku_base_unit_name,
        sku_type: item.sku_type,
        // ????????????
        category_id_1: item.category_id_1,
        category_id_2: item.category_id_2,
        category_name_1: item.category_name_1,
        category_name_2: item.category_name_2,

        ssu: item.ssu,
      }
    })
  }

  get totalPrice() {
    let total = 0

    _.each(this.productDetails, (item) => {
      total = +Big(total).plus(item.amount || 0)
    })

    return total
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  changeErrorMap(key: keyof ErrorMap, value: boolean) {
    this.errorMap[key] = value
  }

  changeReceiptDetail<T extends keyof RDetail>(field: T, value: RDetail[T]) {
    this.receiptDetail[field] = value
  }

  changeProductDetailsItem(index: number, changeData: Partial<PDetail>) {
    Object.assign(this.productDetails[index], { ...changeData })
  }

  addProductDetailsItem() {
    this.productDetails.push({ ...initProductDetail })
  }

  deleteProductDetails(index: number) {
    this.productDetails.splice(index, 1)
  }

  changeSpecificationSelected(index: number, selected: ComSsuItem) {
    const { shelf_selected, shelf_id, shelf_name, shelf } =
      this.productDetails[index]
    // ?????????????????????????????????(????????????????????????
    const changeData = {
      ...initProductDetail,
      ...this.productSelected[index],
      /** ???????????? */
      ...{ shelf_selected, shelf_id, shelf_name, shelf },
    }

    if (selected) {
      Object.assign(changeData, {
        unit_id: selected.value,
        ssu_base_unit_id: selected.ssu_base_unit_id,
        ssu_base_unit_rate: selected.ssu_base_unit_rate,
        ssu_base_unit_name: selected.ssu_base_unit_name,
        ssu_unit_name: selected.ssu_unit_name,
        ssu_unit_id: selected.unit_id,
        ssu_display_name: selected.ssu_display_name,
        ssu_unit_rate: +selected.ssu_unit_rate,
        ssu_unit_type: selected.ssu_unit_type,
      })
    }

    this.productDetails[index] = { ...changeData }
  }

  changeProductNameSelected(index: number, selected: ComSkuItem) {
    // ?????????????????????????????????????????????
    const changeData = {
      ...initProductDetail,
      shelf_id: '0',
    }
    if (selected) {
      Object.assign(changeData, {
        ...selected,
        sku_name: selected.name,
        sku_id: selected.sku_id,
        category_id_1: selected.category_id_1,
        category_id_2: selected.category_id_2,
        category_name_1: selected.category_name_1,
        category_name_2: selected.category_name_2,
        spu_id: selected.spu_id,
      })
    }

    Object.assign(this.productDetails[index], { ...changeData })
  }

  changeReceiptAllDetail(value: RDetail) {
    this.receiptDetail = value
  }

  handleScanData(data: any) {
    _.each(data, (item) => {
      const { base_quantity, unit_id, second_base_unit_ratio } = item

      const isValidValue = !_.isNil(base_quantity)
      const secondInputValue = isValidValue
        ? +Big(base_quantity).div(+second_base_unit_ratio || 1)
        : ''

      this.productDetails.push({
        ...initProductDetail,
        ...item,
        input_stock: {
          input: {
            unit_id,
            quantity: toFixedSalesInvoicing(base_quantity),
          },
          input2: {
            unit_id,
            quantity: base_quantity,
          },
        },
        second_base_unit_quantity: toFixedSalesInvoicing(secondInputValue || 0),
      })
    })
  }

  getValidProductListData() {
    const result: PDetail[] = []
    _.each(this.productDetails, (item) => {
      if (
        item.sku_id ||
        item.ssu_unit_id ||
        isValid(item.ssu_base_quantity) ||
        isValid(item.ssu_quantity)
      ) {
        result.push({
          ...item,
        })
      }
    })

    return result
  }

  /**
   * ????????????
   * @returns {{canSubmitType: number}} 0: ?????????????????? 1: ?????????
   */
  verifyData() {
    const postData = this.getValidProductListData()
    let canSubmitType = 1

    if (postData.length === 0) {
      Tip.danger(t('????????????????????????'))
      return 0
    }

    if (this.errorMap.batchDeleteError) {
      Tip.danger(t('?????????????????????????????????????????????'))
      return 0
    }

    if (this.errorMap.stockError) {
      Tip.danger(t('????????????????????????????????????????????????????????????????????????'))
      return 0
    }

    let currentIndex = 0

    while (currentIndex < postData.length) {
      const {
        sku_id,
        production_task_id,
        batch_selected,
        second_base_unit_id,
        second_base_unit_quantity,
      } = postData[currentIndex]
      if (!sku_id) {
        Tip.danger(t('???????????????????????????'))
        canSubmitType = 0
        break
      }
      // else if (+input?.quantity! === 0) {
      //   Tip.danger(
      //     t(
      //       '????????????????????????????????????0???????????????????????????????????????????????????????????????',
      //     ),
      //   )
      //   canSubmitType = 0
      //   break
      // }
      else if (batch_selected.length <= 0) {
        Tip.danger(t('???????????????????????????'))
        canSubmitType = 0
        break
      } else if (
        !!_.toNumber(second_base_unit_id) &&
        !isValid(second_base_unit_quantity)
      ) {
        // ?????????????????????????????????????????????
        Tip.danger(t('??????????????????(????????????)????????????'))
        canSubmitType = 0
        break
      }
      currentIndex++
      // else if (ssu_quantity === 0) {
      //   Tip.danger(
      //     t(
      //       '??????????????????????????????(??????)??????0????????????????????????????????????????????????(??????)???????????????',
      //     ),
      //   )
      //   canSubmitType = 0
      //   break
      // }
      // else if (!production_task_id) {
      //   Tip.danger(t('?????????????????????????????????'))
      //   canSubmitType = 0
      //   break
      // }
    }

    return canSubmitType
  }

  isInvalidReceipt() {
    if (this.verifyData() === 0) {
      return true
    }
    if (this.totalPrice < 0) {
      Tip.danger(t('????????????????????????0'))
      return true
    }

    return false
  }

  fetchSupplier() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.supplierList = adapterMoreSelectComData(
        json.response.suppliers!,
        'supplier_id',
      )

      return json
    })
  }

  fetchShelf() {
    return ListShelf({ warehouse_id: this.receiptDetail.warehouse_id }).then(
      (json) => {
        const shelves = json.response.shelves
        shelves.unshift({
          shelf_id: '0',
          create_time: '0',
          update_time: '0',
          delete_time: '0',
          group_id: '0',
          station_id: '0',
          parent_id: '0',
          name: '?????????',
          remark: '',
          is_leaf: true,
        })
        this.shelfResponse = shelves
        this.shelfList = formatDataToTree(
          getDisabledShelfData(shelves!),
          'shelf_id',
          'name',
        )

        return json
      },
    )
  }

  fetchProcess() {
    return ListProcessor().then((response) => {
      const data = response.response.processors
      this.processorsList = data
      this.processors = formatDataToTree(data, 'processor_id', 'name')
    })
  }

  fetchSkuList(q: string) {
    const { material_order_id, warehouse_id } = this.receiptDetail
    return ListMaterialInSku({
      q,
      material_order_id,
      with_additional: true,
      warehouse_id,
    })
  }

  createReceipt(receiptAction: ReceiptStatusKey) {
    if (this.isInvalidReceipt()) {
      return Promise.reject(new Error('????????????????????????'))
    }

    this.receiptDetail.details = this.getValidProductListData()

    this.receiptDetail.total_price = this.totalPrice.toString()

    const keepStatus = ['notApproved', 'cancelApproval']
    let statusName: ReceiptStatusKey
    if (
      keepStatus.includes(
        RECEIPT_STATUS_KEY_NAME[this.receiptDetail.sheet_status],
      ) &&
      receiptAction === 'toBeSubmitted' // ????????????????????????????????????????????????
    ) {
      statusName = RECEIPT_STATUS_KEY_NAME[this.receiptDetail.sheet_status]
    } else {
      statusName = receiptAction
    }

    const data = getStockSheetData(this.receiptDetail, {
      type: 'refundStockIn',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    const stock_sheet = Object.assign(data, {
      warehouse_id: this.receiptDetail.warehouse_id,
      material_order_id: this.receiptDetail.material_order_id,
      material_order_serial_no: this.receiptDetail.material_order_serial_no,
    })

    return CreateStockSheet({ stock_sheet }).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('??????'),
      )
      return json
    })
  }

  updateReceipt(receiptAction: ReceiptStatusKey) {
    if (this.isInvalidReceipt()) {
      return Promise.reject(new Error('????????????????????????'))
    }

    this.receiptDetail.details = this.getValidProductListData()

    this.receiptDetail.total_price = this.totalPrice.toString()

    const keepStatus = ['notApproved', 'cancelApproval']
    let statusName: ReceiptStatusKey
    if (
      keepStatus.includes(
        RECEIPT_STATUS_KEY_NAME[this.receiptDetail.sheet_status],
      ) &&
      receiptAction === 'toBeSubmitted' // ????????????????????????????????????????????????
    ) {
      statusName = RECEIPT_STATUS_KEY_NAME[this.receiptDetail.sheet_status]
    } else {
      statusName = receiptAction
    }

    const data = getStockSheetData(this.receiptDetail, {
      type: 'refundStockIn',
      sheet_status: RECEIPT_STATUS[statusName],
    })

    const stock_sheet = Object.assign(data, {
      warehouse_id: this.receiptDetail.warehouse_id,
      material_order_id: this.receiptDetail.material_order_id,
      material_order_serial_no: this.receiptDetail.material_order_serial_no,
    })

    return UpdateStockSheet({
      stock_sheet: stock_sheet,
      stock_sheet_id: this.receiptDetail.stock_sheet_id,
    }).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('??????'),
      )
      return json
    })
  }

  adapterStockSheet(res: GetStockSheetResponse) {
    const {
      stock_sheet: { warehouse_id },
      additional,
    } = res
    this.receiptDetail = {
      ...getSalesInvoicingSheetData(res, 'refundPlanStockIn', {
        shelfList: this.shelfResponse,
        processors: this.processorsList,
      }),
      warehouse_name:
        (warehouse_id && additional.warehouses?.[warehouse_id]?.name) || '',
    }
    this.productDetails = this.receiptDetail.details
  }

  fetchStockSheet(sheet_id: string) {
    return GetStockSheet({
      stock_sheet_id: sheet_id,
      with_additional: true,
    })
  }

  /**
   * ??????fetchStockSheet(????????????adapter)???????????????adapter???????????????????????????????????????
   * @param sheet_id string
   */
  fetchAndAdapterStockSheet(sheet_id: string) {
    return this.fetchStockSheet(sheet_id).then((json) => {
      this.adapterStockSheet(json.response)
      return json
    })
  }

  /**
   * ??????????????????????????????,????????????loading???????????????????????????
   * @param receiptAction ???updateStockSheet
   */
  async updateAndGetReceipt(receiptAction: ReceiptStatusKey) {
    this.changeReceiptLoading(true)

    await this.updateReceipt(receiptAction).catch((err) => {
      this.changeReceiptLoading(false)
      throw Promise.reject(new Error(err))
    })
    return this.fetchAndAdapterStockSheet(this.receiptDetail.stock_sheet_id)
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
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

  saveListMaterialOrder(response: ListMaterialOrderResponse) {
    this.listMaterialOrder = response?.material_orders || []
    return response?.material_orders
  }
}

export default new Store()
export type { PDetail, RDetail }
