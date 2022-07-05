import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'

const WeightFilter = (props: {
  value: string
  onChange: (v: string) => void
}) => {
  return (
    <Select
      data={[
        { value: '', text: t('全部计重类型') },
        { value: '0', text: t('不计重任务') },
        { value: '1', text: t('计重任务') },
      ]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default WeightFilter
