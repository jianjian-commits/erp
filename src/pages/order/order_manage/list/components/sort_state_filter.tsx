import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { sortTypes } from '../../../enum'

const SortStateFilter = (props: {
  value: number
  onChange: (v: number) => void
}) => {
  return (
    <Select
      data={[{ value: 0, text: t('全部分拣类型') }, ...sortTypes]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default SortStateFilter
