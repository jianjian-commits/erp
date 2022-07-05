import { makeAutoObservable, toJS, runInAction } from 'mobx'
import moment from 'moment'
import {
  BatchExportBudget,
  BatchImportBudget,
  BatchUpdateBudget,
  DeleteBudget,
  SchoolType,
  SemesterType,
  Status_Code,
} from 'gm_api/src/enterprise'
import { ListBudgetAndOrder } from 'gm_api/src/orderlogic'
import _ from 'lodash'
import { message } from 'antd'
import { t } from 'gm-i18n'
import { FilterOptions, ListOptions, KVProps } from '../interface'
import detailStore from '../store/detailStore'

const initFilter: FilterOptions = {
  year: moment(),
  menu_period_group_id: '',
  school_type: SchoolType.SCHOOL_TYPE_UNSPECIFIED,
  semester_type: SemesterType.SEMESTER_TYPE_SPRING,
  q: '',
}

class Store {
  filter: FilterOptions = { ...initFilter }
  list: ListOptions[] = []
  count = 0

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init() {
    this.filter = initFilter
    this.list = []
  }

  updateFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
  }

  reSetFilter() {
    runInAction(() => {
      this.filter = initFilter
    })
  }

  get getSearchData() {
    const { year, menu_period_group_id } = this.filter
    return {
      ...this.filter,
      year: moment(year).format('YYYY'),
      menu_period_group_id: menu_period_group_id || undefined,
    }
  }

  fetchList(params?: any) {
    return ListBudgetAndOrder({
      list_budget_request: {
        list_budget_filter: this.getSearchData,
        paging: { ...params.paging }, // 分页
      },
    }).then((json) => {
      const { budgets, customer_relation, semester_relation, paging } =
        json.response.list_budget_response!
      const { budget_monthly_order_relation } = json.response
      const { mealTimesInfo } = detailStore

      this.list = _.map(budgets, (item) => {
        const mealInfo = _.find(
          mealTimesInfo,
          (it) => it.value === item.menu_period_group_id,
        )
        const customerItem = customer_relation![item?.customer_id!]
        const mealTimesCount =
          customerItem &&
          item.menu_period_group_id &&
          customerItem?.attrs?.default_dining_count?.dinning_count_map![
            item.menu_period_group_id!
          ]

        let order_id_count = 0
        let dining_count = 0
        let sale_price_sum = 0
        // @ts-expect-error
        const kvList: KVProps[] =
          _.map(
            budget_monthly_order_relation![item.budget_id]?.model_values!,
            (i) => {
              order_id_count += +i.kv?.order_id_count!
              dining_count += +i.kv?.dining_count!
              sale_price_sum += +i.kv?.sale_price_sum!
              return i.kv
            },
          ) || []

        // 学期
        const semesterItem = semester_relation![item.semester_id!]!
        return {
          ...item,
          ...customerItem,
          semester_type: semesterItem?.semester_type!,
          mealTimes: mealInfo?.label! || '-',
          mealTimesCount: +mealTimesCount! || 0,
          // @ts-ignore
          order_id_count: order_id_count || 0, // 每人已使用餐数,
          // @ts-ignore
          dinning_count: dining_count || 0, // 已使用总餐数
          // @ts-ignore
          order_price_sum: sale_price_sum || 0, // 已使用金额
          isExpired: +semesterItem?.end_time! < +moment().toDate(), // 是否过期
          used_amount_list: kvList,
        }
      })
      if (paging?.count) {
        this.count = +paging?.count
      }
      return json.response
    })
  }

  deleteBudget(budget_id: string) {
    return DeleteBudget(
      {
        budget_id,
      },
      [
        Status_Code.BUDGET_NOT_EXISTS,
        Status_Code.SEMESTER_NOT_EXISTS,
        Status_Code.SEMESTER_EXPIRED,
      ],
    ).then((json) => {
      if (json.code === Status_Code.BUDGET_NOT_EXISTS) {
        message.error(t('预算不存在!'))
        throw new Error(t('预算不存在!'))
      }
      if (json.code === Status_Code.SEMESTER_NOT_EXISTS) {
        message.error(t('学期不存在!'))
        throw new Error(t('学期不存在!'))
      }
      if (json.code === Status_Code.SEMESTER_EXPIRED) {
        message.error(t('学期已经过期!'))
        throw new Error(t('学期已经过期!'))
      }
      if (json.response.budget) {
        message.success(t('删除成功！'))
        this.doRequest()
      }
      return json
    })
  }

  // 批量导出预算
  exportBudget() {
    return BatchExportBudget({
      list_budget_filter: this.getSearchData,
    })
  }

  // 批量导入预算
  batchImportBudget(file_url: string) {
    return BatchImportBudget({
      file_url,
    })
  }

  // 批量修改预算
  batchUpdateBudget(file_url: string) {
    return BatchUpdateBudget({
      file_url,
    })
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }
}

export default new Store()
