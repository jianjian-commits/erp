import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Tip } from '@gm-pc/react'

import store from '../../store'
import { Action } from '@/pages/production/plan_management/plan/components/action'
import { PlanModal } from '@/pages/production/plan_management/plan/components/plan_modal'
import { message } from 'antd'

// 生产计划 -- 手工新建以及未下达状态下可以删除
interface ActionProps {
  taskId: string
  editDisabled?: boolean
  deleteDisabled?: boolean
  /** 删除时执行的动作 */
  onSearchDelete: (list: any[], num: number) => Promise<any>
}

const DemandAction: FC<ActionProps> = observer(
  ({ taskId, editDisabled, deleteDisabled, onSearchDelete }) => {
    const [deleteModal, setDeleteModal] = useState(false)
    const task = store.taskDetails?.[taskId]
    if (!task) return <div />
    const { isEditing, _plan_amount, plan_amount } = task

    const handleEditTask = () => {
      store.updateListColumn(taskId, 'isEditing', true)
    }

    const handleEditTaskCancel = () => {
      store.updateListColumn(taskId, 'isEditing', false)
      // 更正plan_amount
      store.updateListColumn(taskId, 'plan_amount', _plan_amount || '')
    }

    const handleEditTaskSave = () => {
      // 校验当前输入是否为空或为0
      if (plan_amount === '0' || !plan_amount) {
        Tip.tip(t('填写数值不能为空或为0，请修改！'))
        return
      }
      store.updateListColumn(taskId, 'isEditing', false)
      store.updateTask(taskId).then((json) => {
        if (json.response.task) {
          Tip.success(t('更新成功！'))
          // 更新列表，拿到最新的update_time，否则第二次更新会有问题
          onSearchDelete([''], 0)
        }
        return json
      })
    }

    const handleDelete = () => {
      store.updateTask(taskId, true).then((json) => {
        if (json) {
          message.success(t('删除成功'))
          handleChangeModal()
          onSearchDelete(Object.keys(store.taskDetails), 1)
        }
      })
    }

    const handleChangeModal = () => {
      setDeleteModal((v) => !v)
    }

    return (
      <>
        <Action
          isEditing={isEditing!}
          editDisabled={editDisabled}
          deleteDisabled={deleteDisabled}
          onEdit={handleEditTask}
          onSave={handleEditTaskSave}
          onDelete={handleChangeModal}
          onClose={handleEditTaskCancel}
        />
        <PlanModal
          title={t('作废需求')}
          visible={deleteModal}
          onCancel={handleChangeModal}
          onOk={handleDelete}
          destroyOnClose
        >
          <div>{t('警告')}</div>
          <div>
            {t(
              `需求作废后，没有产出数据的关联任务和下级任务及其它们的指令和投料都将被作废，已有产出数据的需求及任务将不会被作废；`,
            )}
          </div>
        </PlanModal>
      </>
    )
  },
)

export default DemandAction
