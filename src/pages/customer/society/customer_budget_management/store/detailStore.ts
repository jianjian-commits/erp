import { makeAutoObservable, runInAction } from 'mobx'
import _ from 'lodash'
import {
  CreateBudget,
  GetBudget,
  UpdateBudget,
  Budget,
  Customer,
  ListSemester,
  ListCustomer,
  Semester,
  SemesterType,
  Status_Code,
} from 'gm_api/src/enterprise'
import { t } from 'gm-i18n'
import { ListMenuPeriodGroup } from 'gm_api/src/merchandise'
import { MenuPeriodGroup } from 'gm_api/src/eshop'
import { message } from 'antd'
interface CustomerSelectProps {
  label: string
  value: string
  original: Customer
}

interface OtherBudgetPlanProps {
  year: string // 字符串 2021
  semester_type: SemesterType | null
}

interface MenuPeriodGroupProps extends Partial<MenuPeriodGroup> {
  label: string
  value: string
}
const initBudgetPlan: Budget = {
  customer_id: '', // 客户
  menu_period_group_id: '', // 餐次

  semester_id: '', // 根据year 和 semester_type 去找到就行
  budget_meals_per_person: '', // 计划参数
  budget_money_per_person: '', // 计划金额
}

const initOtherBudgetPlan: OtherBudgetPlanProps = {
  year: '',
  semester_type: null,
}
class Store {
  budgetPlan: Budget = initBudgetPlan

  otherBudgetPlan: OtherBudgetPlanProps = initOtherBudgetPlan

  // 客户
  customerList: CustomerSelectProps[] = []

  // 学期
  termList: Semester[] = []

  // 餐次
  mealTimesInfo: MenuPeriodGroupProps[] = []

  isLoading = false

  loading = false

  init() {
    this.budgetPlan = initBudgetPlan
    this.otherBudgetPlan = initOtherBudgetPlan
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateBudgetPlan<T extends keyof Budget>(key: T, value: Budget[T]) {
    this.budgetPlan[key] = value
  }

  updateOtherBudgetPlan<T extends keyof OtherBudgetPlanProps>(
    key: T,
    value: OtherBudgetPlanProps[T],
  ) {
    this.otherBudgetPlan[key] = value
  }

  get getCreateData() {
    const { year, semester_type } = this.otherBudgetPlan
    const semester = _.find(
      this.termList,
      (i) => `${i.year}-${i.semester_type}` === `${year}-${semester_type}`,
    )
    return {
      ...this.budgetPlan,
      // 覆盖即可
      semester_id: semester?.semester_id!,
    }
  }

  verificationStatusCode(code: Status_Code) {
    if (code === Status_Code.BUDGET_CUSTOMER_NOT_EXISTS) {
      message.error(t('预算关联的客户不存在!'))
      throw new Error(t('预算关联的客户不存在!'))
    }
    if (code === Status_Code.DUPLICATE_BUDGET) {
      message.error(t('资金预算计划已存在!'))
      throw new Error(t('资金预算计划已存在!'))
    }
    if (code === Status_Code.BUDGET_CUSTOMER_SCHOOL_TYPE_INVALID) {
      message.error(t('预算关联的客户不是学校类型!'))
      throw new Error(t('预算关联的客户不是学校类型!'))
    }
    if (code === Status_Code.BUDGET_CUSTOMER_DINING_COUNT_ZERO) {
      message.error(t('预算关联客户餐次人数为0!'))
      throw new Error(t('预算关联客户餐次人数为0!'))
    }
  }

  // 创建
  fetchCreateBudget() {
    this.loading = true
    return CreateBudget(
      {
        budget: this.getCreateData,
      },
      [
        Status_Code.BUDGET_CUSTOMER_NOT_EXISTS,
        Status_Code.DUPLICATE_BUDGET,
        Status_Code.BUDGET_CUSTOMER_SCHOOL_TYPE_INVALID,
        Status_Code.BUDGET_CUSTOMER_DINING_COUNT_ZERO,
        Status_Code.MENU_PERIOD_GROUP_NOT_EXISTS_OR_ALREADY_DELETED,
      ],
    ).then((json) => {
      this.loading = false
      this.verificationStatusCode(json.code)
      if (
        json.code ===
        Status_Code.MENU_PERIOD_GROUP_NOT_EXISTS_OR_ALREADY_DELETED
      ) {
        message.error(t('餐次不存在或已经被删除!'))
        throw new Error(t('餐次不存在或已经被删除!'))
      }
      return json
    })
  }

  // 详情
  fetchGetBudget(budget_id: string) {
    this.isLoading = true
    return GetBudget({
      budget_id,
    }).then((json) => {
      const { budget } = json.response
      if (budget) {
        this.budgetPlan = budget
        runInAction(() => {
          setTimeout(() => {
            // 通过semester_id找到学年和学期类型
            const semester = _.find(
              this.termList,
              (it) => it.semester_id === budget.semester_id,
            )
            if (semester) {
              this.otherBudgetPlan.year = semester?.year!
              this.otherBudgetPlan.semester_type = semester?.semester_type!
            }
          }, 300)
        })
      }
      this.isLoading = false
      return json.response
    })
  }

  // 更新
  fetchUpdateBudget() {
    this.loading = true
    return UpdateBudget(
      {
        budget: this.getCreateData,
      },
      [
        Status_Code.BUDGET_CUSTOMER_NOT_EXISTS,
        Status_Code.DUPLICATE_BUDGET,
        Status_Code.BUDGET_CUSTOMER_SCHOOL_TYPE_INVALID,
        Status_Code.BUDGET_CUSTOMER_DINING_COUNT_ZERO,
      ],
    ).then((json) => {
      this.loading = false
      this.verificationStatusCode(json.code)
      return json
    })
  }

  //  客户列表
  fetchListCustomer() {
    return ListCustomer({
      level: 2,
      type: 2,
      paging: {
        limit: 999,
        offset: 0,
      },
    }).then((json) => {
      this.customerList = _.map(json.response.customers, (item) => {
        return {
          label: item.name,
          value: item.customer_id,
          original: item,
        }
      })
      return json.response
    })
  }

  // 学期列表
  fetchListTerm() {
    return ListSemester({
      paging: { limit: 999 },
    }).then((json) => {
      this.termList = json.response.semesters
      return json
    })
  }

  // 餐次列表
  fetchMealTimesList() {
    return ListMenuPeriodGroup({ paging: { limit: 999 } }).then((json) => {
      const { menu_period } = json.response
      const menuList: MenuPeriodGroup[] = []
      _.forEach(menu_period, (item) => {
        if (item.menu_period_group) {
          menuList.push(item.menu_period_group)
        }
      })

      this.mealTimesInfo = [
        { label: t('全部餐次'), value: '' },
        ..._.map(menuList, (it) => {
          return {
            label: it.name,
            value: it.menu_period_group_id,
          }
        }),
      ]
      return json.response
    })
  }
}

export default new Store()
