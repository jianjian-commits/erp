import { makeAutoObservable, toJS } from 'mobx'
// import { Quotation_Status } from 'gm_api/src/merchandise'
import {
  ListSku,
  Quotation_Status,
  ListSkuRequest_RequestData,
  Quotation,
  CreateQuotationBasicPrice,
  Quotation_Type,
  ListQuotationV2,
  ListQuotationV2Response,
  // ListQuotationResponse,
  UpdateQuotationBasicPrice,
  ListSsuByCustomerOrQuotation,
  SsuTotalInfo,
  ExportQuotation,
  // BasicPrice_PriceType,
  // ListSkuRequest_RequestData
  BasicPriceId,
  DeleteBasicPrice,
  ListBasicPrice,
  ListBasicPriceResponse,
  CreateQuotationBasicPriceRequest_ProtocolSheet,
  ListBasicPriceV2,
  ListBasicPriceV2Response,
  ListSkuV2,
  CategoryTreeCache_CategoryInfo,
} from 'gm_api/src/merchandise'
import { SortBy } from 'gm_api/src/common'
import { SheetType, HeaderInfoType } from './type'
import type { Supplier, GroupUser } from 'gm_api/src/enterprise'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import type { SsuInfo } from 'gm_api/src/merchandise'
import type { MoreSelectDataItem } from '@gm-pc/react'
import _ from 'lodash'
import { toFixedByType, toFixed, getCategoryName } from '@/common/util'
import Big from 'big.js'

interface CreateQuotationBasicPriceType {
  [key: string]: CreateQuotationBasicPriceRequest_ProtocolSheet
}

type SelectItem = MoreSelectDataItem<string>

const initHeaderInfo: HeaderInfoType = {
  serial_no: '',
  supplier: [],
  supplier_name: '',
  start_time: undefined,
  end_time: undefined,
  remark: '',
  status: Quotation_Status.STATUS_VALID,
  operator: '',
  create_time: undefined,
  update_time: undefined,
  last_operator: '',
  quotation_id: '',
}

const initSheet: SheetType = {
  skuName: '',
  skuId: '',
  purchase_unit_name: '',
  ssuSelectData: [],
  categoryName: '',
  price: '',
  measUnit: '', // 采购单位id
  rate: '',
  isEditing: true,
  quotation_id: '',
  basic_price: {},
  input_tax: '0',
  purchase_unit_id: '',
  // ssuId: '',
  // pkgPrice: '',
  // pkgUnit: '',
  // unitId: '',
}

class Store {
  headerInfo: HeaderInfoType = { ...initHeaderInfo }
  list: SheetType[] = [{ ...initSheet }]
  quotation: any = {}
  deleteBasicPrices: BasicPriceId[] = []
  /**
   * @description: 需要保存操作过的select啊
   */
  saveSelectItem: SelectItem[] = []

  constructor() {
    makeAutoObservable(this)
  }

  get headerEditAble() {
    return (
      this.headerInfo.status === Quotation_Status.STATUS_WAIT_VALID ||
      this.headerInfo.status === Quotation_Status.STATUS_VALID
    )
  }

  /**
   * @description: 存东西，但是要根据list来变化
   * @param {number} index
   * @param {string} type
   * @param {SelectItem} value
   */
  dealSelect(selected: SelectItem[], supplier_id: string) {
    if (selected.length === 0) return
    const invoice_type =
      this.headerInfo?.supplier.attrs?.china_vat_invoice?.invoice_type
    const list = _.map(selected, (item, index) => {
      return {
        ...this.list[index],
        input_tax:
          invoice_type === ChinaVatInvoice_InvoiceType.VAT_SPECIAL
            ? item?.supplier_input_taxs?.supplier_input_tax?.[supplier_id] ??
              item.input_tax ??
              0
            : 0,
      }
    })
    /**
     * @description: 改变list
     */
    this.list = [...list]
  }

  changeSaveSelectItem(index: number, type?: string, value?: SelectItem) {
    if (type === 'delete') return this.saveSelectItem.splice(index, 1)
    if (value) {
      this.saveSelectItem.splice(index, 1, value)
    }
  }

  updateHeaderInfo<T extends keyof HeaderInfoType>(
    key: T,
    value: HeaderInfoType[T],
  ) {
    this.headerInfo[key] = value
    /**
     * @description: 修改后的供应商来判断商品的税率问题
     */
    if (key === 'supplier') {
      this.dealSelect(this.saveSelectItem, this.headerInfo.supplier.supplier_id)
    }
  }

  resetData() {
    this.list = [{ ...initSheet }]
    this.headerInfo = { ...initHeaderInfo }
    this.quotation = {}
    this.deleteBasicPrices = []
    this.saveSelectItem = []

    // this.basic_prices = []
  }

  changeListEditState(state: boolean) {
    // this.list[0].isEditing = true
    _.forEach(this.list, (item, index) => {
      item.isEditing = state
    })
  }

  addRow(index = this.list.length) {
    this.list.splice(index + 1, 0, { ...initSheet })
  }

  deleteRow(index: number) {
    const deleteItem = this.list.splice(index, 1)[0]
    if (deleteItem.existing) {
      this.deleteBasicPrices.push({
        quotation_id: this.headerInfo.quotation_id || '',
        unit_id: deleteItem.measUnit, // 采购单位
        sku_id: deleteItem.skuId,
      })
    }
  }

  updateList(index: number, msg: any) {
    this.list[index] = {
      ...this.list[index],
      ...msg,
    }
  }

  // 删除某个商品名称
  delRowList(index: number) {
    this.list[index] = { ...this.list[index] }
  }

  collectCreateSheetData() {
    const supplier_id = this.headerInfo.supplier?.supplier_id
    const quotation: Omit<Quotation, 'quotation_id'> = {
      supplier_id,
      ..._.pick(this.headerInfo, ['end_time', 'remark', 'start_time']),
      type: Quotation_Type.PROTOCOL_PRICE,
    }

    const basic_prices = _.map(this.list, (e) => {
      return {
        sku_id: e.skuId,
        input_tax: e.input_tax,
        items: {
          basic_price_items: [
            {
              fee_unit_price: {
                val: e.price + '',
                unit_id: Number(e.purchase_unit_id),
              },
              order_unit_id: Number(e.purchase_unit_id),
            },
          ],
        },
      }
    })
    return { quotation, basic_prices }
  }

  collectUpdateSheetData() {
    const supplier_id = this.headerInfo.supplier?.supplier_id
    const quotation: Quotation = {
      ...this.quotation,
      // quotation_id: '',
      supplier_id,
      ..._.pick(this.headerInfo, [
        'end_time',
        'remark',
        'start_time',
        'status',
        'quotation_id',
      ]),
    }
    const basic_prices = _.map(this.list, (e, index) => {
      return {
        ...e.basic_price,
        sku_id: e.skuId,
        price: e.price,
        // unit_id: e.unitId,
        // ssu_id: e.ssuId,
        quotation_id: this.quotation.quotation_id,
        // price_type: BasicPrice_PriceType.PRICE_TYPE_AGREEMENT,
        input_tax: e.input_tax,
        items: {
          basic_price_items: [
            {
              fee_unit_price: {
                val: e.price + '',
                unit_id: Number(e.purchase_unit_id),
              },
              order_unit_id: Number(e.purchase_unit_id),
            },
          ],
        },
      }
    })

    return { quotation, basic_prices }
  }

  updateSheet() {
    const { quotation, basic_prices } = this.collectUpdateSheetData()
    return UpdateQuotationBasicPrice({ quotation, basic_prices })
  }

  createSheet() {
    const ProtocolSheet = this.collectCreateSheetData()

    const sheets = { abc: ProtocolSheet } as CreateQuotationBasicPriceType

    return CreateQuotationBasicPrice({ sheets }).then((res) => {
      return res.response
    })
  }

  sortDataFromSupplier(
    supplier_id: string,
    supplier_relation: { [key: string]: Supplier },
  ) {
    const supplier: any = { ...supplier_relation[supplier_id] }
    const supplier_name = supplier?.name || ''
    const supplier_code = supplier?.customized_code || ''
    supplier.text = supplier_name
    supplier.value = supplier_id
    return { supplier, supplier_name, supplier_code }
  }

  sortDataFromGroupUser(
    creator_id: string,
    latest_op_uid: string,
    group_user_relation: { [key: string]: GroupUser },
  ) {
    const operatorObj = group_user_relation[creator_id]
    const lastOperatorObj = group_user_relation[latest_op_uid]
    const operator = operatorObj?.name || ''
    const last_operator = lastOperatorObj?.name || ''
    return { operator, last_operator }
  }

  sortDataFromQuotationAndGroupUser(
    quotation: Quotation,
    group_user_relation: { [key: string]: GroupUser },
  ) {
    const creator_id = quotation.creator_id || ''
    const latest_op_uid = quotation?.latest_op_uid || ''
    return {
      ..._.pick(quotation, [
        'create_time',
        'quotation_id',
        'serial_no',
        'supplier_id',
        'start_time',
        'end_time',
        'status',
        'remark',
        'quotation_id',
        'update_time',
        // 'latest_op_uid',
      ]),
      ...this.sortDataFromGroupUser(
        creator_id,
        latest_op_uid,
        group_user_relation,
      ),
    }
  }

  sortHeaderInfoData(res: ListQuotationV2Response) {
    const quotation = res.quotations[0]
    const supplier_relation = res.supplier_relation || {}
    const group_user_relation = res.group_users || {}
    const supplier_id = quotation.supplier_id || ''
    return {
      ...this.sortDataFromQuotationAndGroupUser(quotation, group_user_relation),
      ...this.sortDataFromSupplier(supplier_id, supplier_relation),
    }
  }

  sortCopyHeaderInfoData(res: ListQuotationV2Response) {
    const quotation = res.quotations[0]
    const supplier_relation = res.supplier_relation || {}
    const supplier_id = quotation.supplier_id || ''
    return {
      ..._.pick(quotation, ['supplier_id', 'remark']),
      ...this.sortDataFromSupplier(supplier_id, supplier_relation),
    }
  }

  sortDataFromSsu(sku: any) {
    const rate = sku.units.rate
    // 计量单位
    // const measUnit = globalStore.unitMap[sku.units.parent_id].name
    // 包装单位
    const pkgUnit = sku.units.name
    const unitId = sku.units.unit_id
    const ssuId = sku.ssu_id
    return { rate, pkgUnit, unitId, ssuId }
  }

  // 拉列表改用了新接口，先把旧接口留着，避免以后又改
  sortListData(ssu_infos: SsuTotalInfo[]) {
    return _.map(ssu_infos, (info, index) => {
      const { rate, measUnit, pkgUnit, unitId, ssuId } = this.sortDataFromSsu(
        info.ssu,
      )
      const price = info.price || '0'

      return {
        basic_price: info.basic_price,
        price: toFixed(new Big(price), 2),
        categoryName:
          info.category_infos?.map((v) => v.category_name)?.join('/') || '未知',
        skuName: info.sku?.name || '',
        skuId: info.sku?.sku_id || '',
        rate,
        measUnit,
        pkgUnit,
        unitId,
        ssuId,
        // pkgPrice: String(rate * Number(price)),
        pkgPrice: toFixed(new Big(rate * Number(price)), 2),
        ssuSelectData: [],
        isEditing: false,
        existing: true,
        input_tax: info?.basic_price?.input_tax || 0,
      }
    })
  }

  sortNewListData(req: ListBasicPriceV2Response) {
    const { basic_prices, sku_map, category_map } = req
    // const basic_prices = req.basic_prices
    // const ssu_info_relation = req.ssu_info_relation || {}
    return _.map(basic_prices, (basic_price, index) => {
      const sku_id = basic_price.sku_id
      const sku = sku_map?.[sku_id!]
      const category_id = sku?.category_id
      const basic_price_items = basic_price.items.basic_price_items
      const purchase_unit_id = basic_price_items[0].fee_unit_price.unit_id
      const { rate, unitId, ssuId } = this.sortDataFromSsu(sku)
      const price = basic_price?.min_price || '0'
      return {
        basic_price,
        price: toFixed(new Big(price), 2),
        purchase_unit_id,
        purchase_unit_name:
          globalStore.getPurchaseUnitName(
            sku?.units?.units,
            purchase_unit_id,
          ) || globalStore.getUnitName(purchase_unit_id),
        categoryName:
          getCategoryName(
            category_map as Record<string, CategoryTreeCache_CategoryInfo>,
            category_id!,
          ) || '未知',
        skuName: sku?.name,
        skuId: sku?.sku_id,
        rate,
        unitId,
        ssuId,
        // pkgPrice: toFixed(new Big(rate * Number(price)), 2),
        ssuSelectData: [],
        isEditing: false,
        input_tax: basic_price?.input_tax || 0,
        existing: true,
      }
    })
  }

  getSheetList(quotation_id: string) {
    const req = {
      filter_params: { quotation_id },
      paging: { limit: 999 },
      sort_by: [{ field: 1, desc: true }],
    }
    return ListBasicPriceV2(req).then((res) => {
      this.list = this.sortNewListData(res.response)
      return res.response
    })
  }

  getQuotation(quotation_id: string, type?: 'copy') {
    return ListQuotationV2({
      filter_params: { quotation_id },
      paging: { limit: 1 },
    }).then((res) => {
      this.headerInfo =
        type === 'copy'
          ? this.sortCopyHeaderInfoData(res.response)
          : this.sortHeaderInfoData(res.response)
      // this.headerInfo = this.sortHeaderInfoData(res.response)
      this.quotation = res.response.quotations[0]
      return res.response
    })
  }

  generateSsuSelectData(ssuInfos: SsuInfo[]) {
    return ssuInfos!.map((info) => {
      const { rate, measUnit, pkgUnit, unitId, ssuId } = this.sortDataFromSsu(
        info.ssu,
      )
      return {
        text: `${rate}${measUnit}/${pkgUnit}`,
        value: `${rate}/${measUnit}/${pkgUnit}/${unitId}/${ssuId}`,
        // value: unit_id,
      }
    })
  }

  exportQuotation(quotation_id: string) {
    return ExportQuotation({ quotation_id }).then((res) => {
      return res.response
    })
  }

  getAllSkuUnitSelectData() {
    const sku_ids = _.map(this.list, (item) => item.skuId)
    const req = {
      filter_params: {
        sku_ids,
      },
      paging: { limit: 999 },
      request_data: ListSkuRequest_RequestData.SSU,
    }
    return ListSkuV2(req).then((res) => {
      const { skus, category_map } = res.response

      // const sku_infos = res.response.sku_infos!
      // const sku_id = res.response.sku_infos.
      _.forEach(skus, (sku) => {
        // const ssuSelectData: MoreSelectDataItem<string>[] =
        //   this.generateSsuSelectData(sku.ssu_infos!)
        const sku_id = sku?.sku_id
        const name = sku?.name || ''
        _.forEach(this.list, (item) => {
          if (item.skuId === sku_id) {
            // item.ssuSelectData = ssuSelectData
            item.skuName = name
          }
        })
      })
      return res.response
    })
  }
}

export default new Store()
