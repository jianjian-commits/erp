import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'

const RemarkFilter = (props: {
  value: string
  onChange: (v: string) => void
}) => {
  return (
    <Select
      data={[
        { value: '', text: t('全部备注') },
        { value: '1', text: t('有备注') },
        { value: '0', text: t('无备注') },
      ]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default RemarkFilter
