import React, { FC } from 'react'
import { gmHistory } from '@gm-common/router'

import { t } from 'gm-i18n'

interface ProcessDrawerTitleProps {
  title: string
  count?: number
  isSelectAll?: boolean
  isDetail?: boolean
}

const countStyle = {
  marginLeft: '12px',
  fontSize: '14px',
  color: 'rgba(0, 0, 0, 0.86)',
}

const colorStyle = { color: '#176CFE' }

const spanStyle = {
  marginLeft: '12px',
  color: 'rgba(0, 0, 0, 0.61)',
  fontSize: '12px',
}

const ProcessDrawerTitle: FC<ProcessDrawerTitleProps> = (props) => {
  const { title, count, isSelectAll, isDetail } = props

  const handleClick = () => {
    gmHistory.push('/system/setting/delivery_date')
  }

  return (
    <>
      {t(title)}
      {!isDetail && (
        <span style={countStyle}>
          ({t('已选择数量')}:{isSelectAll ? t('全部') : count})
        </span>
      )}
      <span style={spanStyle}>
        {t('生成的计划默认按照预设的交期时间，去')}
        <a style={colorStyle} onClick={handleClick}>
          {t('计划交期设置')}
        </a>
      </span>
    </>
  )
}

export default ProcessDrawerTitle
