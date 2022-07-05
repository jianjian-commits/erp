import { TaskInfo } from '@/pages/production/plan_management/plan/interface'
import { MoreSelectDataItem } from '@gm-pc/react'
import { DefaultOptionType } from 'antd/lib/select'
import { ListTaskRequest, Task_Type } from 'gm_api/src/production'

export interface Filter extends Omit<ListTaskRequest, 'paging'> {
  skuSelect?: DefaultOptionType[]
  /** 按生产成品 需求编号 */
  selected?: number
  task_type: Task_Type
  customerIds: MoreSelectDataItem<string>[]
  routeIds: MoreSelectDataItem<string>[]
  batch?: MoreSelectDataItem<number>
}

/** task_detail */
export interface TaskDetailsView extends Partial<TaskInfo> {
  children?: TaskInfo[]
}
