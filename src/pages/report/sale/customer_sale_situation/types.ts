import { INIT_SUMMARY } from './store'

export type CustomerSaleDataType = typeof INIT_SUMMARY &
  Record<
    | 'customer_id'
    | 'receive_customer_lable'
    | 'sales_group_user_ids'
    | 'detail_sum_tax_price',
    string
  >
