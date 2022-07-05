import { GetProductionPackTaskData } from 'gm_api/src/databi'
import { Task_Type } from 'gm_api/src/production'
import { makeObservable } from 'mobx'
import BaseStore from '../base.store'

class Store extends BaseStore {
  constructor() {
    super()
    makeObservable(this, {
      fetchPackReport: true,
    })
  }

  fetchPackReport(params?: any) {
    this.loading = true
    return GetProductionPackTaskData({
      ...this.searchData(),
      task_expr: {
        ...this.searchData().task_expr,
        limit: params.paging.limit,
        offset: params.paging.offset,
      },
    })
      .then((json) => {
        const { task_data } = json.response
        this.getReportData(json.response, Task_Type.TYPE_PACK)
        this.loading = false
        this.taskCount = +(task_data?.count || 0)
        this.updateTime = task_data?.update_time || ''

        return {
          paging: {
            count: task_data?.count,
            has_more: task_data?.has_more,
          },
        }
      })
      .catch(() => {
        this.loading = false
      })
  }
}

export default new Store()
