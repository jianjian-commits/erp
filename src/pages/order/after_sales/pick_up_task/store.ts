import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Role_Type, ListGroupUser, Customer } from 'gm_api/src/enterprise'
import {
  ListAfterSaleOrderTask,
  ExportAfterSaleOrderTask,
  TimeType,
  AfterSaleOrderDetail,
  AfterSaleOrderRelationInfo,
} from 'gm_api/src/aftersale'
import { getCategoryName, parseSku } from '@/common/util'
import {
  ReceiptStatusAllKey,
  FilterOptions,
  ListOptions,
  levelList,
} from './interface'
import { Sku } from 'gm_api/src/merchandise'

const initFilter: FilterOptions = {
  time_type: TimeType.TIME_TYPE_CREATE_AFTER_SALE,
  begin_time: moment().startOf('day').toDate(),
  end_time: moment().endOf('day').toDate(),
  search_text: '',
  category_ids: {},
  driver_selected: [],
  route_selected: [],
  status: 0,
  sku_name: '',
  ssu_customize_code: '',
  serial_no: '',
  order_serial_no: '',
  customer_user_name: '',
  customer_name: '',
}

class Store {
  filter: FilterOptions = { ...initFilter }
  list: ListOptions[] = []

  driverList: levelList[] = [] // 司机

  activeType: ReceiptStatusAllKey = 'TASK_STATUS_UNSPECIFIED'

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeActiveType(type: ReceiptStatusAllKey) {
    this.activeType = type
  }

  changeFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
  }

  reSetFilter() {
    this.filter.sku_name = ''
    this.filter.ssu_customize_code = ''
    this.filter.serial_no = ''
    this.filter.order_serial_no = ''
    this.filter.customer_user_name = ''
    this.filter.customer_name = ''
  }

  updateListColumn<T extends keyof ListOptions>(
    index: number,
    key: T,
    value: ListOptions[T],
  ) {
    this.list[index][key] = value
  }

  getSearchData() {
    const {
      begin_time,
      end_time,
      time_type,
      sku_name,
      ssu_customize_code,
      serial_no,
      order_serial_no,
      customer_user_name,
      customer_name,
      category_ids,
      driver_selected,
      route_selected,
      status,
    } = this.filter

    return {
      common_request: {
        begin_time: `${+begin_time}`,
        end_time: `${+end_time}`,
        time_type,
        sku_name: sku_name || undefined,
        ssu_customize_code: ssu_customize_code || undefined,
        serial_no: serial_no || undefined,
        order_serial_no: order_serial_no || undefined,
        customer_user_name: customer_user_name || undefined,
        customer_name: customer_name || undefined,
        category_ids_1:
          (Object.keys(category_ids).length > 0 &&
            category_ids?.category1_ids?.length &&
            _.map(
              category_ids?.category1_ids!,
              (item) => item?.category_id! as string,
            )) ||
          undefined,
        category_ids_2:
          (Object.keys(category_ids).length > 0 &&
            category_ids?.category2_ids?.length &&
            _.map(
              category_ids?.category2_ids!,
              (item) => item?.category_id! as string,
            )) ||
          undefined,
        driver_ids:
          (driver_selected?.length &&
            _.map(driver_selected, (it) => it?.value! as string)) ||
          undefined,
        route_ids:
          (route_selected?.length &&
            _.map(route_selected, (it) => it?.value! as string)) ||
          undefined,
        status,
      },
      paging: { limit: 999 },
    }
  }

  // 获取关联订单取货任务
  getTaskDetailWithOrder(
    item: AfterSaleOrderDetail,
    relation_info: AfterSaleOrderRelationInfo,
  ) {
    const _order = relation_info?.orders![item?.order_id!]?.order_details!
    const _relation_info = relation_info?.relation_info!

    const _order_details = _.find(
      _order?.order_details,
      (it) => it?.order_detail_id! === item.order_detail_id,
    )
    const unit_data = parseSku(_order_details!)

    const originSkuData =
      _relation_info?.sku_snaps![
        `${_order_details?.sku_id!}_${_order_details?.sku_revision}`
      ]
    return {
      ...item,
      isEditing: false, // 编辑态
      sku_name: `${_order_details?.sku_name!}`,
      category_name: getCategoryName(
        _relation_info.category!,
        originSkuData.category_id!,
      ),
      order_code: relation_info?.orders![item?.order_id!]?.serial_no!,
      after_sale_order_serial_no:
        relation_info?.after_sale_orders![item?.after_sale_order_id!]
          ?.serial_no!,
      company:
        _relation_info?.customers![
          relation_info?.orders![item?.order_id!]?.customer_id_l1!
        ]?.name!,
      customer:
        _relation_info?.customers![
          relation_info?.orders![item?.order_id!]?.receive_customer_id!
        ]?.name!,
      ssu_base_unit_name: unit_data?.outstock_unit_name!,
      route_name:
        relation_info?.routes![
          relation_info?.customer_routes![
            relation_info?.orders![item?.order_id!]?.receive_customer_id!
          ]!
        ]?.route_name! || '',
      operate_status: item.task_status!,
    }
  }

  // 获取不关联订单取货任务
  getTaskDetailWithoutOrder(
    item: AfterSaleOrderDetail,
    relation_info: AfterSaleOrderRelationInfo,
    sku: Sku,
    category_map: any,
  ) {
    const customerObj: Customer =
      relation_info?.customers![
        relation_info?.after_sale_orders![item.after_sale_order_id!]
          ?.customer_id!
      ]

    return {
      ...item,
      isEditing: false, // 编辑态
      sku_name: `${sku.name || ''}`,
      category_name: getCategoryName(category_map, sku.category_id!),
      order_code: '',
      after_sale_order_serial_no:
        relation_info?.after_sale_orders![item?.after_sale_order_id!]
          ?.serial_no!,
      company: relation_info?.customers![customerObj.parent_id!]?.name! || '',
      customer: customerObj.name || '',
      ssu_base_unit_name: '',
      route_name: '',
      operate_status: item.task_status!,
    }
  }

  // 取货任务列表
  fetchTaskList(params?: any) {
    const req = {
      ...this.getSearchData(),
      paging: params?.paging!,
    }
    this.list = []

    return ListAfterSaleOrderTask(req).then((json) => {
      const { tasks, relation_info, sku_map, category_map } = json.response
      this.list = _.map(tasks?.after_sale_order_details!, (item) => {
        if (item.order_id !== '0') {
          return this.getTaskDetailWithOrder(item, relation_info!)
        } else {
          return this.getTaskDetailWithoutOrder(
            item,
            relation_info!,
            sku_map[item.sku_id],
            category_map,
          )
        }
      })
      return json.response
    })
  }

  // 导出
  export() {
    const req = _.pick(this.getSearchData(), 'common_request')
    return ExportAfterSaleOrderTask(req)
  }

  // 司机列表
  fetchDriverList() {
    const req = {
      paging: { limit: 999 },
      role_types: [Role_Type.BUILT_IN_DRIVER],
      need_distribution_contractor: true,
    }
    return ListGroupUser(req).then((json) => {
      const driver = _.map(json.response.group_users, (item) => {
        return {
          text: item.name,
          value: item.group_user_id,
        }
      })
      this.driverList = driver
      return json.response
    })
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  clearStore() {
    this.list = []
    this.filter = { ...initFilter }
    this.activeType = 'TASK_STATUS_UNSPECIFIED'
  }
}

export default new Store()
