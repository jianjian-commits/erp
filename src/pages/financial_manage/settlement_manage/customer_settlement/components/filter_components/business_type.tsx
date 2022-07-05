import React, { VFC } from 'react'
import { Select, SelectProps } from '@gm-pc/react'
import { businessTypeSelectData } from '@/pages/financial_manage/settlement_manage/customer_settlement/constant'

const BusinessType: VFC<SelectProps<number>> = (props) => {
  return (
    <Select
      data={businessTypeSelectData}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default BusinessType
