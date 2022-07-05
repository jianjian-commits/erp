import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { Filters_Bool } from 'gm_api/src/common'

const IsOrNotFilter = (props: {
  value: number
  onChange: (v: number) => void
}) => {
  return (
    <Select
      data={[
        { value: Filters_Bool.ALL, text: t('全部状态') },
        { value: Filters_Bool.TRUE, text: t('是') },
        { value: Filters_Bool.FALSE, text: t('否') },
      ]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default IsOrNotFilter
