import moment from 'moment'
import {
  map_Order_State,
  Order,
  OrderRelationInfoResponse,
} from 'gm_api/src/order'
import { MenuPeriodGroup_ } from '../interface'
import _ from 'lodash'

export const handleOrderInfo = (
  order: Order,
  relation_info: OrderRelationInfoResponse,
  menPeriodList: MenuPeriodGroup_[],
) => {
  const receive_customer = relation_info?.customers![order.receive_customer_id]
  const user = {
    ...relation_info?.customer_users!,
    ...relation_info?.group_users!,
  }
  return {
    ...order,
    order_time_text: moment(+order?.order_time!).format('YYYY-MM-DD HH:mm'),
    receive_time_text: moment(+order?.receive_time!).format('YYYY-MM-DD HH:mm'),
    update_time_text: moment(+order?.update_time!).format('YYYY-MM-DD HH:mm'),
    update_id_text: _.isEmpty(user)
      ? '-'
      : user[order?.updater_id || '']?.name || '-',
    menu_period_group_id_text:
      _.find(menPeriodList, (l) => l?.value === order?.menu_period_group_id)
        ?.name || '-',
    student_name_text: receive_customer?.name || '-',
    staff_name_text: receive_customer?.name || '-',
    parents_name_text: receive_customer?.parent_name || '-',
    phone_text: receive_customer?.phone || '-',
    parents_phone_text: receive_customer?.parent_phone || '-',
    school_text:
      relation_info?.customers![order?.customer_id_l1 || '']?.name || '-',
    class_text:
      relation_info?.customers![order?.customer_id_l2 || '']?.name || '-',
    state_text: map_Order_State[order?.state!] || '-',
    creator_id_text: _.isEmpty(relation_info?.customer_users)
      ? '-'
      : relation_info?.customer_users![order?.creator_id || '']?.name,
  }
}
