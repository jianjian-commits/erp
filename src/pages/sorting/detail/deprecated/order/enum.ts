import { t } from 'gm-i18n'
import { App_Type } from 'gm_api/src/common'
import { Order_OrderOp } from 'gm_api/src/order'

export const appTypeMap = {
  [`${App_Type.TYPE_STATION}_${Order_OrderOp.ORDER_NORMAL}`]: t('系统录单'),
  [`${App_Type.TYPE_STATION}_${Order_OrderOp.ORDER_AMEND}`]: t('补录订单'),
  [`${App_Type.TYPE_BSHOP}_${Order_OrderOp.ORDER_NORMAL}`]: t('商城下单'),
  [`${App_Type.TYPE_BSHOP}_${Order_OrderOp.ORDER_AMEND}`]: t('商城下单'),
}
