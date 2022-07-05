import { makeAutoObservable } from 'mobx'
import {
  ListMenuPeriodGroup,
  Quotation_Type,
  GetQuotation,
  Quotation_CycleType,
  CreateQuotationV2,
  UpdateQuotationV2,
  SetCustomerQuotationRelation,
  Quotation_Status,
  RelationElement,
  GetCustomerQuotationRelation,
  Status_Code,
} from 'gm_api/src/merchandise'
import { ListCustomer, Customer_Type } from 'gm_api/src/enterprise'
import { MenuQuotation } from '../interface'
import moment from 'moment'
import _ from 'lodash'
import { levelList } from '@/pages/customer/type'
import { MToDate, dateTMM } from '@/common/util'
import { message } from 'antd'
import { t } from 'gm-i18n'

const initQuotationData: MenuQuotation = {
  quotation_id: '0',
  inner_name: '', // 菜谱名称
  outer_name: '', // 菜谱名称对外
  description: '', // 描述
  is_active: true, // 激活状态
  is_default: false, // 默认状态
  customer_type: Customer_Type.TYPE_SOCIAL,
  customer_ids: [], // 关联商户ID列表

  // 请求再整合到update_valid_time
  start_day: '1', // 周/月 起始日。
  start_time_front: moment().startOf('day').toDate(), // 开始时间
  cycle_type: 1,

  type: Quotation_Type.WITH_TIME,

  // 请求再整合到avail_menu_period_groups
  menu_period_group_ids: [],
}

class Store {
  // 创建菜谱信息
  quotation_data: MenuQuotation = { ...initQuotationData }

  // 餐次信息
  MenuPeriodGroups: levelList[] = []

  // 商户信息
  CustomerGroups: levelList[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get getQuotationData() {
    const { start_day, start_time_front, menu_period_group_ids } =
      this.quotation_data
    const _quotation_data = _.omit(
      this.quotation_data,
      'start_day',
      'start_time',
      'cycle_type',
      'customer_ids',
      'menu_period_group_ids',
    )
    return {
      ..._quotation_data,
      status: _quotation_data.is_active
        ? Quotation_Status.STATUS_VALID
        : Quotation_Status.STATUS_WAIT_VALID,
      update_valid_time: {
        start_day: start_day,
        start_time: dateTMM(start_time_front),
        cycle_type: Quotation_CycleType.CYCLETYPE_WEEKLY, // 周，使用 1～7 代表周一到周日
      },
      avail_menu_period_groups: { menu_period_group_ids },
    }
  }

  init() {
    this.quotation_data = { ...initQuotationData }
  }

  // 设置菜谱信息
  updateQuotationData<T extends keyof MenuQuotation>(
    key: T,
    value: MenuQuotation[T],
  ) {
    this.quotation_data[key] = value
  }

  // 设置商户选择
  updateCustomersSelected(selected: string[]) {
    console.log(selected, 'selected')
    this.quotation_data.customer_ids = selected
  }

  /** 获取餐次列表 */
  fetchMenuPeriodGroups(isEdit: boolean) {
    return ListMenuPeriodGroup({ paging: { limit: 999 } }).then((json) => {
      this.MenuPeriodGroups = _.map(
        json.response.menu_period,
        ({ menu_period_group: { name, menu_period_group_id } }) => {
          return {
            value: menu_period_group_id,
            text: name,
          }
        },
      )
      this.quotation_data.menu_period_group_ids = !isEdit
        ? _.map(this.MenuPeriodGroups, ({ value }) => value)
        : []

      return json
    })
  }

  /** 获取所有商户列表 */
  fetchCustomer() {
    return ListCustomer({
      paging: { limit: 999 },
      level: 1,
      need_child_customers: true,
      type: Customer_Type.TYPE_SOCIAL,
    }).then((json) => {
      const {
        customers,
        child_customers,
        child_customer_relation = {},
      } = json.response

      this.CustomerGroups = _.map(customers, (_company) => {
        return {
          ..._company,
          text: _company?.name,
          value: _company?.customer_id,
          children: _.map(
            child_customer_relation![_company?.customer_id]?.values,
            (customer_id) => {
              const _customer = child_customers[customer_id]
              return {
                ..._customer,
                value: _customer?.customer_id,
                text: _customer?.name,
              }
            },
          ),
        }
      })
      return json
    })
  }

  /** 获取菜谱关联客户 */
  fetchBindCustomers(quotation_id: string) {
    return GetCustomerQuotationRelation({ quotation_ids: [quotation_id] }).then(
      (json) => {
        const { relations = [] } = json.response
        return _.map(
          relations,
          (relationItem) => relationItem.customer_id || '',
        )
      },
    )
  }

  /** 获取菜谱详情 */
  fetchQuotation(quotation_id: string) {
    return GetQuotation({ quotation_id }).then(async (json) => {
      const { quotation } = json.response
      const { update_valid_time, avail_menu_period_groups, status } = quotation
      const customer_ids = await this.fetchBindCustomers(quotation_id)
      this.quotation_data = {
        ...quotation,
        customer_ids,
        is_active: status === Quotation_Status.STATUS_VALID,
        start_day: '' + update_valid_time?.start_day,
        start_time_front: MToDate(_.toNumber(update_valid_time?.start_time)), // 开始时间
        cycle_type: 1,
        menu_period_group_ids: avail_menu_period_groups!.menu_period_group_ids!,
      }
      return json
    })
  }

  /** 新建菜谱 */
  createQuotation() {
    return CreateQuotationV2(
      {
        quotation: this.getQuotationData,
      },
      [Status_Code.DUPLICATE_QUOTATION_NAME],
    ).then((json) => {
      if (json.code === Status_Code.DUPLICATE_QUOTATION_NAME) {
        message.error(t('菜谱名称不能重复'))
      }
      const { quotation } = json.response
      this.setCustomers(
        this.quotation_data.customer_ids,
        quotation!.quotation_id,
      )
    })
  }

  /** 更新菜谱 */
  updateQuotation() {
    return UpdateQuotationV2(
      {
        quotation: this.getQuotationData,
      },
      [Status_Code.DUPLICATE_QUOTATION_NAME],
    ).then((json) => {
      if (json.code === Status_Code.DUPLICATE_QUOTATION_NAME) {
        message.error(t('菜谱名称不能重复'))
      }
      const { quotation } = json.response
      this.setCustomers(
        this.quotation_data.customer_ids,
        quotation!.quotation_id,
      )
    })
  }

  /** 关联客户 */
  setCustomers(customer_ids: string[], quotation_id: string) {
    const relations: RelationElement[] = _.map(customer_ids, (customerItem) => {
      return {
        customer_id: customerItem,
        quotation_type: Quotation_Type.WITH_TIME,
        quotation_id,
      }
    })
    SetCustomerQuotationRelation({ relations })
  }
}

export default new Store()
