import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Filter, levelList, AfterSaleList } from '../interface'
import { t } from 'gm-i18n'
import {
  ListQuotationV2,
  Quotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { Role_Type, ListGroupUser } from 'gm_api/src/enterprise'
import {
  ListAfterSaleOrder,
  DeleteAfterSaleOrder,
  TimeType,
  ExportAfterSaleOrder,
  UpdateAfterSaleOrder,
  AfterSaleOrder_Status,
} from 'gm_api/src/aftersale'
import { Tip } from '@gm-pc/react'

const initFilter: Filter = {
  time_type: TimeType.TIME_TYPE_CREATE_AFTER_SALE,
  begin_time: moment().startOf('day').toDate(),
  end_time: moment().endOf('day').toDate(),
  search_text: '',
  serial_no: '', // 售后单号
  order_serial_no: '', // 订单号
  customer_user_name: '', // 账户名称
  customer_name: '', // 商户名称
  quotation_id: [],
  driver_id: [],
  city_id: '',
  district_id: '',
  street_id: '',
  order_state: 0,
  customer_label_id: '',
  status: 0,
}
class Store {
  filter: Filter = { ...initFilter }
  list: AfterSaleList[] = []
  quotationList: levelList[] = [] // 报价单
  driverList: levelList[] = [] // 司机
  activeType: AfterSaleOrder_Status = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeActiveType(type: AfterSaleOrder_Status) {
    this.activeType = type
  }

  changeFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  reSetFilter() {
    this.filter = initFilter
  }

  getSearchData() {
    const {
      time_type,
      begin_time,
      end_time,
      status,
      order_serial_no,
      serial_no,
      customer_user_name,
      customer_name,

      quotation_id,
      driver_id,
      city_id,
      district_id,
      street_id,
      order_state,
      customer_label_id,
    } = this.filter

    return {
      time_type,
      begin_time: `${+begin_time}`,
      end_time: `${+end_time}`,
      status,
      customer_name: customer_name || undefined,
      customer_user_name: customer_user_name || undefined,
      order_serial_no: order_serial_no || undefined,
      serial_no: serial_no || undefined,
      quotation_ids:
        (quotation_id?.length && _.map(quotation_id, (it) => it.value)) ||
        undefined,
      order_state: order_state || undefined,
      driver_ids:
        (driver_id?.length && _.map(driver_id, (it) => it.value)) || undefined,
      customer_label_ids: customer_label_id ? [customer_label_id] : undefined,
      city_ids: city_id ? [city_id] : undefined,
      district_ids: district_id ? [district_id] : undefined,
      street_ids: street_id ? [street_id] : undefined,
    }
  }

  fetchList(params?: any) {
    const req = { paging: { ...params.paging }, ...this.getSearchData() }

    return ListAfterSaleOrder(req).then((json) => {
      const { after_sale_orders, relation_info } = json.response
      this.list = _.map(after_sale_orders, (item) => {
        const order_ = relation_info?.orders![item?.order_id!]
        const customerObj =
          item.order_id !== '0'
            ? relation_info?.relation_info?.customers![
                order_?.receive_customer_id!
              ]
            : relation_info?.customers[item.customer_id]
        const companyObj =
          item.order_id !== '0'
            ? relation_info?.relation_info?.customers![order_?.customer_id_l1!]
            : relation_info?.customers[customerObj.parent_id]
        return {
          ...item,
          order_serial_no: order_?.serial_no!,
          order_state: order_?.state!,
          order_create_time: order_?.order_time!,
          receive_time: order_?.receive_time!,
          creator: relation_info?.group_users![item?.creator_id!]?.name!,
          company: companyObj?.name || '',
          customer: customerObj?.name || '',
          quotation:
            relation_info?.relation_info?.quotations![order_?.quotation_id!]
              ?.outer_name!,
          driver:
            relation_info?.relation_info?.group_users![order_?.driver_id!]
              ?.name!,
          geoTag: order_?.addresses?.addresses![0]?.address!,
          addresses: order_?.addresses?.addresses![0]!,
          customer_label:
            relation_info?.relation_info?.customer_label![
              relation_info?.relation_info?.customer_label_relation![
                order_?.receive_customer_id!
              ]?.values![0]
            ]?.name!,
        }
      })
      return json.response
    })
  }

  deleteAfterSales(after_sale_order_id: string) {
    return DeleteAfterSaleOrder({ after_sale_order_id }).then((json) => {
      if (json.response.after_sale_order) {
        Tip.success(t('删除成功'))
      }
      return json
    })
  }

  fetchQuotationList() {
    ListQuotationV2({
      paging: { limit: 999 },
      filter_params: {
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
        parent_quotation_filter: true,
      },
    }).then((json) => {
      const quotation = _.map(json.response.quotations, (item: Quotation) => {
        return {
          value: item.quotation_id,
          text: item.outer_name || '',
        }
      })
      this.quotationList = quotation
      return json.response
    })
  }

  // 恢复草稿
  fetchRestoreDraft(index: number) {
    const after_sale_order = this.list[index]
    return UpdateAfterSaleOrder({
      after_sale_order: {
        ..._.omit(after_sale_order, [
          'status',
          'order_serial_no',
          'order_state',
          'order_create_time',
          'receive_time',
          'creator',
          'company',
          'customer',
          'quotation',
          'driver',
          'geoTag',
          'customer_label',
        ]),
        status: AfterSaleOrder_Status.STATUS_TO_SUBMIT,
        // after_sale_order_details: {
        //   after_sale_order_details: [],
        // },
      },
    }).then((json) => {
      const { after_sale_order } = json.response
      if (after_sale_order) {
        Tip.success(t('恢复成功'))
        this.doRequest()
      }
      return json
    })
  }

  // 导出
  export() {
    return ExportAfterSaleOrder({ ...this.getSearchData() })
  }

  fetchDriverList() {
    const req = {
      paging: { limit: 99 },
      role_types: [Role_Type.BUILT_IN_DRIVER],
      need_distribution_contractor: true,
    }
    ListGroupUser(req).then((json) => {
      const driver = _.map(json.response.group_users, (item) => {
        return {
          text: item.name,
          value: item.group_user_id,
          ...item,
        }
      })
      this.driverList = driver
      return json.response
    })
  }

  doRequest = _.noop

  setDoRequest(func: any) {
    this.doRequest = func
  }
}

export default new Store()
