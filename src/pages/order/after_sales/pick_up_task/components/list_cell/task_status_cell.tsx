import React, { FC } from 'react'
import { Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { taskStatusMap, taskStatus } from '../../enum'
import store from '../../store'
import type { ListOptions } from '../../interface'

const TaskStatusCell: FC<{ order?: ListOptions; index: number }> = ({
  index,
}) => {
  const order = store.list[index]

  const handleChange = (value: number) => {
    store.updateListColumn(index, 'task_status', value)
  }

  if (order.isEditing) {
    return (
      <Select
        value={order.task_status}
        style={{ minWidth: '70px' }}
        data={taskStatus}
        onChange={(value: number) => handleChange(value)}
        placeholder={t('请选择')}
      />
    )
  } else {
    return <div>{taskStatusMap[order?.task_status!] || t('-')}</div>
  }
}

export default observer(TaskStatusCell)
