import { Order_State, map_Order_State } from 'gm_api/src/order'

export const FILTER_ORDER_STATE_VALUE = [
  Order_State.STATE_WAITING_SORT,
  Order_State.STATE_SORTING,
  Order_State.STATE_DELIVERYING,
  Order_State.STATE_RECEIVABLE,
]

export const FILTER_ORDER_STATE_OPTIONS = FILTER_ORDER_STATE_VALUE.map(
  (status) => ({
    value: status,
    label: map_Order_State[status],
  }),
)
