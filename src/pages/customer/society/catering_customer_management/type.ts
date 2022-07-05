import { Customer, SchoolType } from 'gm_api/src/enterprise'
import { levelList } from '../../type'
import { t } from 'gm-i18n'

interface ViewCustomer extends Customer {
  quotation_id: string
  service_period_id: string[]
  customer_label_id: string[]
  menu_id: string
}

interface FilterOptions {
  quotation_ids?: levelList
  search_text: string
  service_period_ids: string
  customer_label_ids: string
  credit_types: number
  create_group_user_ids: string
  sales_group_user_ids: string
  is_frozen: number
  is_in_whitelist: number
  city_id?: string
  district_id?: string
  street_id?: string
  warehouse_ids?: string
}

export const SELECT_SCHOOL_TYPE = [
  { value: SchoolType.SCHOOL_TYPE_UNSPECIFIED, text: t('未选择类型') },
  { value: SchoolType.SCHOOL_TYPE_KINDERGARTEN, text: t('幼儿园') },
  { value: SchoolType.SCHOOL_TYPE_PRE_SCHOOL, text: t('学前班') },
  { value: SchoolType.SCHOOL_TYPE_PRIMARY_SCHOOL, text: t('小学') },
  { value: SchoolType.SCHOOL_TYPE_MIDDLE_SCHOOL, text: t('中学') },
]

export type { ViewCustomer, FilterOptions }
