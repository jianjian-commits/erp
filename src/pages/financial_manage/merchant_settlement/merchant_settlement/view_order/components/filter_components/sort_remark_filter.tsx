import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'

const SortRemarkFilter = (props: {
  value: string
  onChange: (v: string) => void
}) => {
  function handleSearch() {}
  const [remarks, setRemarks] = useState([])

  return (
    <Select
      data={[{ value: '', text: t('全部分拣备注') }, ...remarks]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default SortRemarkFilter
