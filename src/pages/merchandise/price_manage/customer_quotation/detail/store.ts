import { makeAutoObservable, runInAction } from 'mobx'
import {
  GetQuotation,
  Quotation,
  DeleteQuotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'

class ListStore {
  /** 报价单ID */
  quotation_id = ''
  /** 报价单详情 */
  quotation: Quotation = {
    quotation_id: '',
    type: 0,
  }

  /** 周期报价单父报价单 */
  parentQuotationId = ''
  parentQuotation: Quotation = {
    quotation_id: '',
    type: 0,
  }

  /** 报价单类型 */
  type: Quotation_Type = Quotation_Type.UNSPECIFIED

  /** 子报价单数量 */
  childCount = 0
  /** 商品数量 */
  merchandiseCount = 0
  /** 组合商品数量 */
  combineCount = 0
  /** 客户数量 */
  clientCount = 0

  loading = true

  get currentQuotationId() {
    if (this.type === Quotation_Type.PERIODIC) {
      return this.parentQuotationId
    }
    return this.quotation_id
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initStore() {
    this.quotation_id = ''
    this.quotation = { quotation_id: '', type: 0 }
  }

  // 存报价单Id
  setQuotationId(id: string) {
    this.quotation_id = id
  }

  setQuotation(quotation: Quotation) {
    this.quotation = quotation
  }

  setParentQuotationId(id: string) {
    this.parentQuotationId = id
  }

  setParentQuotation(quotation: Quotation) {
    this.parentQuotation = quotation
  }

  setType(type: number) {
    this.type = type
  }

  /**
   * 修改子报价单数量
   */
  setChildCount(count: number) {
    this.childCount = count
  }

  getQuotationRequest(quotation_id: string) {
    return GetQuotation({
      quotation_id,
    })
      .then((json) => {
        const {
          quotation = { quotation_id: '', type: 0 },
          child_quotation_quantity,
        } = json.response
        if (quotation.type === Quotation_Type.PERIODIC) {
          this.parentQuotation = quotation
          this.childCount = Number(child_quotation_quantity)
        } else {
          this.quotation = quotation
        }
        const { sku_count, normal_sku_count, customer_count } =
          json.response.quotation
        this.merchandiseCount = Number(normal_sku_count) || 0
        this.combineCount =
          Number(sku_count) > Number(normal_sku_count)
            ? Number(sku_count) - Number(normal_sku_count)
            : 0
        this.clientCount = Number(customer_count)

        return json.response
      })
      .finally(() => {
        runInAction(() => {
          this.loading = false
        })
      })
  }

  /* 获取报价单详情 */
  getQuotation(quotation_id?: string) {
    this.loading = true
    const quotationId =
      this.type === Quotation_Type.PERIODIC
        ? this.parentQuotationId
        : this.quotation.quotation_id
    this.getQuotationRequest(quotation_id || quotationId)
  }

  /** 删除报价单 */
  deleteQuotation() {
    const { type, quotation_id, parentQuotationId } = this
    const isPeriodic = type === Quotation_Type.PERIODIC
    return DeleteQuotation({
      quotation_id: isPeriodic ? parentQuotationId : quotation_id,
    })
  }

  setMerchangdiseCount(count: number) {
    this.merchandiseCount = count
  }

  setCombineCount(count: number) {
    this.combineCount = count
  }

  setClientCount(count: number) {
    this.clientCount = count
  }

  clearStore() {
    this.childCount = 0
    this.merchandiseCount = 0
    this.combineCount = 0
    this.clientCount = 0
    this.quotation_id = ''
    this.type = 0
    this.parentQuotationId = ''
  }
}

export default new ListStore()
