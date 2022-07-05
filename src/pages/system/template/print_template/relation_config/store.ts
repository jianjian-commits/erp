import { runInAction, makeAutoObservable } from 'mobx'
import {
  PrintingTemplate,
  GetPrintingTemplate,
  GetPrintingTemplateRelation,
  UpdatePrintingTemplateRelation,
  Status_Code,
} from 'gm_api/src/preference'
import { ListCustomer, Customer } from 'gm_api/src/enterprise'
import {
  GetManySkuResponse_SkuInfo,
  ListSkuResponse_SkuInfo,
  Sku,
  ListSku,
} from 'gm_api/src/merchandise'
import _ from 'lodash'

const initCustomer = {
  name: '',
  customer_id: '',
}

const initSku = {
  category_infos: [],
  sku: {} as Sku,
  ssu_map: {},
}

class Store {
  printing_template: PrintingTemplate | null = null
  relation_customers: Customer[] = []
  relation_customer_map: { [key: string]: Customer } = {}
  relation_customer_ids: string[] = []
  relation_skus: GetManySkuResponse_SkuInfo[] = []
  relation_skus_map: { [key: string]: GetManySkuResponse_SkuInfo } = {}
  relation_sku_ids: string[] = []

  // 全部商户列表
  customerList: Customer[] = []
  // 搜索到的商品列表
  skuList: ListSkuResponse_SkuInfo[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getPrintingTemplate(printing_template_id: string) {
    return GetPrintingTemplate({
      printing_template_id,
    }).then(({ response }) => {
      runInAction(() => {
        this.printing_template = response.printing_template
      })
      return response
    })
  }

  getPrintingTemplateRelation(printing_template_id: string) {
    return GetPrintingTemplateRelation({
      printing_template_id,
    }).then(({ response }) => {
      runInAction(() => {
        this.relation_sku_ids = response.sku_ids!
        this.relation_customer_ids = response.customer_ids!
        this.relation_customer_map = response.customers!
        this.relation_skus_map = response.skus!
        this.relation_customers = _.map(response.customers, (customer) => {
          return customer
        })
        this.relation_skus = _.map(response.skus, (sku) => {
          return sku
        })
      })
      return response
    })
  }

  getCustomers() {
    return ListCustomer({
      level: 2,
      paging: {
        limit: 999,
      },
    }).then(({ response }) => {
      runInAction(() => {
        this.customerList = response.customers
      })
      return response
    })
  }

  searchSkus(q: string) {
    return ListSku({
      q,
      request_data: 1024 + 256,
      paging: {
        limit: 999,
      },
    }).then(({ response }) => {
      runInAction(() => {
        this.skuList = response.sku_infos!
      })
      return response
    })
  }

  get computedRelationCustomers() {
    const list = this.relation_customers.slice()
    if (list.length === 0) {
      list.push(initCustomer)
    }
    return list
  }

  get computedRelationSkus() {
    const list = this.relation_skus.slice()
    if (list.length === 0) {
      list.push(initSku)
    }
    return list
  }

  addCustomer(customer_id: string, index: number) {
    const customer = _.find(
      this.customerList,
      (customer) => customer.customer_id === customer_id,
    )
    if (customer) {
      this.relation_customers[index] = customer
    }
  }

  addSku(skuInfo: ListSkuResponse_SkuInfo, index: number) {
    this.relation_skus[index] = {
      sku: skuInfo.sku,
      category_infos: skuInfo.category_infos,
    }
  }

  addRow(type: 'customer' | 'sku', index: number) {
    type === 'customer'
      ? this.relation_customers.splice(index + 1, 0, initCustomer)
      : this.relation_skus.splice(index + 1, 0, initSku)
  }

  deleteRow(type: 'customer' | 'sku', index: number) {
    type === 'customer'
      ? this.relation_customers.splice(index, 1)
      : this.relation_skus.splice(index, 1)
  }

  updatePrintingRelation(printing_template_id: string) {
    const customers = _.filter(
      this.relation_customers,
      (customer) => (customer as Customer).customer_id,
    )
    const skus = _.filter(
      this.relation_skus as GetManySkuResponse_SkuInfo[],
      (sku) => sku.sku?.sku_id,
    )

    return UpdatePrintingTemplateRelation(
      {
        printing_template_id,
        customer_ids: _.map(
          customers,
          (customer) => (customer as Customer).customer_id,
        ),
        sku_ids: _.map(
          skus as GetManySkuResponse_SkuInfo[],
          (sku) => sku.sku?.sku_id!,
        ),
      },
      [Status_Code.PRINTING_TEMPLATE_RELATION_DUPLICATE], // 打印模板绑定关系重复
    ).then((res) => {
      if (res.code === Status_Code.PRINTING_TEMPLATE_RELATION_DUPLICATE) {
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(res)
      }
      return res
    })
  }
}

export default new Store()
