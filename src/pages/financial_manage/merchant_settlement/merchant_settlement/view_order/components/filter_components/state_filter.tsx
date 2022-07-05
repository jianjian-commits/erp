import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { orderState } from '../../enum'

const StateFilter = (props: { value: number; onChange: (v: any) => void }) => {
  return (
    <Select
      data={[{ value: 0, text: t('全部状态') }, ...orderState]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default StateFilter
