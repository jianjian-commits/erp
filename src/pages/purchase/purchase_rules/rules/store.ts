import { makeAutoObservable } from 'mobx'
import {
  ListSupplier,
  ListGroupUser,
  Role_Type,
  ListCustomer,
  Customer_Type,
  Customer,
} from 'gm_api/src/enterprise'
import {
  ListPurchaseRule,
  UpdatePurchaseRule,
  DeletePurchaseRule,
  FilterPurchaseRule,
  PurchaseRule,
  ExportPurchaseRule,
} from 'gm_api/src/purchase'
import {
  LabelFilter,
  Paging,
  ClientListParams,
  MerchandiseListParams,
  ChooseClient,
  ChooseMerchandise,
  TableMap,
  ClientFilter,
  MerchandiseFilter,
  MerchandiseTabsFilter,
} from './interface'
import _ from 'lodash'
import {
  ListSkuV2,
  Sku,
  Sku_NotPackageSubSkuType,
  Sku_SkuType,
  UpdateSkuLevelV2,
  Sku_SkuLevel,
} from 'gm_api/src/merchandise'

import { Filters_Bool } from 'gm_api/src/common'
import { fetchTreeData } from '@/common/service'
import { formatCascaderData } from '@/common/util'
import { DataOption } from '@/common/interface'
import globalStore from '@/stores/global'

const initPaging = {
  limit: 50,
  offset: 0,
  need_count: true,
}

const initClientListFilter = {
  q: '',
}

const initMerchandiseListFilter = {
  q: '',
  category_id: undefined,
}

export const initClientTableFilter = {
  sku_name: '',
  category_id: undefined,
  supplier_id: undefined,
  purchaser_id: undefined,
}

export const initMerchandiseTabsFilter = {
  customer_name: '',
  supplier_name: '',
  purchaser_name: '',
  // gradeName: '',
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** @description loading */
  loading = false

  /** @description more 用来控制下拉加载更多问题 */
  more = true

  /** @description client左边要保存 */
  clientListFilter = { ...initClientListFilter }

  /** @description client的filter的要保存 */
  clientTableFilter: ClientFilter = {
    ...initClientTableFilter,
  }

  /** @description 右边的merchandiseFilter的filter要保存 */
  merchandiseListFilter: MerchandiseFilter = { ...initMerchandiseListFilter }

  /** @description 右边tabs的filter */
  merchandiseTabsFilter: MerchandiseTabsFilter = {
    ...initMerchandiseTabsFilter,
  }

  /** @description 分类的数据 */
  categoryData: DataOption[] = []

  /** @description  分类的map  */
  category_map = {}

  /** @description  供应商  */
  supplierList: LabelFilter[] = []

  /** @description  采购员  */
  purchaseList: LabelFilter[] = []

  /** @description  有规则的客户  */
  clientList: Customer[] = []

  /** @description  有规则的商品  */
  merchandiseList: Sku[] = []

  /** @description  被选中的客户  */
  chooseClient: Partial<Customer> = {}

  /** @description  被选中的商品  */
  chooseSku: Partial<Sku> = {}

  /** @description  客户列表  */
  clientTableList: PurchaseRule[] = []

  /** @description  保存客户map的值  */
  clientTableMap: TableMap = {}

  /** @description  商品列表总览  */
  merchandiseTableListOverview: PurchaseRule[] = []

  /** @description  商品列表供应商  */
  merchandiseTableListSupplier: PurchaseRule[] = []

  /** @description  商品列表采购员  */
  merchandiseTableListPurchase: PurchaseRule[] = []

  /** @description  商品列表商品等级  */
  merchandiseTableListGrade: PurchaseRule[] = []

  /** @description  保存商品map的值  */
  merchandiseTableMap: TableMap = {}

  /** @description  点击的时候切换从第一页开始(客户级别)  */
  clientPaging: Paging = initPaging

  /** @description  点击的时候切换从第一页开始(商品级别)  */
  merchandisePaging: Paging = initPaging

  /** @description  客户的总数  */
  clientCount = 0

  /** @description  商品的总数  */
  merchandiseCount = 0

  /** @description 编辑的sku信息 */
  editSkuMap: Partial<Sku> = {}

  /** @description 用来记录一下tabs的东西 */
  merchandiseKey = 'overview'

  /** @description 用来修改tabsKey */
  setMerchandiseKey(merchandiseKey: string) {
    this.merchandiseKey = merchandiseKey
  }

  /** @description 触发的sku信息 */
  setEditSkuMap(editSkuMap: Sku) {
    this.editSkuMap = _.clone(editSkuMap)
  }

  /** @description tabs的set */
  setMerchandiseTabs(key: string, value: string) {
    _.set(this.merchandiseTabsFilter, key, value)
  }

  initMerchandiseTabs() {
    this.merchandiseTabsFilter = { ...initMerchandiseTabsFilter }
  }

  /** @description 改变client左边的filter */
  setClientListFilter(key: string, value: string) {
    _.set(this.clientListFilter, key, value)
  }

  /** @description 改变client右边的filter */
  setClientTableFilter(filter: ClientFilter) {
    this.clientTableFilter = { ...filter }
  }

  /** @description 改变商品查看左边的filter */
  setMerchandiseListFilter(filter: MerchandiseFilter) {
    this.merchandiseListFilter = { ...filter }
  }

  /** @description 将选中的保存在这里 */
  setChoose(choose: ChooseClient | ChooseMerchandise) {
    if (choose.type === 'client') {
      this.chooseClient = choose.item
      const { supplier_id, purchaser_id, category_id, sku_name } =
        this.clientTableFilter
      const filter_params = {
        customer_ids: [choose.item.customer_id!],
        sku_ids: [],
        supplier_id,
        purchaser_id,
        category_id: _.last(category_id) || undefined,
        sku_name,
      }
      this.getListPurchaseRules(filter_params, choose.type)
    } else {
      this.chooseSku = choose.item
      const { customer_name, supplier_name, purchaser_name } =
        this.merchandiseTabsFilter
      const filter_params = {
        sku_ids: [choose.item.sku_id!],
        customer_ids: [],
        customer_name:
          this.merchandiseKey === 'overview' ? customer_name : undefined,
        supplier_name:
          this.merchandiseKey === 'supplier' ? supplier_name : undefined,
        purchaser_name:
          this.merchandiseKey === 'purchase' ? purchaser_name : undefined,
        // gradeName: gradeName,
      }
      this.getListPurchaseRules(filter_params, choose.type)
    }
  }

  /**  @description 翻页 */
  setPaging(type: string) {
    if (type === 'client') {
      this.clientPaging.offset += this.clientPaging.limit
    } else {
      this.merchandisePaging.offset += this.merchandisePaging.limit
    }
  }

  /**  @description 获取商品的分类 */
  async getMerchandiseCategory() {
    const { categoryTreeData, categories } = await fetchTreeData()
    this.categoryData = formatCascaderData(categoryTreeData)
    this.category_map = _.keyBy(categories, 'category_id')
  }

  /** @description batchAdd的时候需要refresh */
  refreshPaging(type: string) {
    if (type === 'client') {
      this.clientPaging = { ...initPaging }
    } else {
      this.merchandisePaging = { ...initPaging }
    }
  }

  /** @description 获取有规则的客户 */
  getClientList(params?: ClientListParams, isReload?: string) {
    this.more = false
    const req = {
      have_purchase_rule: Filters_Bool.TRUE,
      paging: params?.paging || this.clientPaging,
      type: Customer_Type.TYPE_SOCIAL,
      level: 2,
      q: params?.q || this.clientListFilter.q,
    }
    return ListCustomer(req)
      .then((json) => {
        if (this.clientPaging.offset === 0) {
          this.clientCount = +json.response.paging.count! || 0
          this.clientList = json.response.customers || []
        } else {
          this.clientList = [
            ...this.clientList,
            ...(json.response.customers || []),
          ]
        }

        if (isReload && this.clientList.length > 0) {
          this.setChoose({ type: 'client', item: this.clientList[0] })
        } else {
          // 看看还有没有返回回来
          const index = _.findIndex(
            this.clientList,
            (item) => item.customer_id === this.chooseClient.customer_id,
          )
          if (index === -1) {
            this.chooseClient = _.cloneDeep({})
            this.clientTableList = []
            this.clientTableMap = {}
          }
          if (this.chooseClient.customer_id!) {
            this.setChoose({ type: 'client', item: this.chooseClient })
          }
        }
      })
      .finally(() => (this.more = true))
  }

  /** @description 获取有规则的商品 */
  getMerchandiseList(params?: MerchandiseListParams, isReload?: string) {
    this.more = false
    const req = {
      filter_params: {
        not_package_sub_sku_type: Sku_NotPackageSubSkuType.SNPST_UNSPECIFIED,
        on_sale: Filters_Bool.ALL,
        q: params?.q || this.merchandiseListFilter.q,
        Sku_SkuType: Sku_SkuType.NOT_PACKAGE,
        category_id:
          params?.category_id ||
          _.last(this.merchandiseListFilter.category_id) ||
          undefined,
        have_purchase_rule: Filters_Bool.TRUE,
      },
      request_data: 2048,
      sort_by: {
        desc: true,
        field: 6,
      },
      paging: params?.paging || this.merchandisePaging,
    }
    return ListSkuV2(req)
      .then((json) => {
        if (this.merchandisePaging.offset === 0) {
          this.merchandiseCount = +json.response.paging.count! || 0
          this.merchandiseList = json.response.skus! || []
        } else {
          this.merchandiseList = [
            ...this.merchandiseList,
            ...(json.response.skus! || []),
          ]
        }
        if (isReload && this.merchandiseList.length > 0) {
          this.setChoose({ type: 'merchandise', item: this.merchandiseList[0] })
        } else {
          const index = _.findIndex(
            this.merchandiseList,
            (item) => item.sku_id === this.chooseSku.sku_id,
          )
          if (index === -1) {
            this.chooseSku = {}
            this.merchandiseTableListOverview = []
            this.merchandiseTableListSupplier = []
            this.merchandiseTableListGrade = []
            this.merchandiseTableListPurchase = []
            this.merchandiseTableMap = {}
          }
          if (this.chooseSku.sku_id) {
            this.setChoose({ item: this.chooseSku, type: 'merchandise' })
          }
        }
      })
      .finally(() => (this.more = true))
  }

  /** @description 管理商品等级 需要把信息带进来 */
  updateGrade(sku_id: string, sku_level: Sku_SkuLevel[]) {
    return UpdateSkuLevelV2({ sku_id, sku_level: { sku_level: sku_level } })
  }

  /** @description 采购规则列表 */
  getListPurchaseRules(filter_params: FilterPurchaseRule, type: string) {
    this.loading = true
    ListPurchaseRule({ filter_params })
      .then((json) => {
        const { purchase_rule_data, sku_map } = json.response
        if (type === 'client') {
          this.clientTableList = purchase_rule_data
          this.clientTableMap = _.omit(json.response, 'purchase_rule_data')
        } else {
          if (this.merchandiseKey === 'overview') {
            this.merchandiseTableListOverview = purchase_rule_data
          }
          if (this.merchandiseKey === 'supplier') {
            this.merchandiseTableListSupplier = _.filter(
              purchase_rule_data,
              (i) => i.supplier_id !== '0',
            )
          }
          if (this.merchandiseKey === 'purchase') {
            this.merchandiseTableListPurchase = _.filter(
              purchase_rule_data,
              (i) => i.purchaser_id !== '0',
            )
          }
          if (this.merchandiseKey === 'grade') {
            this.merchandiseTableListGrade = _.filter(
              purchase_rule_data,
              (i) => i.level_field_id !== '0',
            )
          }

          this.merchandiseTableMap = _.omit(json.response, 'purchase_rule_data')

          if (sku_map?.[this.chooseSku.sku_id!]) {
            this.chooseSku = sku_map?.[this.chooseSku.sku_id!] as Partial<Sku>
          }
        }
      })
      .finally(() => {
        this.loading = false
      })
  }

  /** @description 编辑 */
  updatePurchaseRule(update_purchase_rule: PurchaseRule) {
    return UpdatePurchaseRule({ update_purchase_rule })
  }

  /** @description 删除 */
  deletePurchaseRule(purchase_rule_id: string[]) {
    return DeletePurchaseRule({ purchase_rule_id })
  }

  /** @description 导出 */
  exportPurchaseRules() {
    return ExportPurchaseRule().then(() => {
      globalStore.showTaskPanel('1')
    })
  }

  /** @description 获取所有的供应商 */
  getListSupplier() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.supplierList = _.map(json.response.suppliers, (item) => {
        return {
          label: item.name,
          value: item.supplier_id,
        }
      })
    })
  }

  /** @description 获取所有的采购员 */
  getListPurchase() {
    return ListGroupUser({
      paging: { limit: 999 },
      role_types: [Role_Type.BUILT_IN_PURCHASER],
    }).then((json) => {
      this.purchaseList = _.map(json.response.group_users, (item) => {
        return {
          label: item.name!,
          value: item.group_user_id,
        }
      })
    })
  }

  /** @description 清除数据 */
  init() {
    this.supplierList = []
    this.purchaseList = []
    this.clientPaging = { ...initPaging }
    this.merchandisePaging = { ...initPaging }
    this.chooseClient = {}
    this.chooseSku = {}
    this.clientTableList = []
    this.clientTableMap = {}
    this.merchandiseTableListOverview = []
    this.merchandiseTableListSupplier = []
    this.merchandiseTableListPurchase = []
    this.merchandiseTableListGrade = []
    this.merchandiseTableMap = {}
    this.clientList = []
    this.merchandiseList = []
    this.categoryData = []
    this.category_map = {}
    this.loading = false
    this.more = true
    this.clientListFilter = { ...initClientListFilter }
    this.merchandiseListFilter = { ...initMerchandiseListFilter }
    this.clientTableFilter = {
      ...initClientTableFilter,
    }
    this.merchandiseTabsFilter = { ...initMerchandiseTabsFilter }

    this.editSkuMap = {}
    this.merchandiseKey = 'overview'
  }
}
export default new Store()
