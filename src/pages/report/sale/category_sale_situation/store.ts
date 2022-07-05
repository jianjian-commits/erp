import { makeAutoObservable, computed } from 'mobx'
import { DiyShowMapType, SortsType } from '@gm-pc/table-x'
import {
  GetOrderCategorySaleData,
  GetOrderCategorySaleDataRequest,
  GetOrderCategorySaleDataRequest_Type,
} from 'gm_api/src/databi'
import { ExportOrderCategorySaleData } from 'gm_api/src/orderlogic'

import { Category } from '../interface'
import { formatQueryData, getExprBySorts } from '../../util'
import { BASE_SUMMARY } from '../constants'
export const INIT_SUMMARY = {
  ...BASE_SUMMARY,
  order_count: '-', // 订单数
  receive_customer_count: '-', // 下单客户数
}
export type CategorySaleFilter = Omit<GetOrderCategorySaleDataRequest, 'expr'> &
  Category
// 分类销售报表tab
export enum CategoryReportTab {
  CATEGORY1 = GetOrderCategorySaleDataRequest_Type.TYPE_CATEGORY1,
  CATEGORY2 = GetOrderCategorySaleDataRequest_Type.TYPE_CATEGORY2,
}

type CategorySaleFilters = {
  [key in CategoryReportTab]: CategorySaleFilter
}

type CategoryExpr = {
  [key in CategoryReportTab]?: GetOrderCategorySaleDataRequest['expr']
}

type SummaryType = {
  [key in CategoryReportTab]: typeof INIT_SUMMARY
}

const INIT_FILTER: CategorySaleFilters = {
  [CategoryReportTab.CATEGORY1]: {},
  [CategoryReportTab.CATEGORY2]: {},
} as CategorySaleFilters

const INIT_SUMMARYS: SummaryType = {
  [CategoryReportTab.CATEGORY1]: {
    ...INIT_SUMMARY,
  },
  [CategoryReportTab.CATEGORY2]: {
    ...INIT_SUMMARY,
  },
}
class Store {
  filter: CategorySaleFilters = { ...INIT_FILTER }

  expr: CategoryExpr = {}

  summary: SummaryType = { ...INIT_SUMMARYS }

  didInit = false
  activeTab: CategoryReportTab = CategoryReportTab.CATEGORY1

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.filter = { ...INIT_FILTER }

    this.expr = {}

    this.summary = { ...INIT_SUMMARYS }

    this.didInit = false
    this.activeTab = CategoryReportTab.CATEGORY1
  }

  updateFilter(params: CategorySaleFilter) {
    if (!this.didInit) {
      this.filter = {
        [CategoryReportTab.CATEGORY1]: {
          ...params,
          category_type: +CategoryReportTab.CATEGORY1,
          need_summary_data: true,
        },
        [CategoryReportTab.CATEGORY2]: {
          ...params,
          category_type: CategoryReportTab.CATEGORY2,
          need_summary_data: true,
        },
      }
      this.didInit = true
    } else {
      this.filter[this.activeTab] = {
        ...params,
        need_summary_data: true,
      }
    }
  }

  onTabChange(activeTab: CategoryReportTab) {
    this.activeTab = activeTab
  }

  @computed
  getActiveTab() {
    const isActiveCategory1 = this.activeTab === CategoryReportTab.CATEGORY1
    const isActiveCategory2 = this.activeTab === CategoryReportTab.CATEGORY2
    return {
      isActiveCategory1,
      isActiveCategory2,
    }
  }

  // 报表
  getList(
    category_type: CategoryReportTab,
    params: CategorySaleFilter & { sorts: SortsType },
  ) {
    const { category } = params
    Object.assign(params, { category: { ...category, category_type } })
    const req = {
      ...category,
      ...params,
      category_type,
      request_type: category_type,
    } as unknown as GetOrderCategorySaleDataRequest
    if (params.sorts && Object.keys(params.sorts).length) {
      req.expr = this.expr[this.activeTab] = getExprBySorts(params.sorts)
    } else {
      this.expr[this.activeTab] = undefined
    }
    return GetOrderCategorySaleData(req).then((json) => {
      const formatData = formatQueryData(json)
      const { summaryData } = formatData
      this.summary[category_type] = { ...INIT_SUMMARY, ...summaryData }
      return formatData
    })
  }

  // 导出
  exportList(diyShowMap: DiyShowMapType) {
    const { category } = this.filter[this.activeTab]
    return ExportOrderCategorySaleData({
      fields: diyShowMap,
      filter: {
        ...category,
        ...this.filter[this.activeTab],
        expr: this.expr[this.activeTab],
        request_type: +this.activeTab,
      } as GetOrderCategorySaleDataRequest,
    })
  }
}
export default new Store()
