import { makeAutoObservable, action } from 'mobx'
import {
  ListRole,
  DeleteRole,
  ListGroupUserRequest,
  Role_Type,
} from 'gm_api/src/enterprise'
import type { Role } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { FilterOptions } from './type'

const initFilter: FilterOptions = {
  q: '',
}

class Store {
  list: Role[] = []
  filter = initFilter

  constructor() {
    makeAutoObservable(this)
  }

  updateFilter<T extends keyof FilterOptions>(value: FilterOptions[T], key: T) {
    this.filter[key] = value
  }

  @action
  fetchRoleList(params: ListGroupUserRequest) {
    const req = {
      ...params,
      ...this.filter,
    }
    return ListRole(req).then((json) => {
      this.list = json.response.roles
      return json.response
    })
  }

  delRole(role_id: string) {
    return DeleteRole({ role_id }).then(() => {
      return Tip.success(t('删除成功'))
    })
  }
}

export default new Store()
