import { makeAutoObservable } from 'mobx'
import {
  ListTask,
  Task,
  Task_Category,
  DeleteTask,
  UpdateTaskStatus,
  CleanTask,
  Task_State,
} from 'gm_api/src/asynctask'
import { TabItem } from './interface'

const initTabList: Array<TabItem> = [
  {
    tab: '导出任务',
    key: '0',
    category: Task_Category.CATEGORY_EXPORT,
    dataList: [],
    dataObj: {},
  },
  {
    tab: '批量任务',
    key: '1',
    category: Task_Category.CATEGORY_OTHER,
    dataList: [],
    dataObj: {},
  },
]

class Store {
  tabList = [...initTabList]

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 获取任务列表
  getTaskList(category: Task_Category) {
    return ListTask({
      category,
      states: [
        Task_State.STATE_UNSPECIFIED,
        Task_State.STATE_CREATED,
        Task_State.STATE_READY,
        Task_State.STATE_RUNNING,
        Task_State.STATE_FAULTED,
        Task_State.STATE_COMPLETED,
      ],
    }).then((json) => {
      const { task_datas, tasks } = json.response
      if (category === Task_Category.CATEGORY_EXPORT) {
        // 导出任务
        this.tabList[0] = {
          ...this.tabList[0],
          dataList: tasks.slice(0, 50),
          dataObj: task_datas || {},
        }
      } else {
        // 导入任务
        this.tabList[1] = {
          ...this.tabList[1],
          dataList: tasks.slice(0, 50),
          dataObj: task_datas || {},
        }
      }
      return tasks
    })
  }

  // 更新任务文件下载状态
  downloadTask(taskItem: Task) {
    const { task_id, status, category } = taskItem
    UpdateTaskStatus({
      task_id,
      status: (Number(status) | 256).toString(),
    }).then(() => {
      this.getTaskList(Number(category))
    })
  }

  // 取消任务（导入任务不可取消）
  cancelTask(taskId: string) {
    DeleteTask({ task_id: taskId }).then(() => {
      this.getTaskList(Task_Category.CATEGORY_EXPORT)
    })
  }

  // 清空任务
  cleanTask(category: Task_Category) {
    CleanTask({ category }).then(() => {
      this.getTaskList(category)
    })
  }
}

export default new Store()
