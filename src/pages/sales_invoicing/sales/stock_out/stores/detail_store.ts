import { makeAutoObservable, runInAction, toJS } from 'mobx'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'

// 接口
import {
  CreateSaleOutStockSheet,
  UpdateSaleOutStockSheet,
  GetSaleOutStockSheet,
  ListShelf,
} from 'gm_api/src/inventory'
import { ListCustomer } from 'gm_api/src/enterprise'

// 类型
import {
  CreateSaleOutStockSheetRequest,
  UpdateSaleOutStockSheetRequest,
  GetSaleOutStockSheetResponse,
  Status_LackOfStockDetail_Detail,
  StockSheet_TargetType,
  Status_Code,
  Shelf,
  Additional,
  SkuStock,
} from 'gm_api/src/inventory/types'

import {
  SalesInvoicingSheet,
  ComCustomer,
  ComSkuItem,
  ReceiptStatusKey,
  ComSsuItem,
} from '@/pages/sales_invoicing/interface'
import {
  RECEIPT_TYPE,
  RECEIPT_STATUS,
  RECEIPT_STATUS_KEY_NAME,
} from '@/pages/sales_invoicing/enum'
import {
  adapterMoreSelectComData,
  getTimestamp,
  isValid,
  sortByMultiRule,
  toFixedSalesInvoicing,
} from '@/common/util'
import {
  defaultReceiptDetail,
  defaultProductDetail,
} from '@/pages/sales_invoicing/receipt_base_data'
import { getSuccessTip } from '@/pages/sales_invoicing/util'
import globalStore from '@/stores/global'

import AutoBatchModal from '@/pages/sales_invoicing/components/auto_batch_modal'
import { Sku } from '@/pages/order/order_manage/components/interface'
import { SortItem } from '@/common/interface'
import { getRuleList } from '@/pages/sales_invoicing/util2'

interface RDetail
  extends Omit<SalesInvoicingSheet.StockOutReceiptDetail, 'details'> {
  out_stock_target_type: number
  order_id?: string | number
  order_serial_no: string
  customer_name?: string
  out_stock_time?: string
  sale_out_stock_sheet_serial_no?: string
  sale_out_stock_sheet_id?: string
  amount?: string
  details: PDetail[]
}

type PDetail = SalesInvoicingSheet.StockOutProductDetail & {
  currStockQuantity?: string
}

const initProductDetail: PDetail = {
  ...defaultProductDetail,
  batch_selected: [],
}

const initReceiptDetail: RDetail = {
  ...defaultReceiptDetail,
  details: [{ ...initProductDetail }],
  target_type: StockSheet_TargetType.SHEET_TARGET_TYPE_CUSTOMER,
  sheet_type: RECEIPT_TYPE.saleOut, // 销售出库
  out_stock_target_type: 1,
}

class Store {
  receiptDetail: RDetail = { ...initReceiptDetail }
  productDetails: PDetail[] = [{ ...initProductDetail }]

  customerList: ComCustomer[] = []

  allShelfResponse: Shelf[] = []
  /** 库存不足的sku_ids */
  updateStockSheetErrDetails: Status_LackOfStockDetail_Detail[] = []

  target_id_parent = ''

  receiptLoading = false

  additional: Additional = {}
  sortItem: SortItem = {
    sort_by: '',
    sort_direction: null,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
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
        // 当前库存
        currStockQuantity: item?.currStockQuantity || '0',

        ssu: item.ssu,
      }
    })
  }

  clear() {
    this.receiptDetail = { ...initReceiptDetail }
    this.productDetails = [{ ...initProductDetail }]
    this.changeStockSheetErrDetails([])
  }

  clearProductList() {
    this.productDetails = [{ ...initProductDetail }]
  }

  changeReceiptLoading(bool: boolean) {
    this.receiptLoading = bool
  }

  changeStockSheetErrDetails(updateStockSheetErrDetails = []) {
    this.updateStockSheetErrDetails = updateStockSheetErrDetails
  }

  get totalPrice() {
    let total = 0

    _.each(this.productDetails, (item) => {
      total = +Big(total).plus(item.amount || item.no_tax_amount || 0)
    })

    return total
  }

  changeTargetIdParent(str: string) {
    this.target_id_parent = str
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
    // 切换或清空时将该行数据全部清空
    const changeData = {
      ...initProductDetail,
      ...this.productSelected[index],
    }

    if (selected) {
      Object.assign(changeData, {
        unit_id: selected ? selected.value : '',
      })
    }

    this.productDetails[index] = { ...changeData }
  }

  changeProductNameSelected(index: number, selected: ComSkuItem) {
    // 切换或清空时将该行数据全部清空
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

    runInAction(() => {
      this.productDetails[index] = { ...changeData }
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
        // 清除辅助数据
        // const data = _.omit(item, ['shelfSelected', 'uniqueKeyForSelect'])

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
  verifyData(receiptAction: ReceiptStatusKey, isCheckBatch?: boolean) {
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
        batch_selected,
        // 辅助单位 id & 辅助单位数
        second_base_unit_id,
        second_base_unit_quantity,
      } = postData[currentIndex]

      if (!sku_id) {
        Tip.danger(t('商品明细填写不完善'))
        canSubmitType = 0
        break
      } else if (second_base_unit_id !== '0' && !second_base_unit_quantity) {
        Tip.danger(t('请填写入库数(辅助单位)后再提交'))
        canSubmitType = 0
        break
      } else if (isCheckBatch && batch_selected.length === 0) {
        if (receiptAction === 'approved') {
          break
        }
        const OpenAutoBatchModal = () => {
          AutoBatchModal(
            this,
            '/sales_invoicing/sales/stock_out/detail?sheet_id=',
            'sale',
          )
        }
        OpenAutoBatchModal()
        return 0
      }
      currentIndex++
    }

    return canSubmitType
  }

  isInvalidReceipt(receiptAction: ReceiptStatusKey, isCheckBatch?: boolean) {
    if (this.verifyData(receiptAction, isCheckBatch) === 0) {
      return true
    }
    if (this.totalPrice < 0) {
      Tip.danger(t('出库金额不能小于0'))
      return true
    }

    return false
  }

  validateBatchStatus(
    receiptAction: ReceiptStatusKey,
    isUseAutoBatch: boolean,
    type: 'create' | 'update',
  ): any {
    /** 更新和创建的条件判断 */
    const defaultCondition =
      !isUseAutoBatch &&
      this.isInvalidReceipt(
        receiptAction,
        ['submitted', 'approved'].includes(receiptAction),
      )

    const finallyCondition =
      type === 'create'
        ? defaultCondition
        : receiptAction !== 'cancelApproval' && defaultCondition

    return !finallyCondition
  }

  /** 抽出公共处理参数statusName的部分 */
  getStatusName(receiptAction: ReceiptStatusKey) {
    const keepStatus = ['notApproved', 'cancelApproval']
    /** 至少给个初始化 */
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

    return statusName
  }

  getRequestParams(
    statusName: ReceiptStatusKey,
    isUseAutoBatch: boolean,
    type: 'create' | 'update',
  ) {
    this.receiptDetail.details = this.getValidProductListData()
    this.receiptDetail.amount = this.totalPrice.toString()
    // 创建的header 字段
    const pickCreateReceiptDetails = Object.assign(
      {},
      _.pick(this.receiptDetail, [
        'sale_out_stock_sheet_id',
        'sale_out_stock_sheet_serial_no',
        'warehouse_id',
        'customer_id',
        'customer_name',
        'order_id',
        'order_serial_no',
        'amount',
        'remark',
        'out_stock_time',
        'estimated_time',
        'batch_index',
      ]),
      { sheet_status: RECEIPT_STATUS[statusName] },
    )

    // 更新需要的字段
    const pickUpdateReceiptDetails = Object.assign(
      { ...pickCreateReceiptDetails },
      _.pick(this.receiptDetail, [
        'create_time',
        'update_time',
        'delete_time',
        'group_id',
        'station_id',
        'creator_id',
        'submitter_id',
        'approver_id',
        'commit_time',
        'printed_count',
        'detail_len',
        'invisible_type',
      ]),
    )

    // 商品明细
    const pickProductDetails = this.productDetails.map((item) => {
      return Object.assign(
        {},
        _.pick(item, [
          'sku_id',
          'base_unit_id',
          'remark',
          'second_base_unit_id',
          'second_base_unit_ratio',
        ]),
        {
          amount: _.isNil(item.no_tax_amount)
            ? '0'
            : item.no_tax_amount.toString(),
          sku_unit_id: item.base_unit_id,
          second_base_unit_quantity: String(item.second_base_unit_quantity),
          input_stock: {
            input: {
              ...item.input_stock.input,
              unit_id: item?.base_unit_id || item.sku_base_unit_id,
              price: Big(item.base_price || 0).toString(),
            },
            input2: {
              ...item.input_stock.input,
              unit_id: item.base_unit_id || item.sku_base_unit_id,
              price: '0', // 暂时用不到，后台需要默认为0
            },
          },
          batch_details:
            item.batch_details && item.batch_details.length > 0
              ? item.batch_details
              : item.batch_selected.map((item) => {
                  // 参数 batch_detail_id 取值 parent_id
                  return {
                    ..._.pick(item, [
                      'batch_serial_no',
                      'input_stock',
                      'stock',
                      'shelf_id',
                    ]),
                    batch_parent_id: item.parent_id,
                    is_virtual_batch: isUseAutoBatch,
                  }
                }),
        },
      )
    })

    const pickDetails =
      type === 'create' ? pickCreateReceiptDetails : pickUpdateReceiptDetails

    const requestParams:
      | CreateSaleOutStockSheetRequest
      | UpdateSaleOutStockSheetRequest = {
      stock_sheet: {
        ...pickDetails,
        details: pickProductDetails,
      },
      match_batch_commit: isUseAutoBatch,
    }

    return requestParams
  }

  /** 创建单据 */
  createReceipt(receiptAction: ReceiptStatusKey, isUseAutoBatch = false) {
    // 如果没有满足提交条件, 不请求接口
    if (!this.validateBatchStatus(receiptAction, isUseAutoBatch, 'create')) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    const statusName = this.getStatusName(receiptAction)

    const requestParams = this.getRequestParams(
      statusName,
      isUseAutoBatch,
      'create',
    )

    return CreateSaleOutStockSheet({ ...requestParams }, [
      Status_Code.BATCH_DELETED_OR_NOT_EXISTS,
      Status_Code.LACK_OF_STOCK,
    ]).then((json) => {
      this.getBatchReceiptStatus(statusName, json)
      return json
    })
  }

  /** 更新单据 */
  updateReceipt(receiptAction: ReceiptStatusKey, isUseAutoBatch = false) {
    // 如果没有满足提交条件, 不请求接口
    if (!this.validateBatchStatus(receiptAction, isUseAutoBatch, 'update')) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    const statusName = this.getStatusName(receiptAction)

    const requestParams = this.getRequestParams(
      statusName,
      isUseAutoBatch,
      'update',
    )

    return UpdateSaleOutStockSheet(
      {
        ...requestParams,
        stock_sheet_id: this.receiptDetail.sale_out_stock_sheet_id,
      },
      [Status_Code.BATCH_DELETED_OR_NOT_EXISTS, Status_Code.LACK_OF_STOCK],
    ).then((json) => {
      this.getBatchReceiptStatus(statusName, json)
      return json
    })
  }

  /** 创建/更新接口完成后判断批次状况 */
  getBatchReceiptStatus(statusName: ReceiptStatusKey, json: any) {
    if (json.code === Status_Code.BATCH_DELETED_OR_NOT_EXISTS) {
      Tip.danger(t('批次不存在或已被删除'))

      this.handleSubmitError(json.code, json.message)
      throw Promise.reject(new Error(t('批次不存在或已被删除')))
    } else if (json.code === Status_Code.LACK_OF_STOCK) {
      Tip.danger(t('批次库存不足'))
      const {
        message: {
          detail: { details },
        },
      } = json
      this.changeStockSheetErrDetails(details)

      this.handleSubmitError(json.code, json.message)
      throw Promise.reject(new Error(t('批次库存不足')))
    } else {
      Tip.success(
        getSuccessTip(statusName, this.receiptDetail.sheet_status) + t('成功'),
      )
    }
  }

  handleSubmitError(
    code: Status_Code,
    message: { description: string; detail: any },
  ) {
    const errorBatch: { [key: string]: any } = {}
    _.each(message.detail.details, (batch) => {
      if (batch.batch_id) {
        errorBatch[batch.batch_id] = batch
      }
    })

    _.each(this.productDetails, (detail) => {
      _.each(detail.batch_selected, (batch) => {
        if (errorBatch[batch.batch_id]) {
          if (code === Status_Code.BATCH_DELETED_OR_NOT_EXISTS) {
            batch.batch_delete_time = errorBatch[batch.batch_id].delete_time
            detail.batch_selected = detail.batch_selected.slice()
          }

          if (code === Status_Code.LACK_OF_STOCK) {
            batch.stock = errorBatch[batch.batch_id].stock
            batch.ssu_stock_quantity =
              errorBatch[batch.batch_id].stock.sku_unit.quantity
            batch.sku_stock_base_quantity =
              errorBatch[batch.batch_id].stock.base_unit.quantity
            detail.batch_selected = detail.batch_selected.slice()
          }
        }
      })
    })
  }

  /** 从additional里面获取需要的数据 */
  getAdditionInfo<k>(type: keyof Additional, key: string): k {
    return this.additional[type]?.[key] as k
  }

  /** 处理详情数据 */
  adapterStockSheet(res: GetSaleOutStockSheetResponse) {
    const {
      stock_sheet,
      stock_sheet: { warehouse_id, customer_id, creator_id, customer_name },
      additional,
      additional: {
        customers,
        category_map,
        batches,
        suppliers,
        group_users,
        sub_batches,
      },
    } = res
    this.additional = additional

    const customer = customers![customer_id!] // list数据会过滤已删除的，因此从additional取delete_time\
    // 获取建单人 name
    const { name } =
      creator_id !== '0'
        ? this.getAdditionInfo('group_users', creator_id!)
        : { name: '' }
    const { name: warehouse_name } = this.getAdditionInfo(
      'warehouses',
      warehouse_id!,
    )

    this.receiptDetail = {
      ...stock_sheet,
      out_stock_target_type: customer_id === '0' ? 2 : 1,
      target_delete_time: customer?.delete_time!,
      target_customized_code: customer?.customized_code,
      customer_name: customer ? customer.name : customer_name,
      creator_name: name,
      warehouse_name: (warehouse_id && warehouse_name) || '',
      out_stock_time:
        stock_sheet.out_stock_time && stock_sheet.out_stock_time !== '0'
          ? stock_sheet.out_stock_time
          : getTimestamp(new Date()),
    }

    this.productDetails = stock_sheet.details!.map((item) => {
      const { sku_id, batch_details } = item
      const sku_map = this.getAdditionInfo<Sku>('sku_map', sku_id)
      const currStockQuantity = this.getAdditionInfo<SkuStock>(
        'sku_stocks',
        sku_id,
      )?.stock?.base_unit?.quantity

      const { category1_id, category2_id, category3_id } = sku_map
      const sku_stock = this.getAdditionInfo('sku_stocks', sku_id)
      // 虚拟批次
      const virtualBatchList =
        batch_details
          ?.filter((item) => item.is_virtual_batch === true)
          .map((j) => {
            const { stock, input_stock, batch_parent_id } = j

            return {
              ...j,
              batch_serial_no: '虚拟批次号',
              batch_average_price: +stock!.base_unit?.price!,
              sku_base_quantity: +input_stock?.input?.quantity!,
              sku_base_quantity_show: toFixedSalesInvoicing(
                +input_stock?.input?.quantity!,
              ),
              sku_base_unit_name: globalStore.getUnit(
                stock?.base_unit?.unit_id!,
              ).text!,
              sku_stock_base_quantity: stock?.base_unit?.quantity!,
              in_stock_time: batches![batch_parent_id!]
                ? batches![batch_parent_id!]?.in_stock_time
                : '',
              batch_delete_time: batches![batch_parent_id!]
                ? batches![batch_parent_id!]?.delete_time
                : '',
              supplier_name:
                suppliers![batches![batch_parent_id!].supplier_id]?.name ?? '-',
              purchaser_name:
                group_users![batches![batch_parent_id!]?.purchaser_id]?.name ??
                '-',
            }
          }) ?? []

      // 非虚拟批次
      const noVirtualBatchList =
        JSON.stringify(batches) === '{}'
          ? []
          : batch_details
              ?.filter((item) => item.is_virtual_batch === false)
              .map((item) => {
                const batch_parent_id = item.batch_parent_id
                return {
                  ...batches![batch_parent_id!],
                  // 使用 batch_details 里面的库存
                  ...item,
                  parent_id: batch_parent_id,
                  batch_delete_time: batches![batch_parent_id!]
                    ? batches![batch_parent_id!]?.delete_time
                    : '',
                  in_stock_time: batches![batch_parent_id!]
                    ? batches![batch_parent_id!]?.in_stock_time
                    : '',
                  supplier_name:
                    suppliers![batches![batch_parent_id!].supplier_id]?.name ??
                    '-',
                  purchaser_name:
                    group_users![batches![batch_parent_id!]?.purchaser_id]
                      ?.name ?? '-',

                  // 获取子批次的 batch_id
                  batch_id:
                    sub_batches![batch_parent_id]?.sub_batches[item?.shelf_id]
                      ?.batch_id ?? '',
                }
              })

      const categories = {
        category_name_1:
          category1_id !== '0'
            ? category_map?.[category1_id!].category_name
            : '',
        category_name_2:
          category2_id !== '0'
            ? category_map?.[category2_id!].category_name
            : '',
        category_name_3:
          category3_id !== '0'
            ? category_map?.[category3_id!].category_name
            : '',
      }

      const sku_maps = {
        sku_name: sku_map!.name,
        sku_base_unit_id: sku_map?.base_unit_id!,
        sku_type: sku_map?.sku_type!,
        units: sku_map?.units,
        sku_base_unit_name: globalStore.getUnitName(sku_map?.base_unit_id!),
        second_base_unit_ratio: sku_map?.second_base_unit_ratio,
      }
      return {
        ...item,
        // 非后端需要的参数
        ...sku_maps,
        ...categories,
        no_tax_amount: item.amount, // 出库成本
        batch_selected: noVirtualBatchList
          ?.map((item) => {
            const { stock, input_stock } = item
            return {
              ...item,
              batch_average_price: +stock!.base_unit?.price!,
              sku_base_quantity: +input_stock?.input?.quantity!,
              sku_base_quantity_show: toFixedSalesInvoicing(
                +input_stock?.input?.quantity!,
              ),
              sku_base_unit_name: globalStore.getUnit(
                stock?.base_unit?.unit_id!,
              ).text!,
              sku_stock_base_quantity: stock?.base_unit?.quantity!,
              // input_stock: item.
            }
          })
          .concat(virtualBatchList),
        base_quantity: item.input_stock.input?.quantity,
        no_tax_base_price: item.input_stock?.input?.price,

        second_base_unit_name:
          globalStore.getUnitName(item?.second_base_unit_id) ?? '',
        currStockQuantity,
      }
    })
  }

  /** 获取单个销售出库单 */
  fetchStockSheet(sheet_id: string) {
    // 接口请求
    return GetSaleOutStockSheet({
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
  async updateAndGetReceipt(
    receiptAction: ReceiptStatusKey,
    isUseAutoBatch = false,
  ) {
    this.changeReceiptLoading(true)

    await this.updateReceipt(receiptAction, isUseAutoBatch).catch((err) => {
      this.changeReceiptLoading(false)
      throw Promise.reject(new Error(err))
    })
    return this.fetchAndAdapterStockSheet(
      this.receiptDetail.sale_out_stock_sheet_id!,
    )
      .then(() => {
        this.changeReceiptLoading(false)
        return null
      })
      .catch(() => {
        this.changeReceiptLoading(false)
      })
  }

  /** 请求货位 */
  fetchShelf() {
    return ListShelf({
      with_deleted: true,
      warehouse_id: this.receiptDetail.warehouse_id,
    }).then((json) => {
      this.allShelfResponse = json.response.shelves

      return json
    })
  }

  /** 请求客户列表 */
  fetchCustomer() {
    return ListCustomer({ paging: { limit: 999 }, level: 2 }).then((json) => {
      this.customerList = adapterMoreSelectComData(
        json.response.customers!,
        'customer_id',
        'name',
      )
      return json
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
}

export default new Store()
export type { PDetail, RDetail }
