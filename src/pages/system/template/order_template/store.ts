import { makeAutoObservable } from 'mobx'
import { i18next } from 'gm-i18n'
import _ from 'lodash'

import {
  getKeyMap,
  getRelationColumns,
  hasSameItem,
  CUSTOMERNAME,
  CUSTOMER_CUSTOMIZE_CODE,
  QUANTITY,
  ORDERUNIT,
  SSU_CUSTOMIZE_CODE,
  SSU_NAME,
  FAKE_ADD_ORDER_VALUE_1,
  FAKE_ADD_ORDER_VALUE_2,
  FAKE_ADD_ORDER_VALUE_3,
  FAKE_ADD_ORDER_VALUE_4,
} from './util'
import {
  OrderImportTemplete_Type,
  UpdateOrderTemplete,
  CreateOrderTemplete,
  OrderImportTemplete_RelationShip_Relation,
  GetOrderTemplete,
  OrderImportTemplete_TitleCol_TitleCols,
  ListOrderTemplete,
  DeleteOrderTemplete,
  OrderImportTemplete,
  OrderImportTemplete_SystemKey,
} from 'gm_api/src/orderlogic'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
interface Relation {
  is_new: boolean
  system_key?: number
  relation_name?: string
  col_index?: number
}

interface Detail {
  id?: string
  name: string
  type: number
  row_title?: number
  row_address?: number
  cycle_start?: number
  cycle_col?: number
  relation_columns: { [key: number]: any }
  relationship: Relation[]
}

const initialState = {
  id: undefined,
  name: '',
  type: OrderImportTemplete_Type.TYPE_SYSTEM,
  row_title: undefined,
  row_address: undefined,
  cycle_start: undefined,
  cycle_col: undefined,
  relation_columns: {},
  relationship: [],
}

class Store {
  list: any[] = []
  oldDetail: OrderImportTemplete = {
    order_import_templete_id: '',
    name: '',
    type: OrderImportTemplete_Type.TYPE_SYSTEM,
    relation_ship: {},
    title_col: {},
  }

  detail: Detail = {
    id: undefined,
    name: '',
    type: 1,
    row_title: undefined,
    row_address: undefined,
    cycle_start: undefined,
    cycle_col: undefined,
    relation_columns: {},
    relationship: [],
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initItem() {
    return {
      is_new: true,
      system_key: undefined,
      relation_name: undefined,
      col_index: undefined,
    }
  }

  initRelationship() {
    const { type } = this.detail
    let list = [CUSTOMERNAME, SSU_NAME, QUANTITY, ORDERUNIT]
    if (type !== OrderImportTemplete_Type.TYPE_SYSTEM) {
      list = [SSU_NAME, QUANTITY, ORDERUNIT]
    }
    this.detail.relationship = list.map((value) => {
      const item: Relation = this.initItem()
      item.system_key = +value
      return item
    })
  }

  initDetail() {
    this.detail.row_title = undefined
    this.detail.row_address = undefined
    this.detail.cycle_start = undefined
    this.detail.cycle_col = undefined
    this.detail.relation_columns = {}
    this.initRelationship()
  }

  operateNewRelationship(type: string, index: number, details: Relation[]) {
    const item = this.initItem()
    if (type === 'add') {
      details.splice(index + 1, 0, item)
    } else {
      if (details.length > 1) {
        details.splice(index, 1)
      } else {
        details[0] = item
      }
    }
  }

  async operateNewRelationColumns(columns: any[][]) {
    const { type, row_title, row_address, cycle_start } = this.detail
    let relationColumns: { [key: number]: any } = {}
    if (!row_title) {
      return Promise.reject(new Error('请正确输入标题所在行'))
    }
    if (type === 2 && !row_address) {
      return Promise.reject(new Error('请正确输入商户所在行'))
    }

    const data: any[] = columns[row_title - 1]
    if (!data || !data.length) {
      return Promise.reject(new Error('数据解析失败'))
    }

    if (type === OrderImportTemplete_Type.TYPE_SYSTEM) {
      _.forEach(data, (item, i) => {
        relationColumns[i + 1] = item
      })
    } else {
      try {
        relationColumns = await getRelationColumns(cycle_start as number, data)
      } catch (err) {
        return Promise.reject(err)
      }
    }
    this.detail.relation_columns = relationColumns
    this.initRelationship()
    return Promise.resolve('')
  }

  private get _keyMap() {
    return getKeyMap()
  }

  get relationshipList(): Relation[] {
    const { relationship } = this.detail
    return _.map(relationship, (value) => {
      const { system_key } = value
      return {
        ...value,
        name: this._keyMap[system_key!],
      }
    })
  }

  changeRelationship(type: string, index: number) {
    const relationship = [...this.detail.relationship]
    this.operateNewRelationship(type, index, relationship)
    this.detail.relationship = relationship
  }

  addRelationship(index: number) {
    const type = 'add'
    this.changeRelationship(type, index)
  }

  deleteRelationship(index: number) {
    const type = 'del'
    this.changeRelationship(type, index)
  }

  changeRelationshipItem<T extends keyof Relation>(
    index: number,
    key: T,
    value: Relation[T],
  ) {
    if (key === 'col_index') {
      this.detail.relationship[index].relation_name = this.detail
        .relation_columns[value as number] as string
    }
    this.detail.relationship[index][key] = value
  }

  reset() {
    this.detail = { ...initialState }
  }

  getDetail(id: string) {
    return GetOrderTemplete({ order_import_templete_id: id }).then((json) => {
      const orderTemplete = json.response.order_templete!
      const relationColumns: { [key: number]: any } = {}
      const {
        name,
        type,
        order_import_templete_id,
        customer_row,
        cycle_gap_col,
        start_cycle_col,
        title_row,
        title_col,
        relation_ship,
      } = orderTemplete
      const title_cols = title_col?.title_cols! || []
      title_cols.forEach((v: OrderImportTemplete_TitleCol_TitleCols) => {
        relationColumns[+v.index!] = v.col_name
      })
      this.detail.name = name
      this.detail.type = type
      this.detail.id = order_import_templete_id
      this.detail.row_address = customer_row ? +customer_row : undefined
      this.detail.cycle_col = cycle_gap_col ? +cycle_gap_col : undefined
      this.detail.cycle_start = start_cycle_col ? +start_cycle_col : undefined
      this.detail.row_title = title_row ? +title_row : undefined
      this.detail.relation_columns = relationColumns
      this.detail.relationship = (relation_ship.relations || []).map((v) => ({
        is_new: false,
        system_key: v.system_key!,
        relation_name: v.relation_name!,
        col_index: +v.col_index!,
      }))
      this.oldDetail = orderTemplete
      return null
    })
  }

  detailChange<T extends keyof Detail>(key: T, value: Detail[T]) {
    const { type } = this.detail
    this.detail[key] = value
    if (key === 'type' && value !== type) {
      this.initDetail()
    }
  }

  getList() {
    ListOrderTemplete({ paging: { limit: 999 } }).then((json) => {
      const creatorMap = json.response.relation_info?.group_users || {}
      this.list = (json.response.order_templetes || []).map((v) => ({
        ...v,
        creator: creatorMap[v?.creator_id!] || {},
      }))
      return null
    })
  }

  save(id: string) {
    const {
      relation_columns,
      relationship,
      row_title,
      cycle_col,
      cycle_start,
      row_address,
      id: _id,
      ...rest
    } = this.detail
    const params = {
      ...(this.oldDetail || null),
      ...rest,
      order_import_templete_id: _id!,
      customer_row: row_address ? `${row_address}` : undefined,
      cycle_gap_col: cycle_col ? `${cycle_col}` : undefined,
      start_cycle_col: cycle_start ? `${cycle_start}` : undefined,
      title_row: row_title ? `${row_title!}` : undefined,
      title_col: {
        title_cols: _.map(relation_columns, (v, key) => ({
          index: key,
          col_name: v,
        })),
      },
      relation_ship: {
        relations: _.map(
          _.filter(relationship, ({ system_key }) => system_key),
          (v: Relation) => {
            const { system_key, relation_name, col_index } = v
            return {
              system_key,
              relation_name,
              col_index,
            }
          },
        ) as OrderImportTemplete_RelationShip_Relation[],
      },
    }
    if (id) {
      return UpdateOrderTemplete({ order_templete: params })
    } else {
      return CreateOrderTemplete({ order_templete: params })
    }
  }

  del(id: string) {
    return DeleteOrderTemplete({ order_import_templete_id: id })
  }

  get validateExcel() {
    const commons = ['row_title']
    const { detail } = this
    let disabled = false
    commons.forEach((item) => {
      if (!detail[item as keyof Detail]) {
        disabled = true
      }
    })
    if (!disabled && detail.type === OrderImportTemplete_Type.TYPE_CUSTOMIZE) {
      const others = ['row_address', 'cycle_start', 'cycle_col']
      others.forEach((item) => {
        if (!detail[item as keyof Detail]) {
          disabled = true
        }
      })
    }
    return disabled
  }

  validate() {
    const {
      detail: { name, relationship, type },
      validateExcel,
    } = this
    const isNullRelation = _.find(
      relationship,
      (item) => !item.relation_name || !item.system_key,
    )

    // console.log(_.find(relationship, (item) => item.system_key === ))

    if (!name) return Promise.reject(new Error(i18next.t('输入模板名称')))
    if (validateExcel)
      return Promise.reject(new Error(i18next.t('输入Excel模板信息')))
    if (isNullRelation)
      return Promise.reject(new Error(i18next.t('对应关系不能为空')))
    if (!_.some(relationship, (item) => item.system_key === ORDERUNIT)) {
      return Promise.reject(new Error(i18next.t('下单单位必选')))
    }
    if (!_.find(relationship, (item) => item.system_key === QUANTITY)) {
      if (
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        )
      ) {
        return Promise.reject(new Error(i18next.t('下单数必选')))
      }
      // 是否已选加单数
      const hasAddFakeOrderField = _.some(relationship, (item) => {
        const whiteList = [
          FAKE_ADD_ORDER_VALUE_1,
          FAKE_ADD_ORDER_VALUE_2,
          FAKE_ADD_ORDER_VALUE_3,
          FAKE_ADD_ORDER_VALUE_4,
        ]
        return whiteList.includes(
          item.system_key as OrderImportTemplete_SystemKey,
        )
      })
      if (!hasAddFakeOrderField) {
        return Promise.reject(
          new Error(i18next.t('下单数、加单数至少必选任意一项')),
        )
      }
    }
    if (
      !_.find(relationship, (item) =>
        [SSU_CUSTOMIZE_CODE, SSU_NAME].includes(item.system_key!),
      )
    )
      return Promise.reject(
        new Error(i18next.t('商品编码、商品名至少必选任意一项')),
      )
    if (
      type === OrderImportTemplete_Type.TYPE_SYSTEM &&
      !_.find(relationship, (item) =>
        [CUSTOMERNAME, CUSTOMER_CUSTOMIZE_CODE].includes(item.system_key!),
      )
    )
      return Promise.reject(
        new Error(i18next.t('商户编码和商户名至少必选任意一项')),
      )
    if (hasSameItem(_.map(relationship, (item) => item.relation_name)))
      return Promise.reject(new Error(i18next.t('对应关系不能重复')))
    return Promise.resolve()
  }
}

export default new Store()

export type { Relation }
