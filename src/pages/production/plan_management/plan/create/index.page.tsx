import Create from '@/pages/production/create'
import { t } from 'gm-i18n'
import React from 'react'

const TaskCreate = () => {
  document.title = t('新建生产需求')
  return <Create />
}

export default TaskCreate
