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
  ListProductionTaskCost,
  CreateStockSheetRequest,
} from 'gm_api/src/inventory'
import { ListCustomer, ListSupplier } from 'gm_api/src/enterprise'
import { GetTaskWeight, ListTask } from 'gm_api/src/production'
import { ListRoute } from 'gm_api/src/delivery'
import {
  SalesInvoicingSheet,
  ComSupplier,
  ComShelf,
  ComSkuItem,
  ReceiptStatusKey,
  ComSsuItem,
  ComCustomer,
  ComRouter,
} from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
  RECEIPT_TYPE,
  MODULE_SELECT,
} from '@/pages/sales_invoicing/enum'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import {
  adapterMoreSelectComData,
  isStringValid,
  formatDataToTree,
  isValid,
  toFixedSalesInvoicing,
  sortByMultiRule,
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
  getTargetSsuList,
  isSystemSsuUnitType,
  isSystemBaseUnit,
  isInShare,
  getLinkCalculate,
  isInShareV2,
  getLinkCalculateV2,
} from '@/pages/sales_invoicing/util'
import Big from 'big.js'
import { ApportionState } from '@/pages/sales_invoicing/components'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { getDataByRecommend } from '../util'
import globalStore from '@/stores/global'
import type { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'

interface RDetail
  extends Omit<SalesInvoicingSheet.PlanStockInReceiptDetail, 'details'> {
  details: PDetail[]
}

interface PDetail extends SalesInvoicingSheet.PlanStockInProductDetail {
  production_customer_id?: string
  production_customer_name?: string
  uniqueKey: number
}

const generateInitProductDetail = (): PDetail => {
  return {
    ...defaultProductDetail,
    type: Batch_BatchType.BATCH_TYPE_CONST,
    shelf_selected: [],
    production_task_serial_no: '',
    production_task_id: '',
    uniqueKey: _.random(1000, true),
    module: MODULE_SELECT.customer,
  }
}

const initReceiptDetail: RDetail = {
  ...defaultReceiptDetail,
  details: [{ ...generateInitProductDetail() }],
  // turnoverList: [{ ...generateInitProductDetail() }],
  sheet_type: RECEIPT_TYPE.productIn, // 生产入库
}

// // 周转物也是商品
// const initTurnover: PDetail = {
//   ...generateInitProductDetail(),
// }

class Store {
  receiptDetail: RDetail = { ...initReceiptDetail }
  productDetails: PDetail[] = [{ ...generateInitProductDetail() }]
  apportionList: ApportionState[] = []
  shelfList: ComShelf[] = []
  supplierList: ComSupplier[] = []
  // @observable turnoverList: PDetail[] = [{ ...initTurnover }]

  shelfResponse: Shelf[] = []

  customerList: ComCustomer[] = []

  routerList: ComRouter[] = []

  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  receiptLoading = false

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productDetails = [{ ...generateInitProductDetail() }]
    this.apportionList = []
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
        // 商品分类
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

  clearApportionItem() {
    this.apportionList = []
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  changeReceiptDetail<T extends keyof RDetail>(field: T, value: RDetail[T]) {
    this.receiptDetail[field] = value
  }

  changeProductDetailsItem(index: number, changeData: Partial<PDetail>) {
    Object.assign(this.productDetails[index], { ...changeData })
  }

  addProductDetailsItem() {
    this.productDetails.push({ ...generateInitProductDetail() })
  }

  deleteProductDetails(index: number) {
    this.productDetails.splice(index, 1)
  }

  addApportionItem(item: ApportionState) {
    this.apportionList.push({ ...item })
  }

  changeSpecificationSelected(index: number, selected: ComSsuItem) {
    const { shelf_selected, shelf_id, shelf_name, shelf } =
      this.productDetails[index]
    // 切换或清空时将该行数据(除商品）全部清空
    const changeData = {
      ...generateInitProductDetail(),
      ...this.productSelected[index],
      /** 排除货位 */
      ...{ shelf_selected, shelf_id, shelf_name, shelf },
    }

    if (selected) {
      Object.assign(changeData, {
        unit_id: selected.value,
        ssu_base_unit_id: selected.ssu_base_unit_id,
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
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...generateInitProductDetail(),
      // shelf_id: '0',
    }
    if (selected) {
      Object.assign(changeData, {
        ...selected,
        sku_name: selected.name,
        spu_id: selected.spu_id,
        sku_base_unit_id: selected.base_unit_id,
      })
    }

    Object.assign(this.productDetails[index], { ...changeData })
  }

  handleScanData(data: any) {
    const ids: string[] = []
    _.each(data, (item) => {
      if (!ids.includes(item.task_id)) {
        ids.push(item.task_id)
      }
    })

    return this.getPrice(ids).then((json) => {
      _.each(data, (item) => {
        const { amount, base_price } = getDataByRecommend(json.response, item)
        this.productDetails.push({
          ...generateInitProductDetail(),
          ...item,
          amount,
          base_price,
        })
      })

      return json
    })
  }

  async handleScanInnerLabelData(code: string) {
    const { response } = await GetTaskWeight({ customized_code: code })
    const { task, skus, task_weight } = response
    const { sku, category_infos } = skus![task?.sku_id!]
    // const ssu = ssu_map![task_weight.unit_id!]

    if (isInShareV2(this.apportionList, task?.sku_id!)) {
      Tip.danger(
        t('该商品+规格已加入分摊不可重复添加，如需添加请取消分摊再进行操作'),
      )
      return
    }

    const existPDetail = _.find(
      this.productDetails,
      (pDetail) => pDetail.production_task_id === task?.task_id,
    )

    if (
      existPDetail &&
      existPDetail.sku_id === task?.sku_id &&
      existPDetail.unit_id === task.unit_id
    ) {
      // 已经存在，累加入库数
      const existPDetailIndex = _.findIndex(
        this.productDetails,
        (pDetail) => pDetail.production_task_id === task?.task_id,
      )

      Object.assign(existPDetail, {
        ssu_base_quantity:
          (existPDetail.ssu_base_quantity || 0) + +task_weight.quantity,
        ssu_base_quantity_show: toFixedSalesInvoicing(
          (existPDetail.ssu_base_quantity || 0) + +task_weight.quantity,
        ),
        ssu_quantity: (existPDetail.ssu_quantity || 0) + 1,
        ssu_quantity_show: toFixedSalesInvoicing(
          (existPDetail.ssu_quantity || 0) + 1,
        ),
      })

      const { amount } = getLinkCalculateV2({
        data: existPDetail,
        currentField: 'base_quantity',
        currentValue: existPDetail.ssu_base_quantity,
      })

      this.changeProductDetailsItem(existPDetailIndex, {
        amount,
      })
    } else {
      const pd: PDetail = {
        ...generateInitProductDetail(),
      }

      const skuBaseUnit = globalStore.getUnit(task?.base_unit_id!)!

      const target_customer_name =
        task?.target_customer_id && task?.target_customer_id !== '0'
          ? _.find(
              this.customerList,
              (item) => item.value === task?.target_customer_id,
            )?.name
          : ''

      Object.assign(pd, {
        production_task_id: task?.task_id,
        production_task_serial_no: task?.serial_no,
        target_customer_id: task?.target_customer_id,
        target_customer_name,

        sku_name: sku?.name!,
        sku_base_unit_id: task?.base_unit_id,
        sku_base_unit_name: skuBaseUnit?.text,
        sku_type: sku?.sku_type,
        sku_id: sku?.sku_id!,

        category_id_1: category_infos![0].category_id!,
        category_id_2: category_infos![1].category_id!,
        category_name_1: category_infos![0].category_name!,
        category_name_2: category_infos![1].category_name!,
        spu_name: category_infos![2].category_name!,
        spu_id: sku?.spu_id,

        base_unit_id: sku?.base_unit_id,
      })

      this.getPrice([response.task?.task_id!]).then((json) => {
        const { amount, base_price } = getDataByRecommend(json.response, pd)
        this.productDetails.push({
          ...pd,
          amount,
          base_price,
        })
        return json
      })
    }
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
   * 校验数据
   * @returns {{canSubmitType: number}} 0: 不允许提交， 1: 可提交
   */
  verifyData() {
    const postData = this.getValidProductListData()
    let canSubmitType = 1

    if (postData.length === 0) {
      Tip.danger(t('请先添加商品明细'))
      return 0
    }

    let currentIndex = 0
    while (currentIndex < postData.length) {
      const {
        sku_id,
        base_quantity,
        production_task_id,
        input_stock: { input },
        second_base_unit_id,
        second_base_unit_quantity,
      } = postData[currentIndex]
      if (!sku_id || !isValid(input?.quantity)) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      } else if (base_quantity === 0) {
        Tip.danger(
          t(
            '商品入库数（基本单位）为0无法提交，请填写入库数（基本单位）后再提交',
          ),
        )
        canSubmitType = 0
        break
      } else if (!production_task_id) {
        Tip.danger(t('请选择生产计划后再提交'))
        canSubmitType = 0
        break
      } else if (
        !!_.toNumber(second_base_unit_id) &&
        !isValid(second_base_unit_quantity)
      ) {
        // 开启了辅助单位且辅助单位没有值
        Tip.danger(t('请填写入库数(辅助单位)后再提交'))
        canSubmitType = 0
        break
      }
      currentIndex++
    }

    return canSubmitType
  }

  isInvalidReceipt(receiptAction?: string) {
    // 点击反审时
    if (
      (parseInt(this.receiptDetail?.status!) >> 8).toString(2) === '1' &&
      receiptAction === 'cancelApproval'
    ) {
      Tip.danger(t('已替代的单据无法反审'))
      return true
    }
    if (this.verifyData() === 0) {
      return true
    }
    if (this.totalPrice < 0) {
      Tip.danger(t('入库金额不能小于0'))
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
    const { warehouse_id } = this.receiptDetail
    const params = {
      warehouse_id,
    }
    return ListShelf(params).then((json) => {
      const shelves = json.response.shelves
      shelves.unshift({
        shelf_id: '0',
        create_time: '0',
        update_time: '0',
        delete_time: '0',
        group_id: '0',
        station_id: '0',
        parent_id: '0',
        name: '未分配',
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
    })
  }

  fetchCustomer() {
    return ListCustomer({ paging: { limit: 999 } }).then((json) => {
      const { customers } = json.response
      if (customers) {
        const data = _.map(customers, (customer) => ({
          ...customer,
          value: customer.customer_id,
          text: customer.name,
        }))
        const filterData = _.filter(data, (c) => c.parent_id === '0')
        this.customerList = filterData
      }
      return json
    })
  }

  fetchRouter() {
    return ListRoute({ paging: { limit: 999 } }).then((json) => {
      this.routerList = _.map(json.response.routes, (router) => ({
        ...router,
        value: router.route_id,
        text: router.route_name,
      }))
      return null
    })
  }

  fetchSkuList(q: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }

  createReceipt(receiptAction: ReceiptStatusKey) {
    if (this.isInvalidReceipt()) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    this.receiptDetail.details = this.getValidProductListData()

    // this.receiptDetail.turnoverList = this.turnoverList
    this.receiptDetail.apportionList = this.apportionList
    this.receiptDetail.total_price = this.totalPrice.toString()

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

    const stock_sheet = Object.assign(data, {
      warehouse_id: this.receiptDetail.warehouse_id,
    })

    return CreateStockSheet({
      stock_sheet: stock_sheet,
    } as CreateStockSheetRequest).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return json
    })
  }

  updateReceipt(receiptAction: ReceiptStatusKey) {
    if (this.isInvalidReceipt(receiptAction)) {
      return Promise.reject(new Error('校验单据提交错误'))
    }

    this.receiptDetail.details = this.getValidProductListData()

    this.receiptDetail.apportionList = this.apportionList
    this.receiptDetail.total_price = this.totalPrice.toString()

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

    const stock_sheet = Object.assign(data, {
      warehouse_id: this.receiptDetail.warehouse_id,
    })

    return UpdateStockSheet({
      stock_sheet: stock_sheet,
      stock_sheet_id: this.receiptDetail.stock_sheet_id,
    }).then((json) => {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
      return json
    })
  }

  adapterStockSheet(res: GetStockSheetResponse) {
    const data = getSalesInvoicingSheetData(res, 'planStockIn', {
      shelfList: res.additional.shelfs,
      route: this.routerList,
    })
    const {
      stock_sheet: { warehouse_id },
      additional,
    } = res

    this.receiptDetail = {
      ...data,
      details: _.map(data.details, (detail) => {
        return { ...detail, uniqueKey: _.random(1000, true) }
      }),
      warehouse_name:
        warehouse_id && additional.warehouses?.[warehouse_id]?.name,
    }
    this.productDetails = this.receiptDetail.details
    this.apportionList = this.receiptDetail.apportionList || []
  }

  fetchStockSheet(sheet_id: string) {
    return GetStockSheet({
      stock_sheet_id: sheet_id,
      with_additional: true,
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

  getPrice(ids: string[]) {
    return ListTask({
      task_ids: ids,
      need_cost: true,
      paging: { offset: 0, limit: 999 },
    })
  }

  batchGetPrice(selected: number[]) {
    let isInValid = false
    const targetDataIds: string[] = []
    const targetData: { [key: string]: { index: number; data: PDetail } } = {}

    let index = 0
    while (index < this.productDetails.length) {
      const detail = this.productDetails[index]
      const {
        input_stock: { input },
      } = detail

      if (selected.includes(detail.uniqueKey) && !detail.is_by_product) {
        if (!isStringValid(detail.production_task_id)) {
          Tip.danger(t('请先选择生产需求'))
          isInValid = true
          return
        } else if (!isValid(input?.quantity)) {
          Tip.danger(t('请先输入入库数（基本单位）'))
          isInValid = true
          return
        } else {
          targetDataIds.push(detail.production_task_id!)
          targetData[detail.production_task_id!] = { index, data: detail }
        }
      }
      index++
    }

    if (!isInValid) {
      this.changeReceiptLoading(true)
      this.getPrice(targetDataIds)
        .then((json) => {
          _.each(targetData, (target) => {
            const { data, index } = target
            const { amount, base_price } = getDataByRecommend(
              json.response,
              data,
            )

            this.changeProductDetailsItem(index, {
              amount,
              base_price,
            })
          })

          this.changeReceiptLoading(false)
          return null
        })
        .catch(() => {
          this.changeReceiptLoading(false)
        })
    }
  }

  // 开启多仓后，切换仓库要重置货位
  resetShelf() {
    this.productDetails = [{ ...generateInitProductDetail() }]
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
export type { PDetail, RDetail }
