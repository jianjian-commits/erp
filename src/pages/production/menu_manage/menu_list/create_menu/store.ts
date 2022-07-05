/* eslint-disable promise/no-nesting */
import { makeAutoObservable, toJS } from 'mobx'
import _ from 'lodash'
import {
  CreateMenu,
  GetMenu,
  ListEshopMenuPeriodGroup,
  MenuPeriodGroup_Type,
  SetCustomerMenuRelation,
  UnsetCustomerMenuRelation,
  UpdateMenu,
  CustomerMenuRelation,
  GetCustomerMenuRelation,
  GetManyEshopMenuPeriodGroup,
  ReqCreateMenu,
  Menu_Type,
  Menu,
} from 'gm_api/src/merchandise'
import { MenuData, PeriodGroupData } from './interface'

import { Filters_Bool } from 'gm_api/src/common'

const initMenuData = {
  inner_name: '', // 菜谱名称
  outer_name: '', // 菜谱名称对外
  description: '', // 描述
  is_active: Filters_Bool.FALSE, // 激活状态 默认是false
  is_default: Filters_Bool.FALSE, // 默认状态 默认是false
  type: Menu_Type.TYPE_ESHOP,
  menu_period_group_id: [],
  meal_label: {},
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 创建菜谱信息
  menu_data: MenuData = { ...initMenuData }

  // 解绑有关的数据
  customer_ids: string[] = []

  // 绑定班级
  customer_data: CustomerMenuRelation[] = []

  // menu的id
  menuId = ''

  // 餐次信息
  MenuPeriodGroups: PeriodGroupData[] = []

  // 设置菜谱信息
  updateMenuData<T extends keyof MenuData>(key: T, value: MenuData[T]) {
    this.menu_data[key] = value
  }

  // 设置商户选择
  updateCustomersSelected(selected: string[]) {
    this.customer_data = _.map(selected, (item) => {
      const currentCustomer = _.find(
        this.customer_data,
        (i) => i.customer_id === item,
      ) || {
        customer_menu_relation_id: '0',
        group_id: '0',
        create_time: '0',
        delete_time: '0',
        update_time: '0',
      }
      return {
        customer_menu_relation_id:
          currentCustomer?.customer_menu_relation_id || '0',
        group_id: currentCustomer?.group_id || '0',
        create_time: currentCustomer?.create_time || '0',
        delete_time: currentCustomer?.delete_time || '0',
        update_time: currentCustomer?.update_time || '0',
        customer_id: item,
      }
    })
  }

  get getMenuData() {
    const { menu_period_group_id, meal_label } = this.menu_data

    const menu_periods = _.map(menu_period_group_id, (item) => {
      if (
        _.find(this.MenuPeriodGroups, (groupsId) => groupsId.id === item)?.name
      ) {
        return {
          menu_period_group: {
            menu_period_group_id: item,
            name:
              _.find(this.MenuPeriodGroups, (groupsId) => groupsId.id === item)
                ?.name || '',
          },
          meal_label: String(meal_label[item]),
        }
      } else {
        return {}
      }
    })

    const menuData = _.omit(
      this.menu_data,
      'menu_period_group_id',
      'meal_label',
      'menu_details',
    )
    return {
      ...menuData,
      menu_period_info: { menu_periods },
    }
  }

  fetchMenu(menu_id: string) {
    Promise.all([
      GetMenu({ menu_id }).then((json) => {
        const { menu } = json.response
        this.menuId = menu.menu_id
        const { menu_period_info } = menu
        // console.log(menu_period_info, 'menu_period_info')

        const menu_period_group_id: string[] = [] // 获取回来的id

        const meal_label: Record<string, string> = {} // 获取回来的餐标

        const menu_period_group_ids = _.map(
          menu_period_info?.menu_periods,
          (item) => item.menu_period_group?.menu_period_group_id!,
        ) // 需要验证的数据

        GetManyEshopMenuPeriodGroup({
          menu_period_group_ids,
        }).then((json) => {
          const { menu_period_groups } = json.response
          _.forEach(menu_period_info?.menu_periods, (item) => {
            const id: string = item.menu_period_group?.menu_period_group_id!
            console.log(
              'menu_period_groups?.[id!].delete_time ',
              menu_period_groups?.[id!].delete_time,
            )
            if (id && menu_period_groups?.[id!].delete_time === '0') {
              console.log('asasd', item)
              meal_label[id] = item.meal_label!
              menu_period_group_id.push(id)
            }
          })
          this.menu_data = {
            ...menu,
            menu_period_group_id,
            meal_label,
          }
        })

        return json
      }),
      GetCustomerMenuRelation({ menu_ids: [menu_id] }).then((json) => {
        this.customer_data = json.response.relations
        this.customer_ids = _.map(
          json.response.relations,
          (item) => item.customer_id!,
        )
      }),
    ])
  }

  createMenu() {
    return CreateMenu({
      menu: this.getMenuData as ReqCreateMenu,
    }).then((json) => {
      const { menu_id } = json.response.menu
      const relations = _.map(this.customer_data, (id) => ({
        ...id,
        customer_menu_relation_id: id.customer_menu_relation_id || '0',
        customer_id: id.customer_id,
        menu_id,
      })) as CustomerMenuRelation[]
      SetCustomerMenuRelation({
        relations,
      })
    })
  }

  // 记录一下
  customerLength() {
    return (
      _.filter(
        this.customer_ids,
        (item) =>
          _.findIndex(
            this.customer_data,
            (itemTwo) => itemTwo.customer_id === item,
          ) === -1,
      ) || []
    )
  }

  updateMenu() {
    return UpdateMenu({
      menu: this.getMenuData as Menu,
    }).then((json) => {
      // 更新
      const { menu_id } = json.response.menu
      const relations = _.map(this.customer_data, (id) => ({
        ...id,
        customer_menu_relation_id: id.customer_menu_relation_id,
        customer_id: id.customer_id,
        menu_id,
      })) as CustomerMenuRelation[]
      const customer_ids = this.customerLength()
      if (customer_ids.length > 0) {
        UnsetCustomerMenuRelation({ customer_ids, menu_id }).then(() => {
          SetCustomerMenuRelation({ relations }).then(() => {
            this.fetchMenu(menu_id)
          })
        })
      } else {
        SetCustomerMenuRelation({ relations }).then(() => {
          this.fetchMenu(menu_id)
        })
      }
    })
  }

  init() {
    this.menu_data = initMenuData
  }

  // 所有餐次
  fetchMenuPeriodGroups(isCreate: boolean) {
    return ListEshopMenuPeriodGroup({
      paging: { limit: 999 },
      type: MenuPeriodGroup_Type.ESHOP,
    }).then((json) => {
      this.MenuPeriodGroups = _.map(
        json.response.menu_period_groups,
        (item) => {
          return {
            name: item.name,
            id: item.menu_period_group_id,
          }
        },
      )

      this.menu_data.menu_period_group_id = isCreate
        ? _.map(this.MenuPeriodGroups, ({ id }) => id)
        : []
      return json
    })
  }
}

export default new Store()
