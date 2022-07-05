import { GetOrderSynthesizeSaleDataRequest } from 'gm_api/src/databi'
import { INIT_SUMMARY } from './store'
export type SynthesizeSaleFilter = Pick<
  GetOrderSynthesizeSaleDataRequest,
  'time_range' | 'need_summary_data'
>

export type SynthesizeSaleDataType = typeof INIT_SUMMARY &
  Record<'order_time', string>
