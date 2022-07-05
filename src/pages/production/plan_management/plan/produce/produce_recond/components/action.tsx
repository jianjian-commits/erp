import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Tip } from '@gm-pc/react'
import store from '../store'
import { Action } from '@/pages/production/plan_management/plan/components/action'
import _ from 'lodash'
import { PlanModal } from '@/pages/production/plan_management/plan/components/plan_modal'
import { message } from 'antd'
import { Task_Type } from 'gm_api/src/production'

interface ActionProps {
  process_task_output_log_id: string
  editDisabled?: boolean
  deleteDisabled?: boolean
  refresh: () => void
}

const RecondAction: FC<ActionProps> = observer(
  ({ process_task_output_log_id, refresh, editDisabled, deleteDisabled }) => {
    const recond = store.getRecond(process_task_output_log_id || '')
    const [deleteModal, setDeleteModal] = useState(false)
    const {
      isEditing,
      base_unit_amount,
      _base_unit_amount,
      amount,
      use_amount,
      type,
    } = recond
    const isPack = type === Task_Type.TYPE_PACK
    const handleEditRecond = () => {
      store.updateListColumn(process_task_output_log_id, 'isEditing', true)
    }

    const handleDelete = () => {
      store.deleteTaskOutputLog(process_task_output_log_id).then((json) => {
        if (json) {
          message.success(t('删除成功'))
          handleChangeModal()
          refresh()
        }
      })
    }
    const handleChangeModal = () => {
      setDeleteModal((v) => !v)
    }

    const handleEditRecondCancel = () => {
      store.updateListColumn(process_task_output_log_id, 'isEditing', false)
      store.updateListColumn(
        process_task_output_log_id,
        'base_unit_amount',
        _base_unit_amount || '',
      )
    }

    const handleEditRecondSave = () => {
      // 校验当前输入是否为空或为0,数量是否小于use_amount
      if ((!isPack && base_unit_amount === '0') || !base_unit_amount) {
        Tip.tip(t('填写数值不能为空或为0，请修改！'))
        return
      }
      if ((isPack && amount === '0') || !amount) {
        Tip.tip(t('填写数值不能为空或为0，请修改！'))
        return
      }
      if (!isPack && parseFloat(base_unit_amount) < parseFloat(use_amount!)) {
        Tip.tip(t('填写数值不能小于已使用量,请修改'))
        return
      }
      if (isPack && parseFloat(amount) < parseFloat(use_amount!)) {
        Tip.tip(t('填写数值不能超过已使用量,请修改'))
        return
      }
      store.updateListColumn(
        process_task_output_log_id,
        'base_unit_amount',
        _base_unit_amount || '',
      )
      store.updateListColumn(process_task_output_log_id, 'isEditing', false)
      store.updateRecond(process_task_output_log_id).then((json) => {
        if (json.response.process_task_output_log) {
          Tip.success(t('更新成功！'))
          refresh()
        }
        return json
      })
    }

    return (
      <>
        <Action
          isEditing={isEditing!}
          editDisabled={editDisabled}
          deleteDisabled={deleteDisabled}
          onEdit={handleEditRecond}
          onSave={handleEditRecondSave}
          onDelete={handleChangeModal}
          onClose={handleEditRecondCancel}
        />
        <PlanModal
          title={t('删除产出')}
          visible={deleteModal}
          onCancel={handleChangeModal}
          onOk={handleDelete}
          destroyOnClose
        >
          <div>{t('警告')}</div>
          <div>
            {t(
              `产出删除后,产出的数量将会返回到任务,且只有生产待入库未提交的产出可以删除,提交后不可删除`,
            )}
          </div>
        </PlanModal>
      </>
    )
  },
)

export default RecondAction
