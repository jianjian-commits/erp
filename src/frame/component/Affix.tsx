import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Affix } from 'antd'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import taskPng from '../../img/task.png'
import '../style.less'

const TaskAffix: FC = observer(() => {
  return (
    <Affix className='affix'>
      <div className='affix-item' onClick={() => globalStore.showTaskPanel()}>
        <img src={taskPng} />
        <span>{t('任务')}</span>
      </div>
    </Affix>
  )
})

export default TaskAffix
