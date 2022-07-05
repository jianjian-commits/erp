import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Switch } from '@gm-pc/react'

import { BSwitchProps } from './interface'

const BSwitch: FC<BSwitchProps> = (props) => {
  return (
    <>
      <Switch {...props} type='primary' on={t('开启')} off={t('关闭')} />
      {props.tip && (
        <div className='gm-text-desc gm-margin-top-5'>{props.tip}</div>
      )}
    </>
  )
}

export default BSwitch
