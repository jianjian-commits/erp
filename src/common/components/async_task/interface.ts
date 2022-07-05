import { Task, TaskData, Task_Category } from 'gm_api/src/asynctask'

// 任务列表
export type Tasks = Array<Task>

// 任务数据
export type TaskDatas = { [key: string]: TaskData }

// tab项展示数据
export interface TabItem {
  // 展示文字
  tab: string
  key: string
  // 任务类型，用于获取列表数据
  category: Task_Category
  dataList: Tasks
  dataObj: TaskDatas
}

// 任务列表组件参数
export interface TaskListProps {
  taskList: Tasks
  taskObj: TaskDatas
}
