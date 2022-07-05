import React, { FC } from 'react'
import { t } from 'gm-i18n'

const ConfirmTips: FC = () => {
  return <div>{t('部分商品未选择出库批次, 是否自动匹配批次')}</div>
}

export default ConfirmTips
