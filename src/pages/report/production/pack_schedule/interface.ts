export interface PackScheduleData {
  plan_schedule: {
    total_plan_count: number // 总计划数
    finished_plan_count: number // 已完成计划数
    released_plan_count: number // 已下达计划数
    unreleased_plan_count: number // 未下达计划数
    [key: string]: any
  }
  process_schedule: {
    total_task_count: number // 总任务数
    finished_task_count: number // 已完成任务数
    released_task_count: number // 已下达任务数
    unreleased_task_count: number // 未下达任务数
    [key: string]: any
  }
}
