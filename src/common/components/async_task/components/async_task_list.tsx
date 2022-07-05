import React, { FC } from 'react'
import { Progress } from 'antd'
import _ from 'lodash'
import moment from 'moment'
import { t } from 'gm-i18n'
import {
  Task,
  Task_Type,
  map_Task_Type,
  Task_State,
  TaskData,
  Task_Category,
} from 'gm_api/src/asynctask'
import { MapTaskModule } from '../enum'
import classNames from 'classnames'
import { TaskListProps } from '../interface'
import Store from '../store'
import '../style.less'

// 不符合模块命名规则的异步任务
const ReportModuleList = [1015, 1016, 1017, 1018, 1019, 2150, 2151]

const TaskList: FC<TaskListProps> = (props) => {
  const { taskList, taskObj } = props
  // 获取下载链接
  const getDownloadHref = (taskData: TaskData) => {
    let url = ''

    const values = taskData.parameters?.values
    if (values?.length) url = values[0]

    return taskData.failure_attach_url || taskData.success_attach_url || url
  }

  // 任务列表数据展示处理
  const getTaskData = (taskItem: Task) => {
    const { task_id, category, create_time, name, type, status } = taskItem
    const state = Number(taskItem.state)

    // 当state < 2时，task_data未生成
    const initTaskData = {
      progress: 0,
      total: 100,
      success_count: {},
      failure_count: {},
    }
    const taskData = taskObj[task_id] || initTaskData

    // 任务所属模块
    let module = ''
    if (type) {
      // 报表模块事件命名脱离规则，单独列出
      if (ReportModuleList.includes(type)) {
        module = MapTaskModule.REPORT
      } else {
        const taskType = Task_Type[type] || 'TYPE_MERCHANDISE'
        console.log('taskType.split()[1]', taskType.split('_')[1])
        module = (MapTaskModule as any)[taskType.split('_')[1]]
      }
    }
    const { progress, total, success_count, failure_count } = taskData
    const taskName = name || map_Task_Type[Number(type)] || ''

    let percent = 0
    if (Number(total) !== 0) {
      percent = Math.round((Number(progress) / Number(total)) * 100) || 0
    }

    // 文件下载链接
    const downloadHref = getDownloadHref(taskData)
    const successCount = success_count?.total || 0
    const failureCount = failure_count?.total || taskItem.failure_count || 0
    // 文件是否被下载过，位运算
    const showDownloadTip = downloadHref && !(Number(status) & 256)
    const createTime = moment(Number(create_time)).format('YYYY-MM-DD HH:mm')
    return {
      taskId: task_id,
      category,
      module,
      taskName,
      state,
      percent,
      showDownloadTip,
      downloadHref,
      successCount,
      failureCount,
      createTime,
    }
  }

  return (
    <div className='task-list'>
      {_.map(taskList, (taskItem) => {
        const {
          taskId,
          category,
          module,
          taskName,
          state,
          percent,
          showDownloadTip,
          downloadHref,
          successCount,
          failureCount,
          createTime,
        } = getTaskData(taskItem)
        return (
          <div
            className={classNames(
              'gm-flex',
              'gm-flex-column',
              'gm-flex-justify-center',
              'task-list-item',
              {
                'task-list-import': category === Task_Category.CATEGORY_OTHER,
                'task-list-export': category === Task_Category.CATEGORY_EXPORT,
              },
            )}
            key={taskId}
          >
            <div className='gm-flex task-list-item-line'>
              <div className='gm-flex gm-flex-justify-center gm-flex-align-center task-list-item-point-box'>
                {showDownloadTip && (
                  <div
                    className={classNames(
                      'task-list-item-point',
                      `task-list-item-${failureCount ? 'faulire' : 'success'}`,
                    )}
                  />
                )}
              </div>
              <div
                className={classNames('task-list-item-title', {
                  'task-list-item-title-short':
                    state === Task_State.STATE_FAULTED &&
                    category === Task_Category.CATEGORY_EXPORT,
                })}
              >
                {console.log(module, 'taskName')}
                {t(`【${module}】`)}&nbsp;{t(taskName)}
              </div>
              {state > Task_State.STATE_CANCELED && downloadHref && (
                <a
                  className='task-list-item-btn task-list-item-btn-success'
                  href={downloadHref}
                  onClick={() => Store.downloadTask(taskItem)}
                >
                  {t('下载')}
                </a>
              )}
              {state === Task_State.STATE_FAULTED &&
                category === Task_Category.CATEGORY_EXPORT &&
                !downloadHref && (
                  <span className='task-list-item-btn task-list-item-faulire-count'>
                    {t('导出失败，请重试')}
                  </span>
                )}
              {category === Task_Category.CATEGORY_EXPORT &&
                state > Task_State.STATE_UNSPECIFIED &&
                state < Task_State.STATE_CANCELED && (
                  <a
                    className='task-list-item-btn task-list-item-btn-success'
                    onClick={() => Store.cancelTask(taskId)}
                  >
                    {t('取消')}
                  </a>
                )}
            </div>
            {state > Task_State.STATE_UNSPECIFIED &&
            state < Task_State.STATE_CANCELED ? (
              <Progress
                className='task-list-item-line task-list-item-progress'
                percent={percent}
              />
            ) : (
              category === 999 && (
                <div className='task-list-item-line'>
                  <span>
                    {t('成功')}
                    {successCount}&nbsp;&nbsp;
                  </span>
                  {failureCount !== 0 && (
                    <span className='task-list-item-faulire-count'>
                      {t('失败')}
                      {failureCount}
                    </span>
                  )}
                </div>
              )
            )}
            <div className='task-list-item-line task-list-item-time'>
              {createTime}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TaskList
