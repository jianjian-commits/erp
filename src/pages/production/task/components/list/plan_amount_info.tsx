import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { Task_Type } from 'gm_api/src/production'

import { history } from '@/common/service'

interface Props {
  type?: Task_Type
}

const PlanAmountInfo: FC<Props> = ({ type }) => {
  const text = type !== Task_Type.TYPE_PACK ? t('生产') : t('包装')

  const handleToSetting = () => {
    history.push('/system/setting/production_setting')
  }

  // 需要获取系统设置，可以设置为建议生产/包装数 / 需求数
  return (
    <div>
      {t(`计划${text}=建议${text}，计划下达前可修改此数值；若所关联订单中`)}
      <br />
      {t('商品发生变更，此数值将同步更新；计划下达后，此数值保持不变。')}
      <br />
      <a onClick={handleToSetting}>{t('点击更换计划生产默认配置')}</a>
    </div>
  )
}

export default PlanAmountInfo
