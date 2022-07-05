import { Key } from 'react'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { DataNode, DataNodeMap } from '@/common/interface'
import { fetchTreeData } from '@/common/service'
import { Customer, ListCustomerLabel } from 'gm_api/src/enterprise'
import { CreatePurchaseRule, ListPurchaseRule } from 'gm_api/src/purchase'
import { Sku } from 'gm_api/src/merchandise'
import { LabelFilter, List } from './interface'
import { message } from 'antd'
class CreateStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 判断是批量新建还是增加
   * @description batchAdd是批量新建 add的table下的新建
   */
  type = ''

  /** 客户的标签的数据 */
  labelOptions: LabelFilter[] = []

  /** 分类树的数据 */
  treeData: DataNode[] = []

  /** @description 保存sku的map—商品等级需要 */
  sku_map: { [key: string]: Sku } = {}

  /** 分类树的Map */
  treeDataMap: DataNodeMap = {}

  /**
   * @description 批量添加商品的时候选择的东西
   * */
  merchandise_selectedRowKeys: Key[] = []
  merchandise_selectedRow: Sku[] = []

  /**
   * @description 这个是选择客户所添加的东西
   */
  client_selectedRowKeys: Key[] = []
  client_selectedRow: Customer[] = []

  /**
   * @description 暂时使用这个List
   *
   */
  list: List[] = []

  loading = false

  /** 操作的方法 */
  setType(type: string) {
    this.type = type
  }

  /** 初始化list的数据 */
  async initList(type: string) {
    const exitsList = await this.getList(type)
    let newList = []
    if (type === 'client') {
      newList = _.map(this.merchandise_selectedRow, (item) => {
        return {
          name: item.name,
          customer_id: '' + this.client_selectedRowKeys[0],
          sku_id: item.sku_id,
          supplier_id: '',
          purchaser_id: '',
          level_field_id: '',
        }
      })
    } else {
      newList = _.map(this.client_selectedRow, (item) => {
        return {
          name: item.name,
          sku_id: '' + this.merchandise_selectedRowKeys[0],
          customer_id: item.customer_id,
          supplier_id: '',
          purchaser_id: '',
          level_field_id: '',
        }
      })
    }
    this.list = _.unionBy(_.concat(exitsList, newList), 'name')
  }

  /** @description 改变这个sku_level */
  updateSkuLevel(sku_id: string, sku: Sku) {
    const index = _.findIndex(
      this.merchandise_selectedRow,
      (item) => item.sku_id === sku_id,
    )
    this.merchandise_selectedRow[index] = sku
    this.merchandise_selectedRow = _.cloneDeep(this.merchandise_selectedRow)
    this.list = _.cloneDeep(this.list)
  }

  /**
   * @description 获取到先有的数据
   * @mold 是判断是客户新建还是商品新建
   */
  getList(mold: string) {
    let filter_params = {}
    if (mold === 'client') {
      filter_params = {
        customer_ids: this.client_selectedRowKeys as string[],
        sku_ids: this.merchandise_selectedRowKeys as string[],
      }
    } else {
      filter_params = {
        customer_ids: this.client_selectedRowKeys as string[],
        sku_ids: this.merchandise_selectedRowKeys as string[],
      }
    }

    this.loading = true
    return ListPurchaseRule({ filter_params })
      .then((json) => {
        const { sku_map, customer_map } = json.response
        // this.sku_map = sku_map!
        // 已经存在的列
        const exitsList = _.map(json.response.purchase_rule_data, (item) => {
          if (mold === 'client') {
            return {
              name: sku_map?.[item.sku_id!]?.name || '',
              sku_id: item.sku_id || '',
              customer_id: item.customer_id || '',
              supplier_id: item.supplier_id !== '0' ? item.supplier_id : '',
              purchaser_id: item.purchaser_id !== '0' ? item.purchaser_id : '',
              level_field_id:
                item.level_field_id !== '0' ? item.level_field_id : '',
            }
          } else {
            return {
              name: customer_map?.[item.customer_id!]?.name || '',
              customer_id: item.customer_id || '',
              sku_id: item.sku_id || '',
              supplier_id: item.supplier_id !== '0' ? item.supplier_id : '',
              purchaser_id: item.purchaser_id !== '0' ? item.purchaser_id : '',
              level_field_id:
                item.level_field_id !== '0' ? item.level_field_id : '',
            }
          }
        })
        return exitsList
      })
      .finally(() => (this.loading = false))
  }

  /** 改变list的数据 */
  changeList(value: string, index: number, key: string) {
    _.set(this.list[index], key, value)
  }

  /** 修改list指针,触发table的值 */
  setList(list: List[]) {
    this.list = _.cloneDeep(list)
  }

  // 改变list
  deleteList(id: string, type: string) {
    if (type === 'client') {
      _.remove(this.list, (item) => item.sku_id === id)
      _.remove(this.merchandise_selectedRow, (item) => item.sku_id === id)
      _.remove(this.merchandise_selectedRowKeys, (item) => item === id)
    } else {
      _.remove(this.list, (item) => item.customer_id === id)
      _.remove(this.client_selectedRow, (item) => item.customer_id === id)
      _.remove(this.client_selectedRowKeys, (item) => item === id)
    }
    message.success('删除成功')
  }

  /** 保存商品或者客户的值 */
  setSelectedRowKeys(selectedRowKeys: Key[], type: string) {
    if (type === 'client') {
      this.client_selectedRowKeys = selectedRowKeys
    } else {
      this.merchandise_selectedRowKeys = selectedRowKeys
    }
  }

  /** 保存商品或客户的值 */
  setSelectedRow(selectedRows: Sku[] | Customer[], type: string) {
    if (type === 'client') {
      this.client_selectedRow = selectedRows as Customer[]
    } else {
      this.merchandise_selectedRow = selectedRows as Sku[]
    }
  }

  /** 获取分类树的方法 */
  async getTreeData() {
    const { categoryMap, categoryTreeData } = await fetchTreeData()
    this.treeDataMap = categoryMap
    this.treeData = categoryTreeData
  }

  /** @description 获取客户标签 */
  getListCustomerLabel() {
    ListCustomerLabel({ paging: { limit: 999, offset: 0 } }).then((json) => {
      const { customer_labels } = json.response
      this.labelOptions = _.map(customer_labels, (item) => {
        return {
          label: item.name,
          value: item.customer_label_id,
        }
      })
    })
  }

  /***
   * @description 创建规则
   * @type 需要根据type来区分是
   */
  createPurchase(type: string) {
    const set_data = _.map(this.list, (item) => {
      if (type === 'client') {
        return {
          customer_id: '' + this.client_selectedRowKeys[0],
          sku_id: item.sku_id,
          supplier_id: item.supplier_id || '0',
          level_field_id: item.level_field_id || '0',
          purchaser_id: item.purchaser_id || '0',
        }
      } else {
        return {
          customer_id: item.customer_id,
          sku_id: '' + this.merchandise_selectedRowKeys[0],
          supplier_id: item.supplier_id || '0',
          level_field_id: item.level_field_id || '0',
          purchaser_id: item.purchaser_id || '0',
        }
      }
    })
    return CreatePurchaseRule({ set_data })
  }

  // 清除数据
  init() {
    this.labelOptions = []

    /** 分类树的数据 */
    this.treeData = []

    /** 分类树的Map */
    this.treeDataMap = {}
    /**
     * @description 批量添加商品的时候选择的东西
     * */
    this.merchandise_selectedRowKeys = []
    this.merchandise_selectedRow = []

    /**
     * @description 这个是选择客户所添加的东西
     */
    this.client_selectedRowKeys = []
    this.client_selectedRow = []
    this.type = ''
    this.list = []
  }
}
export default new CreateStore()
