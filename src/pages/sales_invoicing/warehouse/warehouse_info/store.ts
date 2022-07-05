import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'
import {
  ListWarehouse,
  DeleteWarehouse,
  UpdateWarehouse,
  GetWarehouse,
  CreateWarehouse,
} from 'gm_api/src/inventory'
import { GroupUser, ListGroupUser, Role_Type } from 'gm_api/src/enterprise'
import type {
  ReqCreateWarehouse,
  ListWarehouseRequest,
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from 'gm_api/src/inventory'
import { PagingResult } from 'gm_api/src/common'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { t } from 'gm-i18n'

type Filter = {
  q: string
  valid?: number // 不传默认获取 all, 1 --> 启用， 2 --> 暂停
  all?: boolean
  manage?: boolean
}

const createErrorInfo = {
  name: t('请填写仓库名称'),
  contact: t('请填写联系人'),
  phone: t('请填写联系方式'),
  address: t('请选择地理位置'),
}

const initCreateParams = {
  name: '',
  customized_code: '',
  contact: '',
  phone: '',
  remark: '',
  is_default: false,
  geotag: {
    latitude: '',
    longitude: '',
    address: '',
  },
  address: '',
}

class Store {
  createParams: ReqCreateWarehouse = initCreateParams
  paging: PagingResult = { count: '0' }
  groupUsers: Record<string, GroupUser> = {}
  list: Warehouse[] = []
  filter: Filter = {
    q: '',
    valid: 0,
    manage: true, // 是否是仓库管理页面  只在仓库管理页面传true
    all: true, // true无视可用权限,全部返回,  false , 仅返回有可见权限的仓库, 在仓库管理页传true, 其他页面不传或者传false
  }

  isSwitch = false

  errorInfo: keyof typeof createErrorInfo | '' = ''

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setSwitch(bol: boolean) {
    this.isSwitch = bol
  }

  changeFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  get getSearchData() {
    const { valid } = this.filter
    let result = this.filter
    if (valid === 0) {
      result = _.omit(this.filter, ['valid'])
    }
    return result
  }

  get canSubmit() {
    const validParamTarget = _.pick(
      this.createParams,
      Object.keys(createErrorInfo),
    )

    for (const [key, value] of Object.entries(validParamTarget)) {
      if (!value) {
        this.errorInfo = key
        return false
      }
    }

    return true
  }

  clear() {
    this.createParams = initCreateParams
  }

  fetchList(params: TableRequestParams) {
    const paging = {
      ...params.paging,
      limit: Number(params.paging.limit),
    }
    const req: ListWarehouseRequest = Object.assign(
      { paging, with_additional: true },
      this.getSearchData,
    )
    return ListWarehouse(req).then((json) => {
      const { warehouses, paging, additional } = json.response
      this.list = warehouses
      this.paging = paging
      this.groupUsers = additional.group_users || {}
      return json.response
    })
  }

  throwErr() {
    try {
      throw new Error(
        this.errorInfo ? createErrorInfo[this.errorInfo!] : '表单校验错误',
      )
    } catch (err) {
      if (!/\d/.test(err?.message)) {
        // 这里只要表单校验错误的提示
        Tip.danger(err?.message)
      }
    }
  }

  changeCreareParams<T extends keyof typeof this.createParams>(
    key: T,
    value: typeof this.createParams[T],
  ) {
    if (key === 'geotag') {
      this.createParams[key] = Object.assign({}, value)
    } else {
      this.createParams[key] = value
    }
  }

  getPostData(
    warehouse = this.createParams,
  ): Omit<Warehouse, 'warehouse_id'> & { warehouse_id?: string } {
    return {
      ...warehouse,
      is_default: this.isSwitch,
    }
  }

  // 创建成功跳到列表页
  createHouseware() {
    if (!this.canSubmit) {
      throw new Error(
        this.errorInfo ? createErrorInfo[this.errorInfo!] : '表单校验错误',
      )
    }

    const params: CreateWarehouseRequest = {
      warehouse: this.getPostData(),
    }
    return CreateWarehouse(params)
  }

  deleteWarehouse(warehouse_id: string) {
    const req = { warehouse_id }
    return DeleteWarehouse(req)
  }

  updateWareHouse(
    warehouse: Warehouse,
    original: 'detail' | 'list' = 'detail',
    valid?: boolean,
  ) {
    const { warehouse_id } = warehouse
    if (!this.canSubmit && original === 'detail') {
      throw new Error(
        this.errorInfo ? createErrorInfo[this.errorInfo!] : '表单校验错误',
      )
    }
    const req: UpdateWarehouseRequest = {
      warehouse_id,
      warehouse: {
        ...this.getPostData(warehouse),
        valid: valid !== undefined ? valid : warehouse.valid,
      },
    }
    return UpdateWarehouse(req)
  }

  getWarehouseInfo(warehouse_id: string) {
    const req = {
      warehouse_id,
    }
    GetWarehouse(req).then((json) => {
      this.createParams = json.response.warehouse
    })
  }
}

export default new Store()
