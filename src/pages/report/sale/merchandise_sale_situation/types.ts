import { INIT_SUMMARY } from './store'

export type MerchandiseSaleDataType = typeof INIT_SUMMARY &
  Record<'specification', string>
