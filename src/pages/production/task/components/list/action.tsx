import { Tip } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../../store'

// 生产计划 -- 手工新建以及未下达状态下可以删除
interface ActionProps {
  index: number
  editDisabled?: boolean
}

const { OperationCellRowEdit } = TableXUtil

const Action: FC<ActionProps> = observer(({ index, editDisabled }) => {
  const task = store.taskList[index]
  const { isEditing } = task

  const handleEditTask = (index: number) => {
    store.updateListColumn(index, 'isEditing', true)
  }

  const handleEditTaskCancel = (index: number) => {
    store.updateListColumn(index, 'isEditing', false)
    // 更正plan_amount
    const { _plan_amount } = store.taskList[index]
    store.updateListColumn(index, 'plan_amount', _plan_amount || '')
  }

  const handleEditTaskSave = (index: number) => {
    // 校验当前输入是否为空或为0
    if (task.plan_amount === '0' || !task.plan_amount) {
      Tip.tip(t('填写数值不能为空或为0，请修改！'))
      return
    }
    store.updateListColumn(index, 'isEditing', false)
    store.updateTask(index).then((json) => {
      if (json.response.task) {
        Tip.success(t('更新成功！'))
        // 更新列表，拿到最新的update_time，否则第二次更新会有问题
        store.doRequest()
      }
      return json
    })
  }

  return (
    <OperationCellRowEdit
      disabled={editDisabled}
      isEditing={isEditing || false}
      onClick={() => handleEditTask(index)}
      onCancel={() => handleEditTaskCancel(index)}
      onSave={() => handleEditTaskSave(index)}
    />
  )
})

export default Action
