import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'

const OutStockFilter = (props: {
  value: string
  onChange: (v: string) => void
}) => {
  return (
    <Select
      data={[
        { value: '', text: t('全部状态') },
        { value: '1', text: t('是') },
        { value: '0', text: t('否') },
      ]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default OutStockFilter
