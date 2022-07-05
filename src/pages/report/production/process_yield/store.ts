import { ModelValue } from 'gm_api/src/analytics'
import { GetProductionProduceTaskDataProcessYieldRate } from 'gm_api/src/databi'
import {
  ExportTaskDataProcessYieldRate,
  TaskDataFilter,
  Task_Type,
} from 'gm_api/src/production'
import { makeObservable } from 'mobx'
import BaseStore from '../base.store'

class Store extends BaseStore {
  constructor() {
    super()
    makeObservable(this, {
      fetchProcessYieldReport: true,
      data: true,
    })
  }

  // override
  searchData() {
    return {
      ...super.searchData(),
      // 只查净菜
      task_data_filter: TaskDataFilter.TASKDATAFILTER_PRODUCT,
      task_type: Task_Type.TYPE_PRODUCE_CLEANFOOD,
    }
  }

  // override
  data: ModelValue[] = []

  fetchProcessYieldReport(params?: any) {
    this.loading = true
    return GetProductionProduceTaskDataProcessYieldRate({
      ...this.searchData(),
      task_expr: {
        ...this.searchData().task_expr,
        limit: params.paging.limit,
        offset: params.paging.offset,
      },
    })
      .then((json) => {
        const { task_data_process_yield_rate } = json.response
        const values = task_data_process_yield_rate?.model_values
        this.data = values || []
        this.loading = false

        return {
          paging: {
            count: task_data_process_yield_rate?.count,
            has_more: task_data_process_yield_rate?.has_more,
          },
        }
      })
      .catch(() => {
        this.loading = false
      })
  }

  // override
  async exportTaskData({
    type,
    task_data_filter,
    onlyOne,
  }: {
    type: Task_Type
    task_data_filter: TaskDataFilter
    /** 是否仅导出当前页面的 */
    onlyOne: boolean
  }) {
    const req = this.searchData()
    const q = this.data?.[0]?.kv?.['成品编码']
    await ExportTaskDataProcessYieldRate({
      get_many_sku_request: {
        ...req.get_many_sku_request,
        q: onlyOne ? q : '',
      },
      begin_time: req.time_range.begin_time,
      end_time: req.time_range.end_time,
      time_field: req.time_range.time_field,
      task_type: type,
      task_data_filter,
    })
  }
}

export default new Store()
