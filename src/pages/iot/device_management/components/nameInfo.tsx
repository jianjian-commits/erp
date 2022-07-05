import React, { FC } from 'react'
import { ControlledFormItem } from '@gm-pc/react'
import { formatDateTime } from '@/common/util'

import { t } from 'gm-i18n'

import PaddingDiv from '@/pages/iot/device_management/components/paddingDiv'

const NameInfo: FC<{ create_time: string; creater_name: string }> = ({
  create_time,
  creater_name,
}) => {
  return (
    <>
      <ControlledFormItem label={t('创建时间')}>
        <PaddingDiv>{formatDateTime(+create_time)}</PaddingDiv>
      </ControlledFormItem>
      <ControlledFormItem label={t('创建用户')}>
        <PaddingDiv>{creater_name}</PaddingDiv>
      </ControlledFormItem>
    </>
  )
}

export default NameInfo
