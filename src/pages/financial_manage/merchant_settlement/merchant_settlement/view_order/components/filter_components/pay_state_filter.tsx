import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { orderPayState } from '../../enum'

const PayStateFilter = (props: {
  value: number
  onChange: (v: any) => void
}) => {
  return (
    <Select
      data={[{ value: 0, text: t('全部状态') }, ...orderPayState]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default PayStateFilter
