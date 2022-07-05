import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { PagingRes } from '@gm-common/hooks/src/types'
import {
  BatchExportSupplier,
  ListSupplier,
  ListSupplierRequest,
} from 'gm_api/src/enterprise'
import { makeAutoObservable } from 'mobx'
import { SupplierItem } from '../interface'
import { adapterSuppliers } from '../util'

/**
 * 定义Filter类型，与ListSupplierRequest类型，但是移除了paging属性
 */
type Filter = Omit<ListSupplierRequest, 'paging'>

/**
 * 定义初始筛选器
 */
const initFilter: Filter = {
  q: '',
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
  supplierList: SupplierItem[] = []

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
    return { q: this.filter.q }
  }

  /**
   * 获取供应商列表
   * @param   {TableRequestParams} params 请求的参数
   * @returns {Promise}                   供应商列表数据
   */
  fetchSupplierList(params: TableRequestParams): Promise<Data> {
    const req = Object.assign({ paging: params.paging }, this.getFilterQuery())

    return ListSupplier(req as ListSupplierRequest).then((json) => {
      this.supplierList = adapterSuppliers(json.response)
      const paging = json.response.paging as PagingRes

      return new Data(paging)
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
