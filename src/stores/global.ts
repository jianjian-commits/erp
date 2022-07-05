import { formatDataToTree } from '@/common/util'
import { ComShelf } from '@/pages/sales_invoicing/interface'
import { getDisabledShelfData } from '@/pages/sales_invoicing/util'
import { makeStorageObservable } from '@gm-common/mobx'
import {
  GetStation,
  GroupUser_Type,
  Group_BusinessType,
  Permission,
  Station,
  Station_Type,
} from 'gm_api/src/enterprise'
import { ListShelf, Shelf } from 'gm_api/src/inventory'
import { makeAutoObservable, action, computed } from 'mobx'
import {
  ListBasicPriceV2Response,
  ListBestSaleSkuResponse,
  ListUnit,
  Unit,
  UnitValue,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import { GetUserInfo, UserInfo } from 'gm_api/src/oauth'
import {
  GetInventorySettings,
  GetInventorySettingsRequest,
  GetMerchandiseSettings,
  GetOrderSettings,
  GetProductionSettings,
  InventorySettings,
  MerchandiseSettings,
  MerchandiseSettings_PricingFormulaPrecision,
  MerchandiseSettings_PricingFormulaRound,
  OrderSettings_CombineRound,
  OrderSettings_MergeOrder,
  ProductionSettings,
} from 'gm_api/src/preference'
import { ReactNode } from 'react'
import Big from 'big.js'
import { ListOrderDetailResponse } from 'gm_api/src/order'

interface UnitGlobal extends Unit {
  value: string
  text: string
  parent_id: string
  rate: string
  isProductUnit?: boolean
}
interface Anchor {
  type: string
  node: () => ReactNode
}
interface OrderSetting {
  COMBINEROUND_CLOSE: boolean
  COMBINEROUND_UP: boolean
  COMBINEROUND_MID: boolean
  COMBINEROUND_WHEN_BEFORE: boolean
  COMBINEROUND_WHEN_AFTER: boolean
  merge_order?: OrderSettings_MergeOrder
}
interface UnitSomeArray {
  parentId: string
  unitArrayId: string[]
  unitArray: UnitGlobal[]
  unitMap: { [key: string]: UnitGlobal }
}

function generateBinaryArray(bits: number) {
  const arr: Big[] = []
  _.each(_.range(bits), (index) => {
    arr.unshift(Big(2).pow(index))
  })
  return arr
}

const initUserInfo = {
  client_id: '',
  account_id: '',
  group_id: '',
  station_id: '',
  sys_permissions: [],
  usr_permissions: [],
}

const initStation = {
  station_id: '',
  group_id: '',
  name: '',
  address: {},
  type: Station_Type.NORMAL,
}

const initOrderSetting = {
  COMBINEROUND_CLOSE: true,
  COMBINEROUND_UP: false,
  COMBINEROUND_MID: false,
  COMBINEROUND_WHEN_BEFORE: false,
  COMBINEROUND_WHEN_AFTER: false,
  merge_order: OrderSettings_MergeOrder.MERGEORDER_CLOSE,
}

class GlobalStore {
  isBootstrap = false

  userInfo: UserInfo = {
    ...initUserInfo,
  }

  stationInfo: Station = {
    ...initStation,
  }

  shelfList: Shelf[] = []
  shelfListTree: ComShelf[] = []
  shelfListTreeAll: ComShelf[] = []

  allShelfResponse: Shelf[] = []

  breadcrumbs: string[] = []

  // TODO
  fullScreenInfo = {}

  dpOrder = 2

  dp = 4

  dpSalesInvoicing = 4

  dpInventoryAmount = 2 // 进销存的金额部分

  dpSupplierSettle = 2

  unitList: UnitGlobal[] = []

  anchors: Anchor[] = []

  permissions = ''

  orderSetting: OrderSetting = { ...initOrderSetting }

  // 异步任务组件展示状态
  taskVisible = false

  // 异步任务展示tab
  taskTab = '0'

  productionSetting: ProductionSettings = JSON.parse(
    localStorage.getItem('gmProductionSetting') || '{}',
  )

  gmShopSetting: MerchandiseSettings = {
    merchandise_settings_id: '',
    pricing_formula_precision:
      MerchandiseSettings_PricingFormulaPrecision.ACCURACY_TWODECIMALPLACE,
    pricing_formula_round: MerchandiseSettings_PricingFormulaRound.CHOICE_ROUND,
  }

  /** 发生请求后捕获到的单位（通常是自定义单位） */
  customUnits: { [key: string]: UnitValue[] } = {}

  resetUserInfo() {
    this.userInfo = { ...initUserInfo }
  }

  setIsBootstrap(isBootstrap: boolean) {
    this.isBootstrap = isBootstrap
  }

  registerAnchors(anchor: Anchor) {
    if (_.find(this.anchors, (v) => v.type === anchor.type)) return
    this.anchors.unshift(anchor)
  }

  offAnchor(type: string) {
    this.anchors = this.anchors.slice().filter((v) => v.type !== type)
  }

  @computed
  get groupId() {
    return this.userInfo?.group_id || ''
  }

  @computed
  get unitMap() {
    const map: { [key: string]: UnitGlobal } = {}

    _.each(this.unitList, (v) => {
      map[v.unit_id] = v
    })

    return map
  }

  salesInvoicingSetting: InventorySettings = JSON.parse(
    localStorage.getItem('gmSalesInvoicingSetting') || '{}',
  )

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
    makeStorageObservable(this, 'globalStore', ['unitList'])
  }

  /**
   * @description: 是否是轻巧版
   */
  @computed
  get isLite() {
    const hasLogin =
      this.userInfo.account_id && this.userInfo.account_id !== '0'
    if (!hasLogin) {
      // if (__DEVELOPMENT__) return true
      // const host = window.location.host
      // if (host.includes('q.guanmai.cn')) return true
      // // 测试环境通过在URL加lite参数来切换轻巧版，例 https://env-feature-test.x.k8s.guanmai.cn/erp?lite#/
      // if (location.search?.includes('lite')) return true

      // 因为目前feature/lite只承载轻巧版的用户，所以该分支判定为轻巧版
      return true
    }

    return [Group_BusinessType.LITE, Group_BusinessType.SIMPLE_LITE].includes(
      this.userInfo.group?.business_type as Group_BusinessType,
    )
  }

  // 判断是否开启进销存多仓设置, 且不是轻巧版
  get isOpenMultWarehouse() {
    return this.salesInvoicingSetting?.mult_warehouse && !this.isLite
  }

  setBreadcrumbs(breadcrumbs: string[]) {
    this.breadcrumbs = breadcrumbs
  }

  translatePermission(binaryArray: Big[], permission: string) {
    let bigPermission = Big(permission)
    const permissionBinaryArray: number[] = []
    _.each(binaryArray, (v) => {
      if (bigPermission.gte(v)) {
        bigPermission = bigPermission.minus(v)
        permissionBinaryArray.unshift(1)
      } else {
        permissionBinaryArray.unshift(0)
      }
    })
    return permissionBinaryArray.join('')
  }

  generatePermissionString() {
    const usr_permissions = this.userInfo.usr_permissions
    let str = ''
    const binaryArray = generateBinaryArray(64)
    _.each(usr_permissions, (permission) => {
      str = `${str}${this.translatePermission(binaryArray, permission)}`
    })
    this.permissions = str
  }

  hasPermission(permission: Permission) {
    // 开发环境不受权限限制
    // if (__DEVELOPMENT__) {
    //   return true
    // }

    if (!this.permissions) {
      return false
    }
    return this.permissions[permission] === '1'
  }

  getUnitRate(id: string, molecularId: string) {
    return Big(this.unitMap[id].rate).div(this.unitMap[molecularId].rate)
  }

  /**
   * 获取辅助单位，系统单位之间的rate
   */
  getUnitRatewithCustomizeUnit(id: string, unit: Unit) {
    return unit
      ? Big(this.unitMap[unit.parent_id].rate)
          .div(this.unitMap[id].rate)
          .times(unit.rate)
      : Big(1)
  }

  getUnit(id: string) {
    return this.unitMap[id]
  }

  getCustomUnit(sku_id: string, unit_id: string) {
    return this.customUnits[sku_id]?.find((unit) => unit.unit_id === unit_id)
  }

  getUnitName(id: string) {
    return this.getUnit(id)?.name
  }

  getPurchaseUnitName(units: Unit[] = [], id: string) {
    return _.find(units, (item) => item?.unit_id === id)?.name
  }

  isAdmin() {
    return this.userInfo.group_user?.type === GroupUser_Type.GROUP_ADMIN
  }

  getUserLogo() {
    return this.userInfo?.group?.logo?.image?.path
  }

  @action
  fetchUnitList() {
    return ListUnit({}).then((json) => {
      this.unitList = _.map(json.response.units, (unit) => {
        return {
          ...unit,
          value: unit.unit_id,
          text: unit.name,
        }
      })
      return json.response
    })
  }

  @action
  /**
   * @description: 判断两个系统单位是否同系单位
   * @param {string} unit_id1
   * @param {string} unit_id2
   * @return {*}
   */
  isSameUnitGroup(unit_id1: string, unit_id2: string) {
    return (
      // @ts-ignore
      +this.unitList?.find((unit) => unit.value === unit_id1)?.type ===
      // @ts-ignore
      +this.unitList?.find((unit) => unit.value === unit_id2)?.type
    )
  }

  /**
   * for lite
   * 以type作为同系判断依据
   */
  @action
  getSameUnitGroup() {
    return _.groupBy(this.unitList, 'type')
  }

  @action
  getSameUnitArray() {
    const data: UnitSomeArray[] = []
    _.map(this.unitList, (item) => {
      const { unit_id, parent_id } = item
      if (parent_id === '0') {
        const childUnit = _.filter(
          this.unitList,
          (v) => v.parent_id === unit_id,
        )
        childUnit.unshift(item)
        data.push({
          parentId: unit_id,
          unitArrayId: _.map(childUnit, ({ unit_id }) => unit_id),
          unitArray: childUnit,
          unitMap: _.reduce(
            childUnit,
            (all, next) => {
              all[next.unit_id] = next
              return all
            },
            {} as { [key: string]: UnitGlobal },
          ),
        })
      }
    })
    return data
  }

  @action
  fetchUserInfo() {
    return GetUserInfo({ auto_request: true }).then((json) => {
      this.userInfo = json.response.user_info
      this.generatePermissionString()
      return json.response
    })
  }

  @action
  fetchStation() {
    return GetStation({ station_id: this.userInfo.station_id! }).then(
      (json) => {
        this.stationInfo = json.response.station

        return json.response
      },
    )
  }

  @action
  fetchSalesInvoicingSetting(
    getInventorySettingsRequest?: GetInventorySettingsRequest,
  ) {
    return GetInventorySettings(getInventorySettingsRequest).then((json) => {
      localStorage.setItem(
        'gmSalesInvoicingSetting',
        JSON.stringify(json.response.inventory_settings),
      )

      this.salesInvoicingSetting = json.response.inventory_settings

      return json
    })
  }

  @action
  fetchProductionSetting() {
    return GetProductionSettings().then((json) => {
      localStorage.setItem(
        'gmProductionSetting',
        JSON.stringify(json.response.production_settings),
      )
      this.productionSetting = json.response.production_settings
      return json
    })
  }

  fetchShelf(params = {}) {
    const req = {
      ...params,
      with_deleted: true,
    }
    return ListShelf(req).then((json) => {
      const shelves = json.response.shelves
      shelves.unshift({
        shelf_id: '0',
        create_time: '0',
        update_time: '0',
        delete_time: '0',
        group_id: '0',
        station_id: '0',
        parent_id: '0',
        name: '未分配',
        remark: '',
        is_leaf: true,
      })
      this.allShelfResponse = shelves
      this.shelfListTree = formatDataToTree(
        getDisabledShelfData(
          _.filter(shelves, (item) => {
            return item.delete_time === '0'
          }), // 去掉删除
        ),
        'shelf_id',
        'name',
      )

      this.shelfListTreeAll = formatDataToTree(shelves, 'shelf_id', 'name')

      this.shelfList = getDisabledShelfData(
        _.filter(shelves, (item) => {
          return item.delete_time === '0'
        }), // 去掉删除
      )

      return json
    })
  }

  @action
  /** 获取订单取整设置 */
  fetchOrderSetting(): Promise<unknown> {
    return GetOrderSettings().then((res) => {
      const { combine_round_method, merge_order } = res.response.order_settings
      const method = 1 << 3
      const when = 1 << 5
      const close =
        (combine_round_method! &
          OrderSettings_CombineRound.COMBINEROUND_CLOSE) ===
        1
      const combine_method = combine_round_method! & (method - 1)
      const combine_method_when = combine_round_method! & (when - method)

      this.orderSetting = {
        COMBINEROUND_CLOSE: close,
        COMBINEROUND_UP: close
          ? false
          : combine_method === OrderSettings_CombineRound.COMBINEROUND_UP,
        COMBINEROUND_MID: close
          ? false
          : combine_method === OrderSettings_CombineRound.COMBINEROUND_MID,
        COMBINEROUND_WHEN_BEFORE: close
          ? false
          : combine_method_when ===
            OrderSettings_CombineRound.COMBINEROUND_WHEN_BEFORE,
        COMBINEROUND_WHEN_AFTER: close
          ? false
          : combine_method_when ===
            OrderSettings_CombineRound.COMBINEROUND_WHEN_AFTER,
        merge_order,
      }
      return null
    })
  }

  fetchShopSettings() {
    return GetMerchandiseSettings().then((json) => {
      const { merchandise_settings } = json.response
      this.gmShopSetting = {
        ...merchandise_settings,
        pricing_formula_precision:
          merchandise_settings.pricing_formula_precision ||
          MerchandiseSettings_PricingFormulaPrecision.ACCURACY_TWODECIMALPLACE,
        pricing_formula_round:
          merchandise_settings.pricing_formula_round ||
          MerchandiseSettings_PricingFormulaRound.CHOICE_ROUND,
      }
      return json
    })
  }

  // 打开异步任务组件
  @action
  showTaskPanel(tabKey = '0') {
    this.taskTab = tabKey
    this.taskVisible = true
  }

  // 切换异步任务组价展示tab
  @action
  changeTaskTab(tabKey = '0') {
    this.taskTab = tabKey
  }

  // 关闭异步任务组件
  @action
  closeTaskPanel() {
    this.taskVisible = false
  }
}

const globalStore = new GlobalStore()

/** 捕获自定义单位 */
export function catchUnitsFromSkuMap(
  res: ListBasicPriceV2Response | ListBestSaleSkuResponse,
) {
  if (!res.sku_map) return
  Object.keys(res.sku_map).forEach((key) => {
    const sku = res.sku_map?.[key]
    ;(sku?.units?.units || []).forEach((unit) => {
      const target = globalStore.customUnits[sku?.sku_id || '']
      if (target && target.length) {
        target.push(unit)
      } else {
        globalStore.customUnits[sku?.sku_id || ''] = [unit]
      }
    })
  })
}

/** ListOrderDetail捕获自定义单位 */
export function catchUnitsFromRelationInfo(res: ListOrderDetailResponse) {
  const obj = res.relation_info?.sku_snaps
  if (!obj) return
  Object.keys(obj).forEach((key) => {
    const sku = obj?.[key]
    ;(sku.units?.units || []).forEach((unit) => {
      const target = globalStore.customUnits[sku?.sku_id || '']
      if (target && target.length) {
        target.push(unit)
      } else {
        globalStore.customUnits[sku?.sku_id || ''] = [unit]
      }
    })
  })
}

export default globalStore
export type { UnitGlobal, UnitSomeArray }
