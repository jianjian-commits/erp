import { makeAutoObservable, toJS, runInAction } from 'mobx'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'
import moment, { Moment } from 'moment'
import {
  GetCustomer,
  ListServicePeriod,
  ListGroupUser,
  ListCustomerUser,
  CreateCustomerUser,
  CreateCustomer,
  CreateCustomerTree,
  UpdateCustomer,
  UpdateCustomerUser,
  Status_Code,
  Customer_Status,
  Customer_Type,
  ChinaVatInvoice_InvoiceType,
  AnalyticsCustomerMealRecord,
  ListCustomerMealRecord,
  AnalyticsCustomerMealRecordRequest_Type,
  AnalyticsCustomerMealRecordResponse_Analytic,
  CustomerMealRecord,
  CustomerOrderLimit_Cycle,
  CustomerOrderLimit_CompareType,
  SchoolType,
  CreateCustomerRequest,
} from 'gm_api/src/enterprise'
import { Status_Code as Common_Status_code } from 'gm_api/src/common'
import type {
  ServicePeriod,
  GroupUser,
  CustomerUser,
  Customer,
  CustomerOrderLimit,
} from 'gm_api/src/enterprise'
import {
  Quotation,
  ListQuotationV2,
  ListMenuPeriodGroup,
  GetCategoryTree,
  Quotation_Type,
  Quotation_Status,
} from 'gm_api/src/merchandise'
import { Query, PresetType } from 'gm_api/src/databi'
import { levelList } from '../../../type'
import { options } from '../../../enum'
import {
  customerDetailVerification,
  getValueArr,
  customerOrderLimitVerification,
} from '../../../util'
import sha256 from 'crypto-js/sha256'
import { MenuPeriodGroup } from 'gm_api/src/eshop'
import globalStore from '@/stores/global'
import { orderLimit } from '../../../custom.config.json'
import { fetchCityDistrictStreetTree } from '@gm-pc/business/src/data_gegraphic_label/util'
import type { Warehouse } from 'gm_api/src/inventory'

type storeProps = {
  viewType: string
}

const PAGING = {
  offset: 0,
  limit: 999,
}

/** 下单规则  start */
interface TotalCostListProps
  extends AnalyticsCustomerMealRecordResponse_Analytic {
  percent: number
}

const CYCLE_MONTHLY = CustomerOrderLimit_Cycle.CYCLE_MONTHLY
const initCategory1Rule = {
  category_1_ids: [], // 分类
  limit_price: 0, // 商品分类金额
  ratio: 0, // 占订单总金额
  compare_type: CustomerOrderLimit_CompareType.COMPARETYPE_LT, // 比较符号
  cycle: CustomerOrderLimit_Cycle.CYCLE_DAILY,
  isEditing: false,
}
const initTotalPriceRule = {
  on_off: false, // 关掉，初始化总金额限制类型
  // 营业总额
  total_sale: {
    val: -1, // value
    cycle: CYCLE_MONTHLY, // CYCLE_MONTHLY 月结
  },
  // 成本总额占比
  total_cost_percent: {
    val: -1,
    cycle: CYCLE_MONTHLY,
  },
  // 成本总额
  total_cost: {
    val: 1,
    cycle: CYCLE_MONTHLY,
  },
  // 下单天数
  order_days: {
    val: -1,
    cycle: CYCLE_MONTHLY,
  },
  // 计划下单金额限制
  plan_order_price: {
    val: -1,
    cycle: CustomerOrderLimit_Cycle.CYCLE_DAILY,
  },
  floating_ratio: -1, // 浮动比例
  not_included_category_1_ids: [], // 提交的时候，把selected赋值过来
}

const initCategoryRule = {
  on_off: false, // 关掉，初始化分类限制类型
  category_1_rule_details: [],
}

const initOrderRuleConfig: CustomerOrderLimit = {
  // customer_order_limit_id: '',
  on_off: false, // 下单限制规则总开关  关掉，初始化全部

  // 总金额限制类型
  total_price_rule: initTotalPriceRule,

  // 商品一级分类限制类型
  category_1_rule: initCategoryRule,
}
/** end */

const PARENTCUSTOMER: Customer = {
  customized_code: '',
  credit_type: 3,
  name: '',
  is_frozen: false,
  is_in_whitelist: false,
  status: Customer_Status.STATUS_IS_BILL_TARGET.toString(),
  type: Customer_Type.TYPE_SOCIAL,
  settlement: {
    // settlement_officer: '',
    // settlement_officer_phone: '',
    china_vat_invoice: {
      company_name: '',
      financial_contact_name: '',
      financial_contact_phone: '',
      invoice_type: ChinaVatInvoice_InvoiceType.VAT_SPECIAL,
    },
  },
  school_type: SchoolType.SCHOOL_TYPE_UNSPECIFIED,
  warehouse_id: undefined,
}

const initId = globalStore.isLite ? '0' : ''

const CHILDCUSTOMER = {
  name: '',
  customer_id: null,
  customized_code: '',
  status: Customer_Status.STATUS_IS_SHIP_TARGET,
  create_group_user_id: '0',
  sales_group_user_id: '0',
  credit_type: 3,
  type: Customer_Type.TYPE_SOCIAL,
  attrs: {
    default_dining_count: { dinning_count_map: {} },
    addresses: [
      {
        receiver: '',
        phone: '',
        address: '',
        city_id: initId,
        district_id: initId,
        street_id: initId,
        geotag: {
          latitude: '',
          longitude: '',
        },
      },
    ],
  },
  school_type: SchoolType.SCHOOL_TYPE_UNSPECIFIED,
  warehouse_id: undefined,
}

const INITACCOUNT = {}
export type CustomerStoreInstance = InstanceType<typeof Store>
class Store {
  viewType = 'Update'
  constructor(props: storeProps) {
    makeAutoObservable(this, undefined, { autoBind: true })
    this.viewType = props.viewType
  }

  accountInfo: { [key: string]: string } = {
    customer_user_id: '',
    customer_account: '',
    customer_password: '',
    customer_password2: '',
  }

  parentCustomer: Customer = {
    ...PARENTCUSTOMER,
  }

  childCustomer: Customer = {
    ...CHILDCUSTOMER,
  }

  customerUser = {
    name: '',
  }

  /** 下单规则  start */
  orderRuleConfig = {
    ...initOrderRuleConfig,
  }

  categoryList: {
    text: string
    value: string
    disabled: boolean
    isSelect: boolean
  }[] = []

  warehouseList: Warehouse[] = []

  selected: string[] = []
  isLock = false
  // 最近三个月营业额
  analyticsList: AnalyticsCustomerMealRecordResponse_Analytic[] = []
  // 每月餐次数据的Map
  customerMealRecordListMap: { [key: string]: CustomerMealRecord } = {}
  // 最近三个月成本额
  totalCostList: TotalCostListProps[] = []

  get isOrderLimit(): boolean {
    const { userInfo } = globalStore
    return Boolean(
      userInfo.group_id && orderLimit.group_ids.includes(userInfo.group_id),
    )
  }
  /** end */

  quotation_ids: levelList[] = []

  service_period_ids: levelList[] = []

  meal_times_ids: levelList[] = []

  /** 菜谱列表 */
  menuList: Array<Quotation & { value: string; text: string }> = []

  customer_label = ''

  listServicePeriod: levelList[] = [{ text: t('未选择'), value: '1' }]

  customerLabelList: options[] = [{ text: t('未选择'), value: '' }]
  createManagerList: levelList[] = [{ value: '', text: t('未选择') }]

  salesManagerList: levelList[] = [{ value: '', text: t('未选择') }]

  quotationList: levelList[] = [
    {
      text: '喵喵总仓',
      value: '1',
    },
    {
      text: '喵喵总仓2',
      value: '2',
    },
  ]

  listCustomerUser: CustomerUser[] = []

  mp_address = ''

  // 餐次
  mealTimesInfo: MenuPeriodGroup[] = []

  updateAccountInfoDetail(value: any, key: string) {
    this.accountInfo[key] = value
  }

  setParentCustomer(key: string, value: any) {
    _.set(this.parentCustomer, key, value)
  }

  setChildCustomer(key: string, value: any) {
    _.set(this.childCustomer, key, value)
  }

  setCustomerUser(key: string, value: any) {
    _.set(this.customerUser, key, value)
  }

  setStoreKey(
    key: 'quotation_ids' | 'service_period_ids' | 'meal_times_ids',
    value: [],
  ) {
    this[key] = value
  }

  // setWarehouseList(warehouses: Warehouse[]) {
  //   this.warehouseList = warehouses
  // }

  // get hasWarehouseAuth() {
  //   const { warehouse_id } = this.parentCustomer
  //   return this.warehouseList.find((w) => w.warehouse_id === warehouse_id)
  // }

  /** 下单规则相关 start */
  setOrderRuleConfig(key: string, value: any) {
    _.set(this.orderRuleConfig, key, value)
  }

  // 关闭开关，初始化数据
  reSetOrderRuleConfig(
    ruleType: 'All' | 'TOTAL_PRICE_RULE' | 'CATEGORY_1_RULE',
    pageType: 'updateCustomer' | 'createChildCustomer' | 'createParentCustomer',
  ) {
    if (ruleType === 'All') {
      if (pageType === 'updateCustomer') {
        // 有id和其他字段
        this.orderRuleConfig = {
          ...this.orderRuleConfig,
          ...initOrderRuleConfig,
        }
      } else {
        this.orderRuleConfig = initOrderRuleConfig
      }
      this.categoryList = _.map(this.categoryList, (item) => {
        return {
          ...item,
          disabled: false,
          isSelect: false,
        }
      })
      this.selected = []
    } else if (ruleType === 'TOTAL_PRICE_RULE') {
      this.orderRuleConfig = {
        ...this.orderRuleConfig,
        total_price_rule: initTotalPriceRule,
      }
      this.categoryList = _.map(this.categoryList, (item) => {
        return {
          ...item,
          isSelect: false,
        }
      })
      this.selected = []
    } else {
      this.orderRuleConfig = {
        ...this.orderRuleConfig,
        category_1_rule: initCategoryRule,
      }
      this.categoryList = _.map(this.categoryList, (item) => {
        return {
          ...item,
          disabled: false,
        }
      })
    }
  }

  onSelected(selected: string[]) {
    this.selected = selected
  }

  addTableRow() {
    // @ts-ignore
    this.orderRuleConfig.category_1_rule.category_1_rule_details.push(
      initCategory1Rule,
    )
  }

  delTableRow(index: number) {
    // @ts-ignore
    this.orderRuleConfig.category_1_rule.category_1_rule_details.splice(
      index,
      1,
    )
  }

  updateTableRow(index: number, key: string, value: any) {
    // @ts-ignore
    this.orderRuleConfig.category_1_rule.category_1_rule_details[index][key] =
      value
  }

  delClass(index: number, classIndex: number) {
    // @ts-ignore
    this.orderRuleConfig.category_1_rule.category_1_rule_details[
      index
    ].category_1_ids.splice(classIndex, 1)
  }

  updateMoreSelectList(
    selected_ids: string[],
    type: 'whiteList' | 'disabled',
    value: boolean,
  ) {
    if (type === 'whiteList') {
      this.categoryList = _.map(this.categoryList, (item) => {
        item.isSelect = !value
        if (selected_ids.includes(item.value)) {
          item.isSelect = value
        }
        return item
      })
    } else {
      this.categoryList = _.map(this.categoryList, (item) => {
        if (selected_ids.includes(item.value)) {
          item.disabled = value
        }
        return item
      })
    }
  }

  updateMoreSelectListById(select_id: string) {
    this.categoryList = _.map(this.categoryList, (item) => {
      if (select_id === item.value) {
        item.disabled = false
      }
      return item
    })
  }

  fetchGetCategoryTree() {
    return GetCategoryTree({}).then((json) => {
      this.categoryList = _.map(
        _.filter(json.response.categories!, (it) => it.parent_id === '0'),
        (item) => {
          return {
            value: item.category_id,
            text: item.name,
            disabled: false,
            isSelect: false,
          }
        },
      )
      return json
    })
  }

  // 获取每月营业额统计(最近三个月)
  fetchAnalyticsCustomerMealRecord(customer_id: string) {
    const req = {
      customer_id: customer_id,
      begin_time: moment()
        .subtract(2, 'month')
        .startOf('month')
        .format('YYYYMMDD'),
      end_time: moment().add(1, 'day').endOf('month').format('YYYYMMDD'),

      type: AnalyticsCustomerMealRecordRequest_Type.TYPE_MONTH,
    }
    const recentlyMonth_1: AnalyticsCustomerMealRecordResponse_Analytic[] = [
      {
        date: moment().format('YYYYMM'),
        total_price: 0,
      },
      {
        date: moment().subtract(1, 'month').format('YYYYMM'),
        total_price: 0,
      },
      {
        date: moment().subtract(2, 'month').format('YYYYMM'),
        total_price: 0,
      },
    ]
    return AnalyticsCustomerMealRecord(req).then((json) => {
      this.analyticsList = _.map(recentlyMonth_1, (it) => {
        _.each(json.response.analytics, (v) => {
          if (v.date === it.date) {
            it.total_price = v.total_price
          }
        })
        return it
      }).reverse()
    })
  }

  // 获取一个月的餐次信息（切换月份的时候调）
  fetchListCustomerMealRecord(customer_id: string, date: Moment) {
    const req = {
      customer_ids: [customer_id],
      begin_time: moment(date).startOf('month').format('YYYYMMDD'),
      end_time: moment(date).endOf('month').format('YYYYMMDD'),
      paging: { limit: 999 },
    }
    return ListCustomerMealRecord(req).then((json) => {
      runInAction(() => {
        this.customerMealRecordListMap = {}
        _.each(json.response.customer_meal_record, (item) => {
          this.customerMealRecordListMap[item.order_time] = item
        })
      })
    })
  }

  setIsLock(value: boolean) {
    this.isLock = value
  }

  // 月成本额
  fetchTotalCost(customer_id: string) {
    const req = {
      time_ranges: [
        {
          begin_time: moment()
            .subtract(2, 'month')
            .startOf('month')
            .format('x'),
          end_time: moment().add(1, 'day').endOf('month').format('x'),
        },
      ],
      preset_type: PresetType.PRESET_TYPE_ORDER_ORDER_PRICE_SUM_BY_MONTH,
      expr: {
        filter_string: customer_id
          ? `receive_customer_id IN (${customer_id})`
          : '',
      },
    }
    const recentlyMonth_2: AnalyticsCustomerMealRecordResponse_Analytic[] = [
      {
        date: moment().format('YYYYMM'),
        total_price: 0,
      },
      {
        date: moment().subtract(1, 'month').format('YYYYMM'),
        total_price: 0,
      },
      {
        date: moment().subtract(2, 'month').format('YYYYMM'),
        total_price: 0,
      },
    ]
    return Query(req).then((json) => {
      const { data } = json.response
      if (data?.length) {
        runInAction(() => {
          this.totalCostList = _.map(recentlyMonth_2, (item) => {
            if (data![0]?.model_values?.length) {
              _.each(data![0]?.model_values, (it) => {
                if (it?.kv?.order_time === item.date) {
                  item.total_price = +it?.kv?.order_price_sum!
                }
              })
            } else {
              item.total_price = 0
            }
            return {
              ...item,
              percent: 0,
            }
          })
            .map((i) => {
              _.each(Object.assign([], this.analyticsList), (t) => {
                if (t.date === i.date) {
                  i.percent =
                    +i?.total_price! && +t?.total_price!
                      ? +((+i?.total_price! / +t?.total_price!) * 100).toFixed(
                          2,
                        )
                      : 0
                }
              })
              return i
            })
            .reverse()
        })
      }
      return json
    })
  }

  fetchAnalyticsData(customer_id: string) {
    return Promise.all([
      this.fetchAnalyticsCustomerMealRecord(customer_id),
      this.fetchTotalCost(customer_id),
    ])
  }

  // form to request
  getCustomerOrderLimit(): CustomerOrderLimit {
    const { category_1_rule, total_price_rule } = this.orderRuleConfig
    const { floating_ratio, total_cost_percent } = total_price_rule
    const req = {
      ..._.omit(this.orderRuleConfig, ['category_1_rule', 'total_price_rule']),
      total_price_rule: Object.assign(
        {},
        {
          ..._.omit(toJS(total_price_rule), [
            'not_included_category_1_ids',
            'floating_ratio',
            'total_cost_percent',
          ]),
          floating_ratio: floating_ratio === -1 ? 0 : floating_ratio,
          total_cost_percent:
            total_cost_percent === -1 ? 0 : total_cost_percent,
          not_included_category_1_ids: this.selected,
        },
      ),
      category_1_rule: {
        on_off: category_1_rule.on_off,
        category_1_rule_details:
          _.map(category_1_rule.category_1_rule_details, (item) => {
            return {
              ..._.omit(item, ['isEditing', 'category_1_ids']),
              category_1_ids:
                _.map(item.category_1_ids, (it) => it.value) || [],
            }
          }) || [],
      },
    }
    // @ts-ignore
    return req
  }

  // response to form
  reCoverCustomerOrderLimit(customer_order_limit: CustomerOrderLimit) {
    const { category_1_rule, total_price_rule } = customer_order_limit
    const category_1_ids_total: string[] = []
    const not_included_category_1_ids_total: string[] =
      total_price_rule.not_included_category_1_ids || []
    // this.orderRuleConfig = initOrderRuleConfig
    runInAction(() => {
      this.orderRuleConfig = {
        ..._.omit(customer_order_limit, [
          'category_1_rule',
          'total_price_rule',
        ]),
        total_price_rule: {
          // 默认值(为了兼容后台返回的值)
          ...initOrderRuleConfig.total_price_rule,
          // 赋值，覆盖
          ...total_price_rule,
        },
        category_1_rule: {
          on_off: category_1_rule.on_off,
          category_1_rule_details:
            _.map(category_1_rule.category_1_rule_details, (item) => {
              category_1_ids_total.push(...item.category_1_ids)
              return {
                ..._.omit(item, ['category_1_ids']),
                isEditing: false,
                category_1_ids:
                  _.filter(this.categoryList, (it) =>
                    item.category_1_ids.includes(it.value),
                  ) || [],
              }
            }) || [],
        },
      }
      this.selected = total_price_rule?.not_included_category_1_ids || []
      // 恢复分类状态
      this.categoryList = _.map(this.categoryList, (item) => {
        if (category_1_ids_total.flat().includes(item.value)) {
          item.disabled = true
        }
        if (not_included_category_1_ids_total.includes(item.value)) {
          item.isSelect = true
        }
        return item
      })
    })
  }

  orderLimitVerification() {
    return customerOrderLimitVerification(this.orderRuleConfig)
  }

  /** end */

  init() {
    this.parentCustomer = { ...PARENTCUSTOMER }
    this.childCustomer = { ...CHILDCUSTOMER }
    this.quotation_ids = []
    this.service_period_ids = []
    this.customer_label = ''
    this.accountInfo = { ...INITACCOUNT }
    this.customerUser = { name: '' }

    // order limit
    this.orderRuleConfig = { ...initOrderRuleConfig }
    this.categoryList = []
    this.selected = []
    this.isLock = false
    this.analyticsList = []
    this.customerMealRecordListMap = {}
    this.totalCostList = []
  }

  fetchDetail(customer_id: string) {
    return GetCustomer({ customer_id })
      .then((json) => {
        const customer = json.response.customer
        this.childCustomer = customer
        this.mp_address = customer?.attrs?.addresses![0].address || ''
        // TODO: 在customer里面加 customer_order_limit
        if (customer?.customer_order_limit) {
          setTimeout(() => {
            // 预防没拿到分类
            this.reCoverCustomerOrderLimit(customer?.customer_order_limit!)
          }, 500)
        }
        return customer!.parent_id
      })
      .then((parent_id) => {
        return Promise.all([
          GetCustomer({ customer_id: parent_id as string }),
          this.fetchListCustomerUser([parent_id as string]),
        ])
      })
      .then((result) => {
        const parentCustomer = result[0].response.customer
        this.parentCustomer = parentCustomer
        return null
      })
  }

  fetchCustomer(customer_id: string) {
    return GetCustomer({ customer_id }).then((json) => {
      this.parentCustomer = json.response.customer as Customer
      this.fetchListCustomerUser([customer_id])
      return null
    })
  }

  fetchServicePeriod() {
    const req = { paging: PAGING }
    ListServicePeriod(req).then((json) => {
      const service_period = _.map(
        json.response.service_periods,
        (item: ServicePeriod) => {
          return {
            value: item.service_period_id,
            text: item.name || '',
          }
        },
      )
      this.listServicePeriod = service_period
      this.listServicePeriod.unshift({ value: '', text: '未选择' })
      return json.response
    })
  }

  fetchQuotation() {
    ListQuotationV2({
      paging: PAGING,
      filter_params: {
        parent_quotation_ids: ['0'],
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
      },
    }).then((json) => {
      const quotation = _.map(json.response.quotations, (item: Quotation) => {
        return {
          original: item,
          value: item.quotation_id,
          text: item.inner_name || '',
        }
      })
      this.quotationList = quotation
      return json.response
    })
  }

  /** 获取菜谱列表 */
  async fetchMenuList() {
    try {
      const res = await ListQuotationV2({
        filter_params: {
          quotation_status: Quotation_Status.STATUS_VALID,
          quotation_types: [Quotation_Type.WITH_TIME],
          // customer_type: Customer_Type.TYPE_SOCIAL,
        },
        paging: { offset: 0, limit: 999 },
      })
      const result = _.map(res?.response?.quotations, (item) => {
        return {
          ...item,
          value: item.quotation_id,
          text: item.inner_name || '',
        }
      })
      this.menuList = result
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  fetchListGroupUser() {
    const req = { group_id: null, paging: { ...PAGING } }
    ListGroupUser(req).then((json) => {
      const group_users = _.map(
        json.response.group_users,
        (item: GroupUser) => {
          return {
            text: item.name || '',
            value: item.group_user_id || '',
          }
        },
      )
      this.createManagerList = group_users
      this.salesManagerList = group_users
      this.createManagerList.unshift({ value: '', text: '全部' })
      this.salesManagerList.unshift({ value: '', text: '全部' })
      return null
    })
  }

  fetchListCustomerUser(customer_ids: string[]) {
    const req = { customer_ids, group_id: '1', paging: { ...PAGING } }
    ListCustomerUser(req).then((json) => {
      // 暂时只有一对一的关系，直接取数组第一个就行
      const customerUser = json.response.customer_users![0]
      if (customerUser) {
        this.customerUser = customerUser
        this.accountInfo = {
          customer_account: customerUser.name as string,
          customer_user_id: customerUser.customer_user_id,
        }
      }
      return null
    })
  }

  createCustomer() {
    const root_customer_request = {
      customer: this.parentCustomer,
    }
    const child_customer_request = {
      // TODO: 在customer里面加 customer_order_limit
      customer: {
        ...this.childCustomer,
        customer_order_limit: this.isOrderLimit
          ? this.getCustomerOrderLimit()
          : undefined,
        settlement: globalStore.isLite
          ? this.childCustomer.settlement
          : this.parentCustomer.settlement,
      },
      quotation_ids: getValueArr(this.quotation_ids).concat(
        getValueArr(this.meal_times_ids),
      ),
      service_period_ids: getValueArr(this.service_period_ids),
      customer_label_ids: this.customer_label ? [this.customer_label] : [],
    }
    this.copyChildInfoToParentInfo(
      child_customer_request.customer,
      root_customer_request.customer,
    )
    this.addPioaddressAndIsDefaultForLite(child_customer_request)
    // 轻巧版的可以为空
    const root_customer_user_request = globalStore.isLite
      ? undefined
      : {
          account: {
            username: this.accountInfo.customer_account,
            password: sha256(this.accountInfo.customer_password).toString(),
          },
          customer_user: this.customerUser,
        }
    return CreateCustomerTree(
      {
        root_customer_request,
        child_customer_request,
        root_customer_user_request,
      },
      [Status_Code.DUPLICATE_USER_NAME],
    ).then((json) => {
      if (json.code === Status_Code.DUPLICATE_USER_NAME) {
        Tip.danger(t('登录帐号已存在！'))
        return null
      } else {
        Tip.success(t('保存成功'))
      }

      return json
    })
  }

  createChildCustomer() {
    const childReq = {
      customer: {
        // TODO: 在customer里面加 customer_order_limit
        ...this.childCustomer,
        customer_order_limit: this.isOrderLimit
          ? this.getCustomerOrderLimit()
          : undefined,
        parent_id: this.parentCustomer.customer_id,
      },
      quotation_ids: getValueArr(this.quotation_ids).concat(
        getValueArr(this.meal_times_ids),
      ),
      service_period_ids: getValueArr(this.service_period_ids),
      customer_label_ids: this.customer_label ? [this.customer_label] : [],
    }
    this.addPioaddressAndIsDefaultForLite(childReq)
    UpdateCustomer({
      customer: {
        // TODO: 在customer里面去掉 customer_order_limit
        ..._.omit(this.parentCustomer, ['customer_order_limit']),
      },
    })
    return CreateCustomer(childReq, [
      Common_Status_code.DUPLICATE_CUSTOMIZED_CODE,
    ]).then((json) => {
      if (json.code === Common_Status_code.DUPLICATE_CUSTOMIZED_CODE) {
        Tip.danger(t('客户编码重复！'))
        return null
      } else {
        Tip.success(t('保存成功'))
      }

      return json.response
    })
  }

  async updateCustomer() {
    const root_customer_request = {
      customer: {
        // TODO: 在customer里面去掉 customer_order_limit
        ..._.omit(this.parentCustomer, ['customer_order_limit']),
      },
    }
    const quotation_ids = getValueArr(this.quotation_ids).concat(
      getValueArr(this.meal_times_ids),
    )
    const customer_label_ids = this.customer_label ? [this.customer_label] : []
    const child_customer_request = {
      // TODO: 在customer里面加 customer_order_limit
      customer: {
        ...this.childCustomer,
        customer_order_limit: this.isOrderLimit
          ? this.getCustomerOrderLimit()
          : undefined,
      },
      quotation_ids: quotation_ids,
      service_period_ids: getValueArr(this.service_period_ids),
      customer_label_ids,
      need_clean_quotation_ids: false,
      need_clean_customer_label_ids: !customer_label_ids.length,
    }
    this.addPioaddressAndIsDefaultForLite(child_customer_request)
    if (!quotation_ids.length) {
      child_customer_request.need_clean_quotation_ids = true
    }
    const root_customer_user_request = {
      account: {
        password: sha256(this.accountInfo.customer_password).toString(),
      },
      customer_user: this.customerUser,
    }
    if (!this.accountInfo.customer_password) {
      root_customer_user_request.account = null
    }

    return Promise.all([
      globalStore.isLite
        ? Promise.resolve()
        : UpdateCustomer(root_customer_request),
      UpdateCustomer(child_customer_request, [
        Status_Code.CUSTOMER_BIND_WITH_BUDGET,
        Status_Code.CUSTOMER_MENU_PERIOD_GROUP_ID_BIND_WITH_BUDGET,
      ]).then((json) => {
        if (json.code === Status_Code.CUSTOMER_BIND_WITH_BUDGET) {
          throw new Error(t('客户已绑定预算，不能改为非学校类型'))
        }
        if (
          json.code ===
          Status_Code.CUSTOMER_MENU_PERIOD_GROUP_ID_BIND_WITH_BUDGET
        ) {
          throw new Error(t('客户的餐次已绑定预算，不能将用餐人数改为0!'))
        }
        return json
      }),
      !globalStore.isLite && UpdateCustomerUser(root_customer_user_request),
    ])
  }

  createCustomerUser(customer_id: string) {
    const account = {
      username: this.accountInfo.customer_account,
      password: sha256(this.accountInfo.customer_password).toString(),
    }
    const customer_user = { customer_id }
    return CreateCustomerUser({ account, customer_user })
  }

  fetchMealTimesList() {
    return ListMenuPeriodGroup({ paging: { limit: 999 } }).then((json) => {
      const { menu_period } = json.response
      const menuList: MenuPeriodGroup[] = []
      _.forEach(menu_period, (item) => {
        if (item.menu_period_group) {
          menuList.push(item.menu_period_group)
        }
      })
      this.mealTimesInfo = menuList
      return json.response
    })
  }

  /** 用于轻巧版 */
  setDefaultAddress(city_ids: string[]) {
    if (!globalStore.isLite) return
    fetchCityDistrictStreetTree({
      city_ids,
    }).then((res) => {
      const firstItem = res[0]
      Object.assign(this.childCustomer?.attrs?.addresses![0], {
        city_id: firstItem.value,
        district_id: firstItem.children[0].value,
        street_id: firstItem.children[0].children[0].value,
      })
    })
  }

  /** 轻巧版要给child加上poi_address和isDefault为true */
  addPioaddressAndIsDefaultForLite(
    child_customer_request: CreateCustomerRequest,
  ) {
    if (globalStore.isLite) {
      const addressItem = child_customer_request.customer.attrs?.addresses![0]
      Object.assign(addressItem, {
        poi_address: addressItem?.address,
        is_default: true,
      })
    }
  }

  /** 轻巧版中【营运信息】的客户名称、要赋值给账号信息的公司信息，目前只有这个字段 */
  copyChildInfoToParentInfo(child_customer: Customer, root_customer: Customer) {
    if (!globalStore.isLite) return
    const { name } = child_customer
    _.set(root_customer, 'name', name)
  }

  verification(type: 'update' | 'create') {
    return customerDetailVerification(
      this.parentCustomer,
      this.childCustomer,
      this.quotation_ids,
      this.service_period_ids,
      this.accountInfo,
      type,
    )
  }
}
export default Store
