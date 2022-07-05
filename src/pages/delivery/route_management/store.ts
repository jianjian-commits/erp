import { t } from 'gm-i18n'
import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { Tip, TransferListItem } from '@gm-pc/react'
import {
  ListRoute,
  ListRouteRequest,
  Route,
  CreateRoute,
  UpdateRoute,
  DeleteRoute,
  GetRoute,
} from 'gm_api/src/delivery'
import { ListCustomer, GroupUser, ListDistrict } from 'gm_api/src/enterprise'
import type { PagingResult } from 'gm_api/src/common'
import globalStore from '@/stores/global'
import { handleRouteObj, handleCustomerTreeData } from '../util'
import { RouteInfo } from '../interface'

type EditRouteName = 'routeName'
class Store {
  search_text = ''
  count = 0
  list: RouteInfo[] = []

  customerSelected: string[] = []

  routeName = ''

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  routeDetail = {}

  customer_config_data: TransferListItem[] = []

  // updateRoute要传完整结构体
  route: Route = { route_id: '', route_name: '' }

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  group_users: { [key: string]: GroupUser } = {}

  handleSearchText = (value: string) => {
    this.search_text = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  handleCustomerSelected(selected: string[]) {
    this.customerSelected = selected
  }

  handleRouteName(key: EditRouteName, value: string) {
    this[key] = value
  }

  fetchList = (params: ListRouteRequest) => {
    const req = Object.assign(
      { paging: params.paging },
      {
        need_group_user: true,
        q: this.search_text,
      },
    )
    return ListRoute(req).then((json) => {
      const { paging, routes, group_users } = json.response
      if (paging?.count) {
        this.count = (paging as PagingResult)?.count as number
      }
      this.list = _.map(routes, (item) => {
        return {
          ...item,
          isEditing: false,
        }
      })
      this.group_users = group_users!

      return json.response
    })
  }

  handleChangeRoute<T extends keyof RouteInfo>(
    index: number,
    key: T,
    value: RouteInfo[T],
  ) {
    this.list[index][key] = value
  }

  createRoute() {
    return CreateRoute({
      route: { route_name: this.routeName, creator_id: '321885959194935323' },
    }).then(() => {
      this.routeName = ''
      return Tip.success(t('新建成功'))
    })
  }

  getRoute(id: string) {
    return GetRoute({
      route_id: id,
      need_customer: true,
      need_district: true,
    }).then((json) => {
      this.route = json.response.route as Route
      this.customerSelected = _.map(
        json.response.route?.customers,
        (item) => item.customer_id,
      )
      return null
    })
  }

  getCustomerList() {
    return ListCustomer({ paging: { limit: 999 }, level: 2 }).then((json) => {
      return json.response
    })
  }

  getDistrictList() {
    const req = {
      city_ids: globalStore.stationInfo.attrs?.available_city_ids?.length
        ? globalStore.stationInfo.attrs?.available_city_ids
        : ['4403', '4419'],
    }
    return ListDistrict(req).then((json) => {
      return json.response
    })
  }

  handleCustomerConfigData() {
    Promise.all([this.getCustomerList(), this.getDistrictList()]).then(
      (res) => {
        this.customer_config_data = handleCustomerTreeData(
          res[0].customers,
          res[1].districts,
        )
        return null
      },
    )
  }

  updateRoute(index: number) {
    const customers = handleRouteObj(this.customerSelected)
    const req = { route: { ...this.list[index], customers } }
    return UpdateRoute(req)
  }

  updateRouteName(index: number) {
    const req = { route: { ...this.list[index], customers:this.list[index].customers } }
    return UpdateRoute(req)
  }

  delRoute(id: string) {
    return DeleteRoute({
      route_id: id,
    })
  }
}

export default new Store()
