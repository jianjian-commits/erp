import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { PagingRes } from '@gm-common/hooks/src/types'
import {
  BatchExportSupplier,
  ListSupplier,
  ListSupplierRequest,
  Supplier,
} from 'gm_api/src/enterprise'
import { GetCategoryTree } from 'gm_api/src/merchandise'
import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { SupplierListType } from './interface'
import { Warehouse } from 'gm_api/src/inventory'

interface Filter {
  q?: string
  warehouse_ids?: string | number
}

const initFilter: Filter = {
  q: '',
  warehouse_ids: 0,
}

/**
 * 供应商数据的类
 * 定义此类主要是因为UsePaginationService的类型与请求返回的数据不能直接转换
 * 必须需要定义一个兼容的类进行转换，否则会报错
 * 这个错误虽然不影响正常编译运行，但是不符合Typescript的规范
 * 这个问题很多地方都会出现，遇到时尽可能改一下
 */
export class Data {
  paging: PagingRes

  constructor(paging: PagingRes) {
    this.paging = paging
  }
}

/**
 * 供应商列表的Store类
 */
class Store {
  filter: Filter = { ...initFilter }
  supplierList: SupplierListType[] = []
  category1Map: {
    [key: string]: { parentId: string; name: string; parentName: string }
  } = {}

  warehouses: Warehouse[] = []

  /**
   * 创建Store实例，将该实例变为Observable
   * @class
   */
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /**
   * 改变筛选条件
   * @param {T extends keyof Filter} name  筛选条件的属性名称
   * @param {T extends keyof Filter} value 筛选条件的属性值
   */
  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  /**
   * 获取筛选器的查询值
   * @returns {{q: string}} 筛选器的查询值
   */
  getFilterQuery() {
    const { q, warehouse_ids } = this.filter
    return { q: q, warehouse_ids: warehouse_ids ? [warehouse_ids] : [] }
  }

  getWarehouses(warehouses: Warehouse[]) {
    this.warehouses = warehouses
  }

  getWarehouseById(warehouseId: string) {
    return this.warehouses.find((w) => w.warehouse_id === warehouseId) || {}
  }

  generateCategory1Data() {
    _.forEach(this.supplierList, (supplier) => {
      const names: string[] = []
      _.forEach(supplier.available_category_ids, (id) => {
        const item = this.category1Map[id]
        if (item?.parentName) {
          names.push(`#${item.parentName}#`)
        }
      })
      supplier.category1_name = [...new Set(names)].join('')
    })
  }

  sortSuppliersData(suppliers: Supplier[]) {
    return _.map(suppliers, (supplier) => {
      return {
        ..._.pick(supplier, [
          'name',
          'customized_code',
          'phone',
          'supplier_id',
          'supplier_type',
          'warehouse_id',
        ]),
        available_category_ids: _.get(
          supplier,
          'attrs.available_category_ids',
          '',
        ),
      }
    })
  }

  /**
   * 获取供应商列表
   * @param   {TableRequestParams} params 请求的参数
   * @returns {Promise}                   供应商列表数据
   */
  fetchSupplierList(params: TableRequestParams): Promise<Data> {
    const req = Object.assign({ paging: params.paging }, this.getFilterQuery())

    return ListSupplier(req as ListSupplierRequest).then((json) => {
      const suppliers = json.response.suppliers
      this.supplierList = this.sortSuppliersData(suppliers)
      this.generateCategory1Data()
      const paging = json.response.paging as PagingRes
      return new Data(paging)
    })
  }

  generateCategory1Map() {
    return GetCategoryTree().then((res) => {
      const categories = res.response.categories
      _.forEach(categories, (category) => {
        this.category1Map[category.category_id] = {
          name: category.name,
          parentId: category.parent_id,
          parentName: '',
        }
      })
      _.forEach(this.category1Map, (item) => {
        item.parentName = this.category1Map[item.parentId]?.name || ''
      })
      return res.response
    })
  }

  /**
   * 导出供应商列表
   * @returns {Promise} 导出供应商列表的请求
   */
  export() {
    const req = this.getFilterQuery()

    return BatchExportSupplier(req)
  }
}

export default new Store()
