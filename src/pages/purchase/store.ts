import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { ListSupplier, ListGroupUser, Role_Type } from 'gm_api/src/enterprise'
import { fetchTreeData } from '@/common/service'
import { formatCascaderData } from '@/common/util'
import { DataOption } from '@/common/interface'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import type { GroupUser } from 'gm_api/src/enterprise'

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 供应商
  suppliers: MoreSelectDataItem<string>[] = []

  // 采购员
  purchasers: MoreSelectDataItem<string>[] = []

  // 商品分类
  categoryData: DataOption[] = []

  // 商品分类的map
  category_map = {}

  // @computed
  get suppliersMap() {
    const map: { [key: string]: MoreSelectDataItem<string> } = {}

    _.each(this.suppliers, (v) => {
      map[v.supplier_id!] = v
    })

    return map
  }

  // @computed
  get purchasersMap() {
    const map: { [key: string]: MoreSelectDataItem<string> } = {}

    _.each(this.purchasers, (v) => {
      map[v?.group_user_id] = v
    })

    return map
  }

  fetchSuppliers() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.suppliers = (json.response.suppliers || []).map((v) => ({
        ...v,
        value: v?.supplier_id!,
        text: v?.name!,
        label: v?.name!,
      }))
      return json.response.suppliers || []
    })
  }

  fetchPurchasers() {
    return ListGroupUser({
      role_types: [Role_Type.BUILT_IN_PURCHASER],
      paging: { limit: 999 },
    }).then((json) => {
      this.purchasers = (json.response?.group_users || []).map(
        (v: GroupUser) => ({
          ...v,
          value: v?.group_user_id!,
          text: v?.name!,
          label: v?.name!,
        }),
      )
      return json.response
    })
  }

  /**  @description 获取商品的分类 */
  async getMerchandiseCategory() {
    const { categoryTreeData, categoryMap } = await fetchTreeData()
    this.categoryData = [
      {
        label: '全部分类',
        value: '0',
        children: [],
      },
      ...formatCascaderData(categoryTreeData),
    ]
    this.category_map = categoryMap
  }
}

export default new Store()
