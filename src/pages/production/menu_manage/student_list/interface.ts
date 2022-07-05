import { MenuPeriodGroup } from 'gm_api/src/merchandise'

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface Menu_Period extends Omit<MenuPeriodGroup, 'icon'> {
  isEditing: boolean
  icon: IconsData
}

export interface CreateOrBatchData {
  // 创建餐次
  name: string
  icon: IconsData
}

export interface IconsData {
  id: string
  url: string
  show: boolean
}
