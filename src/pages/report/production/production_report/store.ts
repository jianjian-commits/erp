import {
  GetProductionProduceTaskData,
  GetProductionProduceTaskDataResponse,
} from 'gm_api/src/databi'
import {
  BomSnapMap,
  BomSnapshotId,
  CleanFoodTaskDataFields,
  ListBomSnapshot,
  ListBomSnapshotResponse,
  Task_Type,
} from 'gm_api/src/production'
import { action, makeObservable, observable } from 'mobx'
import BaseStore, { initFilter } from '../base.store'

export class ProductionReportStore extends BaseStore {
  constructor() {
    super()
    makeObservable(this, {
      tab: observable,
      view: observable,
      cachedFilter: observable,
      boms: observable,
      setTab: action,
      fetchProductionReport: true,
      getReportData: action,
    })
  }

  /** 净菜和熟食 */
  tab: Task_Type = Task_Type.TYPE_PRODUCE_CLEANFOOD
  /** 按商品查看和按商品+bom查看 */
  view: CleanFoodTaskDataFields =
    CleanFoodTaskDataFields.CLEANFOODTASKDATAFIELDS_SKU_BOM

  cachedFilter: any = {
    [Task_Type.TYPE_PRODUCE]: { ...initFilter },
    [Task_Type.TYPE_PRODUCE_CLEANFOOD]: { ...initFilter },
  }

  boms: { [key: string]: BomSnapMap } = {}

  setTab(tab: Task_Type) {
    // this.clear()
    const filter = this.filter
    if (tab === Task_Type.TYPE_PRODUCE) {
      this.filter = this.cachedFilter[Task_Type.TYPE_PRODUCE]
      this.cachedFilter[Task_Type.TYPE_PRODUCE_CLEANFOOD] = filter
    } else {
      this.filter = this.cachedFilter[Task_Type.TYPE_PRODUCE_CLEANFOOD]
      this.cachedFilter[Task_Type.TYPE_PRODUCE] = filter
    }

    this.tasks = []
    this.tab = tab
    this.doRequest()
  }

  setView(view: CleanFoodTaskDataFields) {
    this.view = view
  }

  // override
  searchData() {
    return {
      ...super.searchData(),
      task_type: this.tab,
      task_data_filter: this.filter.searchTarget,
    }
  }

  fetchProductionReport(params?: any) {
    this.loading = true
    return GetProductionProduceTaskData({
      ...this.searchData(),
      task_expr: {
        ...this.searchData().task_expr,
        limit: params.paging.limit,
        offset: params.paging.offset,
      },
    })
      .then((json) => {
        const { task_data } = json.response
        this.getReportData(json.response, this.tab)
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

  fetchBoms(bom_ids: BomSnapshotId[]) {
    if (bom_ids.length) {
      return ListBomSnapshot({
        bom_snapshot_ids: bom_ids,
      }).then((json) => json.response)
    }
    return {}
  }

  async getReportData(
    data: GetProductionProduceTaskDataResponse,
    taskType: Task_Type,
  ) {
    const tasks = await this.getTaskData(data, taskType)
    // 单品才需要bom快照查到一些信息
    if (taskType === Task_Type.TYPE_PRODUCE_CLEANFOOD) {
      const bom_ids = tasks.map((b) => {
        return {
          bom_id: b.bom_id,
          revision: b.bom_revisions,
        } as BomSnapshotId
      })
      const _boms = (await this.fetchBoms(bom_ids)) as ListBomSnapshotResponse
      this.boms = _boms.bom_snapshots
    }
    // 这行必须放在上面if的下方，否则会出现渲染问题，因为如果是单品，上面的if执行后会刷新页面
    this.tasks = tasks
  }
}

export default new ProductionReportStore()
