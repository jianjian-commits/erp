import { makeAutoObservable, action } from 'mobx'
import {
  ListGroupUser,
  DeleteGroupUser,
  ListGroupUserRequest,
} from 'gm_api/src/enterprise'
import type { GroupUser, Role } from 'gm_api/src/enterprise'
import { ListWarehouse } from 'gm_api/src/inventory'
import type { Warehouse } from 'gm_api/src/inventory'
import type { Uint64Set } from 'gm_api/src/common'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { FilterOptions } from './type'

const initFilter: FilterOptions = {
  q: '',
}

class Store {
  list: GroupUser[] = []
  role_relation: { [key: string]: Uint64Set } = {}
  roles: { [key: string]: Role } = {}
  filter = initFilter
  warehouseList: Warehouse[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof FilterOptions>(value: FilterOptions[T], key: T) {
    this.filter[key] = value
  }

  getWarehouseById(warehouseId: string) {
    return this.warehouseList.find((w) => w.warehouse_id === warehouseId) || {}
  }

  getRoleNamesByGroupUserId(group_user_id: string) {
    const role_ids = this.role_relation[group_user_id]
    if (!role_ids || !role_ids.values) {
      return []
    }
    const result: string[] = []
    role_ids.values.forEach((element) => {
      result.push(this.roles[element].name)
    })
    return result
  }

  translateUserState(is_valid?: boolean) {
    return is_valid ? '有效' : '无效'
  }

  @action
  fetchGroupUserList(params: ListGroupUserRequest) {
    const req = {
      ...params,
      need_roles: true,
      ...this.filter,
    }
    return ListGroupUser(req).then((json) => {
      this.list = json.response.group_users
      this.role_relation = json.response.role_relation || {}
      this.roles = json.response.roles || {}
      return json.response
    })
  }

  fetchWarehouselist() {
    ListWarehouse({
      paging: { limit: 999, offset: 0 },
      all: true,
      valid: 0, // 查看已启用的
    }).then((json) => {
      const { warehouses } = json.response
      this.warehouseList = warehouses
    })
  }

  delGroupUser(group_user_id: string) {
    return DeleteGroupUser({ group_user_id }).then(() => {
      return Tip.success(t('删除成功'))
    })
  }
}

export default new Store()
