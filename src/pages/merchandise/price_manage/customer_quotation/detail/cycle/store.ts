import { t } from 'gm-i18n'
import { PagingParams } from 'gm_api/src/common'
import {
  DeleteQuotation,
  ListQuotationV2,
  Quotation,
  QuotationSortField,
  Quotation_Status,
  Quotation_Type,
  Sku_SkuType,
  UpdateQuotationV2,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import baseStore from '../store'

const initQuotation: Quotation = {
  quotation_id: '',
  type: 6,
}

class Store {
  /** 当前展示子报价单id */
  activeQuotationId = ''
  /** 当前展示子报价单信息 */
  get activeQuotation(): Quotation {
    const target = _.find(
      this.childQuotationList,
      (item) => item.quotation_id === this.activeQuotationId,
    )
    return target || initQuotation
  }

  /** 商品类型 */
  skuType = Sku_SkuType.NOT_PACKAGE
  /** 子报价单列表 */
  childQuotationList: Quotation[] = [initQuotation]
  /** 子报价单列表分页 */
  paging: PagingParams = { limit: 20, offset: 0 }
  /** 子报价单列表时间筛选 */
  periodicTime = ''
  /** 子报价单列表加载状态 */
  listLoading = false
  /** 子报价单列表是否有更多数据 */
  listHasMore = true
  /** 列表是否为空 */
  listIsEmpty = false

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  resetActiveQuotation(quotation = initQuotation) {
    this.activeQuotationId = quotation.quotation_id
  }

  setActiveQuotationId(id: string) {
    this.activeQuotationId = id
    const quotation = _.find(
      this.childQuotationList,
      (childItem) => childItem.quotation_id === id,
    )
    baseStore.setQuotationId(id)
    baseStore.setQuotation(quotation!)
  }

  setSkuType(type: Sku_SkuType) {
    this.skuType = type
  }

  setPeriodicTime(time: string) {
    this.periodicTime = time
    this.setPagingOffset(false)
  }

  setPagingOffset(isAdd: boolean) {
    if (isAdd) {
      this.paging.offset = (this.paging.offset as number) + 20
    } else {
      this.paging.offset = 0
      this.childQuotationList = []
    }

    this.getChildQuotationList()
  }

  setChildQuotationList(id: string, quotation?: Quotation) {
    const newList = _.cloneDeep(this.childQuotationList)

    const index = _.findIndex(
      newList,
      (childItem) => childItem.quotation_id === id,
    )
    if (quotation) {
      newList[index] = quotation
    }

    this.childQuotationList = newList
  }

  getChildQuotationList() {
    this.listLoading = true
    this.listIsEmpty = false

    if (this.paging.offset === 0) {
      this.childQuotationList = []
    }

    ListQuotationV2({
      filter_params: {
        quotation_type: Quotation_Type.PERIODIC,
        parent_quotation_ids: [baseStore.parentQuotationId],
        periodic_time: this.periodicTime || undefined,
      },
      sort_by: [
        {
          field: QuotationSortField.START_TIME,
          desc: true,
        },
      ],
      paging: this.paging,
    })
      .then((json) => {
        const { quotations, paging } = json.response
        if (this.paging.offset === 0 && _.isEmpty(quotations)) {
          this.listIsEmpty = true
        }
        if (quotations?.length) {
          if (!this.paging.offset) {
            const { quotation_id } = quotations[0]
            this.activeQuotationId = quotation_id || ''
            baseStore.setQuotationId(quotation_id || '')
            baseStore.setQuotation(
              quotations[0] || { quotation_id: '', type: 0 },
            )
          }
          if (this.childQuotationList.length) {
            this.childQuotationList.pop()
          }

          this.childQuotationList = [
            ...this.childQuotationList,
            ...quotations,
            initQuotation,
          ]
        } else {
          this.activeQuotationId = ''
        }
        if (!paging.has_more) {
          this.listHasMore = false
        }
      })
      .finally(() => {
        this.listLoading = false
      })
  }

  /**
   * 更新报价单
   */
  private _updateQuotation(quotation: Quotation) {
    return UpdateQuotationV2({
      quotation,
    })
  }

  /**
   * 更新本地报价单数据的状态
   */
  private _updateLocalQuotationStatus(
    quotationId: string,
    status: Quotation_Status,
  ) {
    this.childQuotationList = _.map(this.childQuotationList, (item) => {
      if (item.quotation_id === quotationId) {
        return { ...item, status }
      }
      return item
    })
  }

  /**
   * 更新报价单状态
   */
  private async _updateQuotationStatus(
    quotationId: string,
    status: Quotation_Status,
  ) {
    try {
      const target = _.find(
        this.childQuotationList,
        (item) => item.quotation_id === quotationId,
      )
      if (_.isNil(target)) {
        return Promise.reject(Error(t('未能找到相应报价单数据')))
      }
      const { response } = await this._updateQuotation({
        ...target,
        status,
      })
      return Promise.resolve(response.quotation)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * 禁用报价单
   */
  async disableQuotation(quotationId: string) {
    const status = Quotation_Status.STATUS_WAIT_VALID
    await this._updateQuotationStatus(quotationId, status)
    this._updateLocalQuotationStatus(quotationId, status)
  }

  /**
   * 启用报价单 / 通过审核
   */
  async enableQuotation(quotationId: string) {
    const status = Quotation_Status.STATUS_VALID
    const json = await this._updateQuotationStatus(quotationId, status)
    this._updateLocalQuotationStatus(quotationId, json?.status ?? status)
  }

  /**
   * 删除订单
   */
  async deleteQuotation(quotationId: string) {
    await DeleteQuotation({ quotation_id: quotationId })
    // 更新本地数据
    this.childQuotationList = _.filter(
      this.childQuotationList,
      (item) => item.quotation_id !== quotationId,
    )
    this.resetActiveQuotation(this.childQuotationList[0])
    baseStore.setChildCount(Math.max(baseStore.childCount - 1, 0))
  }

  clearStore() {
    this.activeQuotationId = ''
    this.skuType = Sku_SkuType.NOT_PACKAGE
    this.childQuotationList = [initQuotation]
  }
}

export default new Store()
