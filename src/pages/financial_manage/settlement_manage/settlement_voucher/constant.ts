import { SettleSheet_SettleStatus } from 'gm_api/src/finance'
import moment from 'moment'
import { DetailHeaderInfo, List, DetailListItem } from './interface'

/**
 * filter初始值
 */
export const initFilter = {
  begin: moment().startOf('day').toDate(),
  end: moment().endOf('day').toDate(),
  target_ids: [],
  customize_settle_voucher: '',
  settle_status: SettleSheet_SettleStatus.SETTLE_STATUS_UNSPECIFIED,
}
