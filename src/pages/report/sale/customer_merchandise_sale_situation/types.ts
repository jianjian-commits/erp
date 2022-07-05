import { INIT_SUMMARY } from './store'

export type CustomerMerchandiseSaleDataType = typeof INIT_SUMMARY &
  Record<'specification', string>
