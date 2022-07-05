import { makeAutoObservable } from 'mobx'
import { FilterOption } from './interface'
import {
  ListMenu,
  DeleteMenu,
  Menu,
  ListMenuRequest,
  BatchUpdateMenu,
} from 'gm_api/src/merchandise'
import { SortBy, Filters_Bool } from 'gm_api/src/common'
import _ from 'lodash'
/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

enum PagingField {
  UNSPECIFIED = 0,
  inner_name = 1, // 菜谱名称
  serial_no = 2, // 菜谱号
  class_count = 3, // 班级数
  day_count = 4, // 天数
  is_active = 5, // 状态
}
const initFilter = {
  is_active: 0,
  q: '',
}
class Store {
  filter: FilterOption = {
    ...initFilter,
  }

  paging = initPaging

  sort_bys: SortBy[] = []

  menu_list: Menu[] = []

  selected: string[] = []
  isAllSelected = false

  count = '0'

  setIsAllSelected(params: boolean) {
    this.isAllSelected = params
  }

  setSearchText(q: string) {
    this.filter.q = q
  }

  setSelected(value: string[]) {
    this.selected = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get getFilter() {
    const { q, is_active } = this.filter
    const req: ListMenuRequest = {
      paging: this.paging,
      q,
      is_active,
      sort_bys: this.sort_bys,
    }
    return req
  }

  updateFilter(value: FilterOption) {
    this.filter = { ...value, q: this.filter.q }
  }

  fetchMenuList(params?: any) {
    const { paging, sorts } = params

    if (params) {
      this.paging = paging
    }
    if (sorts && _.keys(sorts).length > 0) {
      this.sort_bys = [
        {
          field: Number(PagingField[_.keys(sorts)[0] as any]),
          desc: _.values(sorts)[0] === 'desc',
        },
      ]
    } else {
      this.sort_bys = []
    }
    return ListMenu(this.getFilter).then((json) => {
      const { menus } = json.response
      this.count = json.response.paging.count || '0'
      this.menu_list = menus // ???类型不对称
      this.selected = []
      return json.response
    })
  }

  // 删除单个菜谱
  deleteMenu(menu_id: string) {
    return DeleteMenu({ menu_id })
  }

  // 禁用单个
  changeStateMenu(menu_id: string, is_active: Filters_Bool) {
    return BatchUpdateMenu({ menu_ids: [menu_id], is_active })
  }

  // 删除多个
  deleteMoreMenu() {
    return BatchUpdateMenu({ menu_ids: this.selected, delete: true })
  }

  // 禁用多个
  changeStateMoreMenu(is_active: Filters_Bool) {
    return BatchUpdateMenu({ menu_ids: this.selected, is_active })
  }

  init() {
    this.selected = []
    this.filter = { ...initFilter }
    this.count = '0'
    this.paging = { ...initPaging }
  }
}

export default new Store()
