import { t } from 'gm-i18n'
import React from 'react'
import Create from '../../../create'

// 只有创建预生产计划，没有智能推荐
const TaskCreate = () => {
  document.title = t('新建生产需求')
  return <Create />
}

export default TaskCreate
