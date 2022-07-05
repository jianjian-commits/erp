import { makeAutoObservable } from 'mobx'
import {
  ListGroupUser,
  CreateGroupUser,
  UpdateGroupUser,
  GetGroupUser,
  ListSupplier,
  GroupUser,
  Role_Type,
  GroupUser_Type,
} from 'gm_api/src/enterprise'
import _ from 'lodash'
import sha256 from 'crypto-js/sha256'
import type { User } from './interface'
import type { MoreSelectDataItem } from '@gm-pc/react'

interface F {
  q: string
}

const initPurchaser = {
  group_user_id: '',
  name: '',
  password: '',
  type: GroupUser_Type.UNSPECIFIED,
  is_valid: false,
  appLimit: false,
  suppliers: [],
}

interface Purchaser extends GroupUser {
  password?: string
  suppliers: MoreSelectDataItem[]
  is_valid?: boolean
  appLimit?: boolean
}

class Store {
  filter: F = {
    q: '',
  }

  list: User[] = []

  purchaser: Purchaser = initPurchaser

  suppliers: MoreSelectDataItem[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get mapSuppliers() {
    const map: { [key: string]: any } = {}
    this.suppliers.map((v) => {
      map[v.value] = v
    })
    return map
  }

  init() {
    this.purchaser = initPurchaser
  }

  updateFilter<T extends keyof F>(key: T, value: F[T]) {
    this.filter[key] = value
  }

  updatePurchaserItem<T extends keyof Purchaser>(key: T, value: Purchaser[T]) {
    this.purchaser[key] = value
  }

  updateListItem<T extends keyof User>(index: number, key: T, value: User[T]) {
    this.list[index][key] = value
  }

  fetchPurchaser() {
    ListGroupUser({
      q: this.filter.q || undefined,
      role_types: [Role_Type.BUILT_IN_PURCHASER],
      paging: { limit: 999 },
    }).then((json) => {
      this.list = (json.response.group_users! || []).map((v) => ({
        ...v,
        isEditing: false,
      }))
      return null
    })
  }

  createPurchaser() {
    return CreateGroupUser({
      bind_to_purchaser_role: true,
      group_user: {
        name: this.purchaser.name,
        type: GroupUser_Type.NORMAL as number,
        attrs: {
          bounded_customer_ids: this.purchaser.suppliers.map((v) => v.value),
        },
        status: this.purchaser.appLimit ? '256' : '0',
        is_valid: this.purchaser.is_valid,
      },
      account: {
        username: this.purchaser.username,
        password: sha256(this.purchaser.password!).toString(),
        phone: this.purchaser.phone,
      },
    })
  }

  updatePurchaser() {
    const { attrs, suppliers, password, appLimit, is_valid, ...rest } =
      this.purchaser
    return UpdateGroupUser({
      group_user: {
        ...rest,
        is_valid: is_valid,
        status: appLimit ? '256' : '0',
        attrs: {
          ...attrs,
          bounded_customer_ids: suppliers.map((v) => v.value),
        },
      },
    })
  }

  fetchSuppliers() {
    ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.suppliers = json.response.suppliers!.map((v) => ({
        ...v,
        value: v.supplier_id!,
        text: v.name!,
      }))
      return null
    })
  }

  getPurchaser(id: string) {
    GetGroupUser({ group_user_id: id }).then((json) => {
      this.purchaser = {
        ...json.response.group_user!,
        is_valid: json.response.group_user?.is_valid,
        appLimit: json.response.group_user?.status === '256',
        suppliers: (json.response.group_user?.attrs?.bounded_customer_ids || [])
          .map((v) => this.mapSuppliers[v])
          .filter((_) => _),
      }

      return json.response
    })
  }
}

export default new Store()
export type { F }
