// 商品
// sku + ssu + basic + price
import { MenuDetail_State } from 'gm_api/src/merchandise'
import { MenuDetailItem } from './interface'

export const createInitialData = (): MenuDetailItem => {
  return {
    sku_id: '',
    unit_id: '',
    price: undefined,
    remark: '',
    name: '',
    selected: false,
    value: '',
    text: '',
  }
}

// 餐次
export const initMeal = {}

export const initMenuPeriodGroup = {
  menu_period_group_id: '',
  name: '',
  icon: '',
  service_period_id: '',
  order_create_min_time: '',
  order_create_max_time: '',
  order_receive_min_time: '',
  order_receive_max_time: '',
  order_receive_min_date: '',
  order_receive_max_date: '',
  details: [createInitialData()],
}

// 每日菜谱
export const initMenu = {
  selected: false,
  menu_time: '',
  menu_status: '',
  state: MenuDetail_State.STATE_PREPARE,
  is_holiday: false,
  menu_detail_id: '0',
  details: {
    service_period_infos: [{ ...initMenuPeriodGroup }],
  },
}

export const initEditStatus = {
  canEditChild: true, // 是否能编辑子表
  canDeleteChild: true, // 是否能删除子表
  canAddChild: true, // 是否能新增子表
  canEditSsu: true, // 是否能编辑母表
  canDeleteSsu: true, // 是否能删除母表
  canAddSsu: true, // 是否能新增母表
  canSave: true, // 是否能点击保存
}
