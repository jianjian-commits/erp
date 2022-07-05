import { makeAutoObservable, toJS } from 'mobx'
import _ from 'lodash'
import {
  BatchUpdateCustomer,
  CustomerOrderLimit_Cycle,
  CustomerOrderLimit_CompareType,
  AnalyticsCustomerMealRecordResponse_Analytic,
  CustomerOrderLimit,
  CustomerMealRecord,
} from 'gm_api/src/enterprise'
import { GetCategoryTree } from 'gm_api/src/merchandise'
import CustomerListStore from '../store'
import { customerOrderLimitVerification } from '../../../util'
import globalStore from '@/stores/global'
import { orderLimit } from '../../../custom.config.json'

const CYCLE_MONTHLY = CustomerOrderLimit_Cycle.CYCLE_MONTHLY
const initCategory1Rule = {
  category_1_ids: [], // 分类
  limit_price: 0, // 商品分类金额
  ratio: 0, // 占订单总金额
  compare_type: CustomerOrderLimit_CompareType.COMPARETYPE_LT, // 比较符号
  cycle: CYCLE_MONTHLY,
  isEditing: false,
}
const initTotalPriceRule = {
  on_off: false,
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
    cycle: CustomerOrderLimit_CompareType.COMPARETYPE_LT,
  },
  floating_ratio: -1, // 浮动比例
  not_included_category_1_ids: [], // 提交的时候，把selected赋值过来
}

const initCategoryRule = {
  on_off: false,
  category_1_rule_details: [],
}

const initOrderRuleConfig: CustomerOrderLimit = {
  // customer_order_limit_id: '',
  on_off: false, // 下单限制规则总开关

  // 总金额限制类型
  total_price_rule: initTotalPriceRule,

  // 商品一级分类限制类型
  category_1_rule: initCategoryRule,
}

/**
|--------------------------------------------------
|  @store
| #批量下单限制，德保定制需求
|  与创建、详情数据独立
|--------------------------------------------------
*/

class Store {
  orderRuleConfig: CustomerOrderLimit = {
    ...initOrderRuleConfig,
  }

  selected: string[] = []

  categoryList: {
    text: string
    value: string
    disabled: boolean
    isSelect: boolean
  }[] = []

  isLock = false

  analyticsList: AnalyticsCustomerMealRecordResponse_Analytic[] = [] // 366644920666030107
  customerMealRecordListMap: { [key: string]: CustomerMealRecord } = {}

  selected_customer_list: string[] = []
  isSelectedAll = false

  get isOrderLimit(): boolean {
    const { userInfo } = globalStore
    return Boolean(
      userInfo.group_id && orderLimit.group_ids.includes(userInfo.group_id),
    )
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 下单规则相关 start */
  setOrderRuleConfig(key: string, value: any) {
    _.set(this.orderRuleConfig, key, value)
  }

  // 关闭开关，初始化数据
  reSetOrderRuleConfig(
    ruleType: 'All' | 'TOTAL_PRICE_RULE' | 'CATEGORY_1_RULE',
    pageType: 'updateCustomer' | 'createChildCustomer' | 'createParentCustomer',
  ) {
    console.warn('pageType', pageType)
    if (ruleType === 'All') {
      this.orderRuleConfig = initOrderRuleConfig
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

  setSelect(selected: string[]) {
    this.selected_customer_list = selected
  }

  setIsSelectedAll(value: boolean) {
    this.isSelectedAll = value
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
        _.filter(json.response.categories!, (it) => it.parent_id === '0') || [],
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

  // form to request
  getCustomerOrderLimit(): CustomerOrderLimit {
    const { category_1_rule, total_price_rule } = this.orderRuleConfig
    const { floating_ratio, total_cost_percent } = total_price_rule
    const send = {
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
    return send
  }

  fetchBatchUpdateCustomer(isSelectedAll: boolean, customer_ids?: string[]) {
    const { getSearchData } = CustomerListStore
    const req = {
      customer_order_limit: this.getCustomerOrderLimit(),
    }
    if (isSelectedAll) {
      Object.assign(req, {
        list_customer_filter: Object.assign(
          { paging: { limit: 999 } },
          getSearchData(),
        ),
      })
    } else {
      Object.assign(req, {
        list_customer_filter: {
          paging: { limit: 999 },
          customer_ids: customer_ids || [],
        },
      })
    }
    return BatchUpdateCustomer(req)
  }

  setIsLock(value: boolean) {
    this.isLock = value
  }

  orderLimitVerification() {
    return customerOrderLimitVerification(this.orderRuleConfig)
  }

  clear() {
    this.orderRuleConfig = {
      ...initOrderRuleConfig,
    }

    this.selected = []
  }

  /** end */
}

export default new Store()
