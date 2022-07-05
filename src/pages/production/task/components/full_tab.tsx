import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { FullTabs } from '@gm-pc/frame'
import { Task_Type, ProduceType } from 'gm_api/src/production'

import Task from '..'
import TaskCommand from '../../task_command'

interface FullProps {
  taskType?: Task_Type
  produceType?: ProduceType
}

const FullTab: FC<FullProps> = observer(({ taskType, produceType }) => {
  const isTaskPack = taskType === Task_Type.TYPE_PACK
  const isProducePack = produceType === ProduceType.PRODUCE_TYPE_PACK
  const test = (value: boolean): string => (value ? '包装' : '生产')
  return (
    <FullTabs
      tabs={[
        {
          text: t(`${test(isTaskPack)}计划`),
          value: 'plan',
          children: <Task type={taskType} />,
        },
        {
          text: t(`${test(isProducePack)}任务`),
          value: 'task',
          children: <TaskCommand type={produceType} />,
        },
      ]}
      defaultActive='plan'
    />
  )
})

export default FullTab
