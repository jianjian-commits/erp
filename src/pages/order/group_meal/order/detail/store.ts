import { makeAutoObservable } from 'mobx'
import {
  GetEshopOrder,
  UpdateEshopOrder,
  Order_State,
  OrderRelationInfoResponse,
  OrderDetail,
} from 'gm_api/src/order'
import { handleOrderInfo } from '../util'
import { Customer_Type } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { ListMenuPeriodGroup, MenuPeriod } from 'gm_api/src/eshop'
import { OrderDetailProps, MenuPeriodGroup_ } from '../../interface'

const initDetail = {
  order_id: '',
  bill_customer_id: '',
  receive_customer_id: '',
  addresses: {},
  receive_time: '',
  service_period: {},
}

class OrderDetailStore {
  // @ts-ignore
  detail: OrderDetailProps = { ...initDetail }

  list: OrderDetail[] = []

  customer_type = Customer_Type.TYPE_VIRTUAL_STUDENT

  menuPeriodList: MenuPeriodGroup_[] = []

  relation_info: OrderRelationInfoResponse = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getOrderDetail(serial_no: string) {
    return GetEshopOrder({
      serial_no,
      need_delete_order: true,
      relation_info: {
        need_customer_info: true,
        need_quotation_info: true,
        need_sku_info: true,
        need_driver_info: true,
        need_user_info: true,
      },
    }).then((json) => {
      this.detail = handleOrderInfo(
        json.response.order,
        json.response.relation_info,
        this.menuPeriodList,
      )
      this.relation_info = json.response.relation_info
      this.list = json.response.order?.order_details?.order_details || []
      return json
    })
  }

  getServicePeriodList() {
    return ListMenuPeriodGroup({
      paging: { limit: 999 },
    }).then((json) => {
      this.menuPeriodList = _.map(
        json.response.menu_period,
        (item: MenuPeriod) => {
          return {
            ...item.menu_period_group,
            value: item.menu_period_group.menu_period_group_id || '',
            text: item.menu_period_group.name || '',
          }
        },
      )
      return json
    })
  }

  deleteOrder() {
    return UpdateEshopOrder({
      order: {
        ...this.detail,
        state: Order_State.STATE_DELETE,
      },
    })
  }

  clear() {}

  setCustomerType(type: number) {
    this.customer_type = type
  }

  changeRemark(remark: string) {
    this.detail.remark = remark
  }
}

export default new OrderDetailStore()
