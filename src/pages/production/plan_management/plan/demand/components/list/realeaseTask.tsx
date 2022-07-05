import { PlanModal } from '@/pages/production/plan_management/plan/components/plan_modal'
import React, { FC } from 'react'
import { t } from 'gm-i18n'
import planTtore from '@/pages/production/plan_management/plan/store'
import { ReleaseTask } from 'gm_api/src/production'
import { PlanModalProps } from '@/pages/production/plan_management/plan/interface'
import globalStore from '@/stores/global'
import store from '../../store'

const ReleaseTaskModal: FC<PlanModalProps> = ({
  visible,
  onChangeVisible,
  selectId,
}) => {
  const { isProduce } = planTtore.producePlanCondition
  const title = isProduce ? t('生产') : t('包装')
  const handleCancel = () => {
    onChangeVisible()
  }
  const handleReleaseTask = () => {
    const params = selectId?.length
      ? { task_ids: selectId }
      : store.getSearchData()
    ReleaseTask({
      filter: { ...params, paging: { limit: 999 } },
    }).then(() => {
      onChangeVisible()
      globalStore.showTaskPanel('1')
    })
  }

  return (
    <PlanModal
      title={t('下达任务')}
      visible={visible}
      onCancel={handleCancel}
      onOk={handleReleaseTask}
    >
      <div>{t('说明')}</div>
      <div>
        {t(
          `1、批量下达${title}需求时，按需求${title}数下达，需求状态为未下达时才可下达需求；`,
        )}
      </div>
      <div>
        {t(`2、${title}任务按默认规则生成，规则可在设置-生产设置中查看。`)}
      </div>
    </PlanModal>
  )
}

export default ReleaseTaskModal
