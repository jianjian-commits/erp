import { makeAutoObservable } from 'mobx'
import { GetProcessTask, ProcessTaskDetail, Task } from 'gm_api/src/production'
import { GetManySkuResponse_SkuInfo, SsuInfo } from 'gm_api/src/merchandise'
import _ from 'lodash'

interface TaskSsu extends Task {
  ssuInfo: SsuInfo
}
class Store {
  list: ProcessTaskDetail = {}

  skuList: { [key: string]: GetManySkuResponse_SkuInfo } = {}

  tasks: TaskSsu[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init() {
    this.list = {}
  }

  fetchList = (id: string) => {
    return GetProcessTask({ process_task_id: id }).then((json) => {
      const { process_task_detail, tasks, skus } = json.response
      this.list = process_task_detail!
      this.skuList = skus!
      this.tasks = _.map(
        _.toArray(tasks!),
        ({ sku_id, unit_id, ...another }) => ({
          ssuInfo: skus![sku_id!]?.ssu_map![unit_id],
          sku_id,
          unit_id,
          ...another,
        }),
      )
      return null
    })
  }
}

export default new Store()
export type { TaskSsu }
