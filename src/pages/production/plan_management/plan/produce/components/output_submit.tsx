import { PlanModal } from '@/pages/production/plan_management/plan/components/plan_modal'
import React, { FC } from 'react'
import { t } from 'gm-i18n'

interface Props {
  visible: boolean
  handleCancel: () => void
  handleSubmit: () => void
}
const OutputSubmit: FC<Props> = ({ visible, handleSubmit, handleCancel }) => {
  const title = t('产出提交')
  const context = t('产出为"未提交"状态的时候,才可提交入库')
  return (
    <PlanModal
      title={title}
      visible={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
    >
      <div>{context}</div>
    </PlanModal>
  )
}
export default OutputSubmit
