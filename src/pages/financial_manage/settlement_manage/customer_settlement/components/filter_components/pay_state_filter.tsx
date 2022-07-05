import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { list_BillOrder_PayAndAfterState } from 'gm_api/src/finance'

const PayStateFilter = (props: {
  value: number
  onChange: (v: any) => void
}) => {
  return (
    <Select
      data={[
        { value: 0, text: t('全部状态') },
        ...list_BillOrder_PayAndAfterState,
      ]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default PayStateFilter
