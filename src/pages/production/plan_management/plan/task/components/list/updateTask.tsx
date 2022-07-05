import { PlanModal } from '@/pages/production/plan_management/plan/components/plan_modal'
import React, { FC } from 'react'
import { ProcessTask_State } from 'gm_api/src/production'
import { getBatchActionContent_Task } from '@/pages/production/util'
import store from '../../store'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

interface Props {
  visible: boolean
  onChangeVisible: () => void
  state: ProcessTask_State
  onSearch: () => void
}
const UpdateTaskModal: FC<Props> = ({
  visible,
  onChangeVisible,
  state,
  onSearch,
}) => {
  const { title, context } = getBatchActionContent_Task(state)
  const { selectedRowKeys, selectAll, setInitData } = store
  const handleTask = () =>
    store
      .batchUpdateTask(selectAll, selectedRowKeys, state)
      ?.then(() => {
        Tip.success(t('操作成功'))
        onChangeVisible()
        setInitData()
        onSearch && onSearch()
      })
      .catch(() => {
        onChangeVisible()
      })
  const handleCancel = () => {
    onChangeVisible()
  }

  return (
    <PlanModal
      title={title}
      visible={visible}
      onCancel={handleCancel}
      onOk={handleTask}
    >
      <div>{context}</div>
    </PlanModal>
  )
}

export default UpdateTaskModal
