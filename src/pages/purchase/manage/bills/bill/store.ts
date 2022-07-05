/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { computed, makeAutoObservable } from 'mobx'
import Big from 'big.js'
import _ from 'lodash'
import {
  PurchaseSheet,
  GetPurchaseSheet,
  PurchaseSheet_SheetDetails,
  PurchaseSheet_Status,
  ExportPurchaseOrder,
  ExportPurchaseOrderRequest,
  ExportPurchaseOrderType,
} from 'gm_api/src/purchase'
import {
  Sku_SupplierCooperateModelType,
  ListSkuV2,
  ListSkuV2Request,
} from 'gm_api/src/merchandise'
import type { BasicPrice, SsuId } from 'gm_api/src/merchandise'
import type {
  BillInfo,
  BillSku,
  NegotiatedTax,
  MerchandiseInfo,
} from './interface'
import { toFixed } from '@/common/util'
import { ListStockSheet, StockSheet_SheetType } from 'gm_api/src/inventory'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'

import { getCategoryName } from '@/common/util/sku'
import globalStore from '@/stores/global'

/**
 * @param {purchase_amount,purchase_sale_amount,purchase_price,no_tax_purchase_price,purchase_money,no_tax_purchase_money,plan_amount,plan_sale_amount,tax_money,tax_rate}
 * @param {采购基本单位,采购销售单位,采购单价(计量单位),不含税采购单价(计量单位),采购金额,不含税采购金额,计划采购计量单位,计划采购包装单位,税额,税率}
 */

export const initBill: BillSku = {
  purchase_amount: 0,
  purchase_price: undefined,
  no_tax_purchase_price: undefined,
  purchase_money: undefined,
  no_tax_purchase_money: undefined,
  plan_amount: undefined,
  tax_money: 0,
  tax_rate: 0,
  remark: '',
  name: '',
  sku_type: 2,
  dispatch_type: 1,
  category_name: '',
  manufacture_date: '',
  sku_id: '',
  spu_id: '',
  base_unit_id: '',
  purchase_task_serial_no: '',
  out_stock_unit_value: undefined,
  supplier_cooperate_model_type:
    Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
  purchase_unit_name: '-',
  levelData: [], // 商品等级的data集合
  sku_level_filed_id: '',
}

const initInfo = {
  supplier: undefined,
  purchase: undefined,
  receive_time: undefined,
  remark: '',
  status: PurchaseSheet_Status.UNSPECIFIED,
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  info: BillInfo = { ...initInfo }

  list: BillSku[] = [{ ...initBill }]

  originalList: BillSku[] = []
  /**
   * @description: 存储商品的本身信息
   */
  merchandise_info: MerchandiseInfo[] = []

  /**
   * @description: 存储报价单税率
   */
  negotiated_tax: NegotiatedTax[] = []

  loading = true

  agreementPriceState = true

  raw_details: any = {}
  details: any = {}

  /**
   * @description 采购协议价,根据判断是否为0 来定义有无采购协议价
   */
  basic_price = 0

  /**
   * @description 协议价状态
   */
  setAgreementPriceState(state: boolean) {
    this.agreementPriceState = state
  }

  setNegotiatedTax(index: number, value: NegotiatedTax) {
    this.negotiated_tax.splice(index, 1, value)
  }

  setMerchiseInfo(index: number, value: MerchandiseInfo) {
    this.merchandise_info.splice(index, 1, value)
  }

  deleteNegotiatedTax(index: number) {
    this.negotiated_tax.splice(index, 1)
  }

  deleteMerchiseInfo(index: number) {
    this.merchandise_info.splice(index, 1)
  }

  /**
   * @description 不含税采购单价：不可修改，自动计算“采购单价/(1+税率)”，四舍五入至两位小数，采购单价使用小数两位的原始数据进行计算
   */
  @computed
  no_tax_purchase_price(idx: number) {
    const { purchase_price, tax_rate } = this.list[idx]
    return +Big(purchase_price! ?? 0).div(
      Big(tax_rate ?? 0)
        .times(0.01)
        .add(1),
    )
  }

  /**
   * @description 不含税采购金额：不可修改，自动计算“采购金额/(1+税率)”，四舍五入至两位小数，采购金额使用小数两位的原始数据进行计算
   **/
  @computed
  no_tax_purchase_money(idx: number) {
    const { purchase_money, tax_rate } = this.list[idx]
    const value = Big(purchase_money! ?? 0)
      .div(
        Big(tax_rate ?? 0)
          .times(0.01)
          .add(1),
      )
      .toFixed(2)
    return value
  }

  /**
   * @description 税额：不可修改，自动计算“采购金额/(1+税率)*税率”，四舍五入至小数后两位，采购金额使用小数两位的原始数据进行计算
   */
  @computed
  tax_money(idx: number) {
    const { purchase_money, tax_rate } = this.list[idx]
    const no_tax_purchase_money = Big(purchase_money! ?? 0)
      .div(
        Big(tax_rate ?? 0)
          .times(0.01)
          .add(1),
      )
      .toFixed(4)
    const value = Big(purchase_money! ?? 0)
      .sub(no_tax_purchase_money ?? 0)
      .abs()
      .toFixed(4)
    return value
  }

  init() {
    this.info = { ...initInfo }
    this.list = [{ ...initBill }]
    this.details = {}
    this.raw_details = {}
    this.merchandise_info = []
    this.negotiated_tax = []
  }

  /**
   * @description 增加一行
   */
  addRow(index = this.list.length) {
    this.list.splice(index + 1, 0, { ...initBill })
  }

  /**
   * @description 修改一行
   */
  updateRow(index: number, row: any) {
    this.list[index] = { ...row }
  }

  /**
   * @description 删除一行
   */
  deleteRow(index: number) {
    this.list.splice(index, 1)
  }

  /**
   * @description 修改rowF
   */
  updateRowColumn<T extends keyof BillSku>(
    index: number,
    key: T,
    value: BillSku[T],
  ) {
    this.list[index][key] = value
  }

  setBasicPrice(value: number) {
    this.basic_price = value
  }

  infoUpdate<T extends keyof BillInfo>(key: T, value: BillInfo[T]) {
    this.info[key] = value
  }

  /**
   * @description 获取单据详情
   */
  getSheetDetail(): PurchaseSheet_SheetDetails {
    return {
      details: this.list
        .filter((v) => v.sku_id)
        .map((v) => {
          const inputValue = {
            unit_id: v.purchase_unit_id!,
            quantity: `${v.purchase_amount || 0}`,
            price: `${v.purchase_price || 0}`,
          }
          const planInputValue = {
            unit_id: v.purchase_unit_id!,
            quantity: `${v.purchase_amount ?? 0}`,
            price: `${v.purchase_price || 0}`,
          }

          const detail: any = {
            detail_id: v.detail_id,
            raw_detail_id: v.raw_detail_id,
            receive_customer_id: v.receive_customer_id,
            sku_id: v.sku_id!,
            sku_revision: v?.revision! || undefined,
            unit_id: v.purchase_unit_id!,
            purchase_value: {
              input: inputValue,
              calculate: inputValue,
            },
            purchase_task_serial_no: v.purchase_task_serial_no,
            purchase_task_id: (v.purchase_task_ids || [])[0] || undefined,
            remark: v.remark,
            tax_price: `${v.purchase_price || 0}`,
            input_tax: v.tax_rate,
            manufacture_date: +v.manufacture_date || undefined,
            sku_level_filed_id: v.sku_level_filed_id || undefined,
            plan_value: {
              input: planInputValue,
              calculate: planInputValue,
            },
            supplier_cooperate_model_type: v.supplier_cooperate_model_type,
            out_stock_unit_value: v.out_stock_unit_value,
          }
          return detail
        }),
    }
  }

  async getUpdateParams(isDraft: boolean): Promise<Partial<PurchaseSheet>> {
    const { info } = this
    const { supplier, purchase, remark, receive_time, ...rest } = info
    const req: any = {
      ...rest,
      supplier_id: supplier?.value,
      purchaser_id: purchase?.value,
      remark: remark,
      receive_time: receive_time ? '' + receive_time : '0',
      status: isDraft
        ? PurchaseSheet_Status.DRAFT
        : PurchaseSheet_Status.COMMIT,
      app_type: 1,
    }
    if (this.raw_details?.details?.length > 0) {
      const raw_details = this.getSheetDetail()
      req.raw_details = raw_details
      req.details = this.details
    } else {
      req.details = this.getSheetDetail()
    }
    return Promise.resolve(req)
  }

  async getCreateParams(isDraft: boolean): Promise<Partial<PurchaseSheet>> {
    const { info } = this
    const { supplier, purchase, remark, receive_time } = info
    return Promise.resolve({
      supplier_id: supplier?.value,
      purchaser_id: purchase?.value,
      remark: remark,
      receive_time: receive_time ? '' + receive_time : '0',
      status: isDraft
        ? PurchaseSheet_Status.DRAFT
        : PurchaseSheet_Status.COMMIT,
      details: this.getSheetDetail(),
      app_type: 1,
    })
  }

  // 获取表格数据
  fetchBill(id: string) {
    this.loading = true
    return GetPurchaseSheet({
      purchase_sheet_id: id,
    }).then((json) => {
      const { details, raw_details, ...rest } = json.response.purchase_sheet
      this.raw_details = raw_details
      this.details = details
      const groupUsers = json.response?.group_users || {}
      const suppliers = json.response?.suppliers || {}
      const skus = json.response?.sku_snap_map || {}
      const category_map = json.response?.category_map!
      // const ssuSnaps = json.response?.ssu_snaps || {}
      const purchaser = rest.purchaser_id && groupUsers[rest.purchaser_id]
      const supplier = rest.supplier_id && suppliers[rest.supplier_id]
      const creator = rest.creator_id && groupUsers[rest.creator_id]
      // 信息
      this.info = {
        ...rest,
        creator: creator || undefined,
        purchase: purchaser
          ? {
              ...purchaser,
              value: purchaser?.group_user_id,
              text: purchaser.name,
            }
          : undefined,
        supplier: supplier
          ? {
              ...supplier,
              value: supplier.supplier_id,
              text: supplier.name,
            }
          : undefined,
      }
      // 诗奎要求有raw_details先用raw_details，否则用details
      const trueDetails = raw_details?.details?.length ? raw_details : details
      const { status } = this.info
      const isCommitted = status === (PurchaseSheet_Status.COMMIT as number)

      const data = trueDetails?.details?.map((v) => {
        // 采购税率
        this.negotiated_tax = trueDetails?.details?.map((item) => {
          return {
            sku_id: item.sku_id,
            negotiated_tax: '0',
            // unit_id: item.unit_id,
          }
        }) as NegotiatedTax[]
        // 商品的税率
        this.merchandise_info = trueDetails?.details?.map((item) => {
          return {
            sku_id: item.sku_id,
            supplier_tax: {},
            input_tax: '0',
            // unit_id: item.unit_id,
          }
        }) as MerchandiseInfo[]

        // 取sku
        const sku = skus?.[[v.sku_id] + '_' + [v.sku_revision]]

        // 这个是采购单位
        const purchase_unit_name =
          globalStore.getUnitName(sku?.purchase_unit_id!) ||
          globalStore.getPurchaseUnitName(
            sku?.units?.units,
            sku?.purchase_unit_id!,
          )

        const unitValue = v.purchase_value

        // 到货数量
        const out_stock_unit_value = v.out_stock_unit_value

        // 采购金额
        const purchase_money = isCommitted
          ? toFixed(
              Big(out_stock_unit_value?.calculate?.quantity || 0).times(
                Big(+v?.tax_price! || 0),
              ),
            )
          : toFixed(
              Big(
                Number(unitValue?.input?.quantity) ||
                  v.plan_value?.input?.quantity ||
                  0,
              ).times(Big(+v?.tax_price! || 0)),
            )
        // 已提交时 采购金额 = 预计到货数 * 采购单价
        // 未提交时 采购金额 = 采购数量 * 采购单价

        // 不含税采购金额
        const no_tax_purchase_money = isCommitted
          ? toFixed(
              Big(out_stock_unit_value?.calculate?.quantity || 0).times(
                Big(+unitValue?.input?.price! || 0),
              ),
            )
          : toFixed(
              Big(unitValue?.input?.quantity || 0).times(
                Big(+unitValue?.input?.price! || 0),
              ),
            )
        // 如果有需求数就是需求数否则就是采购数在未完成单据的情况下
        const purchase_amount = isCommitted
          ? +toFixed(Big(+unitValue?.input?.quantity! || 0))
          : !Number(unitValue?.input?.quantity)
          ? +toFixed(+Big(v.plan_value?.calculate?.quantity || 0))
          : +toFixed(Big(+unitValue?.input?.quantity! || 0))

        const plan_amount =
          !isCommitted && !Number(v.plan_value?.calculate?.quantity)
            ? 0
            : Big(v.plan_value?.calculate?.quantity || 0).toFixed(4)

        // 商品等级
        const levelData =
          sku?.sku_level?.sku_level?.length! > 0
            ? _.map(sku.sku_level?.sku_level!, (level) => {
                return {
                  ...level,
                  text: level.name,
                  value: level.level_id,
                }
              })
            : []

        return {
          ...sku,
          ...v,
          _isOld: !!v.purchase_task_serial_no,
          purchase_unit_name,
          category_name:
            getCategoryName(category_map, sku?.category_id!) || '未知',
          purchase_amount,
          purchase_price: toFixed(+v?.tax_price! || 0),
          purchase_task_ids: v.purchase_task_id ? [v.purchase_task_id] : [],
          purchase_money,
          no_tax_purchase_price: +unitValue?.input?.price! || 0,
          no_tax_purchase_money,
          tax_money: Big(purchase_money).minus(no_tax_purchase_money),
          tax_rate: v?.input_tax,
          manufacture_date:
            v.manufacture_date === '0' ? '' : v.manufacture_date,
          plan_amount,
          levelData,
          sku_level_filed_id:
            v.sku_level_filed_id === '0' ? '' : v.sku_level_filed_id,
          out_stock_unit_value: v.out_stock_unit_value,
        }
      })

      this.list = data as unknown as BillSku[]
      this.loading = false

      // const sku_ids: string[] = details?.details?.map(
      //   (item) => item.sku_id,
      // ) as string[]
      // const paging = { limit: 999 }
      // // eslint-disable-next-line promise/no-nesting
      // this.fetchListSku({
      //   sku_ids,
      //   paging,
      // })
      // return json.response
    })
  }

  fetchListSku(req: ListSkuV2Request, type?: boolean) {
    ListSkuV2({ ...req }).then((res) => {
      const sku_infos = res.response.skus
      _.each(this.merchandise_info, (item) => {
        const index = _.findIndex(sku_infos, function (o) {
          return o?.sku_id === item.sku_id
        })

        if (index !== -1) {
          item.supplier_tax =
            sku_infos?.[index]?.supplier_input_taxs?.supplier_input_tax
          item.input_tax = sku_infos?.[index]?.input_tax!
        }
      })
      if (type) {
        this.dealWithTaxRatio()
      }
      return res.response
    })
  }

  fetchListStockSheet(id: string) {
    return ListStockSheet({
      related_sheet_ids: [id],
      stock_sheet_type: StockSheet_SheetType.SHEET_TYPE_PURCHASE_IN,
      paging: { limit: 19 },
      with_additional: true,
    })
  }

  /**
   * @description: 获取当前供应商下面商品的协议价税率
   */
  fetchListBasicPrice() {
    // 结合supplier_ids和ssu_ids的问题
    const supplier_ids = [this.info.supplier?.value!]
    const ssu_ids = _.map(this.merchandise_info, (item) => {
      return {
        sku_id: item.sku_id,
        unit_id: item.unit_id,
      }
    }) as SsuId[]
    return true
    // TODO: 现在没有采购协议价
    // ListBasicPriceV2({
    //   supplier_ids,
    //   ssu_ids,
    //   paging: { limit: 999 },
    //   price_type: BasicPrice_PriceType.PRICE_TYPE_AGREEMENT,
    //   statuses: [Quotation_Status.STATUS_VALID],
    // }).then((res) => {
    //   const { basic_prices } = res.response

    //   this.dealWithNegotiatedTax(basic_prices)
    //   this.dealWithTaxRatio()
    //   this.dealWithPurchasePrice(basic_prices)
    //   return true
    // })
  }

  /**
   * @description 处理协议价(采购单位计量单位)
   * @description 暂无报价单
   */
  dealWithPurchasePrice(basic_prices: BasicPrice[]): boolean {
    if (basic_prices.length === 0) {
      _.each(this.list, (item) => {
        item.purchase_price = 0
      })
      return false
    }
    _.each(this.list, (item) => {
      const index = _.findIndex(basic_prices, function (o) {
        return o.sku_id === item.sku_id
      })
      if (index !== -1) {
        // 暂时用上max_price
        item.purchase_price = Number(basic_prices?.[index]?.max_price! || '')
      } else {
        item.purchase_price = 0
      }
    })
    return true
  }

  /**
   * @description 处理切换供应商时,如果有id，则原来有的数据的basicid为'',否则根据报价处理
   */
  dealWithNegotiatedTax(basic_prices: BasicPrice[]) {
    if (basic_prices.length === 0) {
      _.each(this.negotiated_tax, (item) => {
        item.negotiated_tax = undefined
      })
    }
    _.each(this.negotiated_tax, (item) => {
      item.negotiated_tax = undefined
    })

    _.each(this.negotiated_tax, (item) => {
      const index = _.findIndex(basic_prices, function (o) {
        return o.sku_id === item.sku_id
        // && o.unit_id === item.unit_id
      })
      if (index !== -1) {
        item.negotiated_tax = basic_prices[index].input_tax!
      }
    })
  }

  /**
   * @description 更改表格税率的问题
   */
  dealWithTaxRatio() {
    const invoice_type =
      this.info.supplier?.attrs?.china_vat_invoice?.invoice_type
    // TODO:没有采购协议价税率
    // if (this.agreementPriceState) {
    //   _.each(this.negotiated_tax, (item, index) => {
    //     const supplier_id = this.info.supplier?.supplier_id
    //     if (invoice_type !== ChinaVatInvoice_InvoiceType.VAT_SPECIAL) {
    //       this.updateRowColumn(index, 'tax_rate', 0)
    //     } else {
    //       if (item?.negotiated_tax !== undefined) {
    //         this.updateRowColumn(index, 'tax_rate', +item?.negotiated_tax! || 0)
    //       } else {
    //         this.updateRowColumn(
    //           index,
    //           'tax_rate',
    //           Number(
    //             this.merchandise_info?.[index]?.supplier_tax?.[supplier_id]! ??
    //               this.merchandise_info?.[index]?.input_tax! ??
    //               0,
    //           ),
    //         )
    //       }
    //     }
    //   })
    // } else {
    // }
    _.each(this.merchandise_info, (item, index) => {
      const supplier_id = this.info.supplier?.supplier_id
      if (invoice_type !== ChinaVatInvoice_InvoiceType.VAT_SPECIAL) {
        this.updateRowColumn(index, 'tax_rate', 0)
      } else {
        this.updateRowColumn(
          index,
          'tax_rate',
          Number(item?.supplier_tax?.[supplier_id]! ?? item?.input_tax! ?? 0),
        )
      }
    })
  }

  /**
   * @description 单据明细导出
   */
  billExport(
    type: ExportPurchaseOrderType,
    id: string,
    displayCustomerCode?: boolean,
  ) {
    const params: ExportPurchaseOrderRequest = {
      begin_time: this.info.create_time,
      end_time: this.info.create_time as string,
      order_ids: [id],
      supplier_ids: [],
      purchaser_ids: [],
      export_purchase_order_type: type,
      display_customized_code: displayCustomerCode || undefined,
    }
    return ExportPurchaseOrder(params)
  }
}

export default new Store()
