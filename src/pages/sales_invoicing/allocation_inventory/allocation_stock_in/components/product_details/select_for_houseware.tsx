import React, { FC } from 'react'
import { Select } from 'antd'

interface SelectForHousewareProps {}

const SelectForHouseware: FC<SelectForHousewareProps> = () => {
  const setSchoolCustomer = (type, value) => {
    console.log('hello', type, value)
  }
  return (
    <Select
      options={[
        {
          value: '1',
          text: '默认仓',
        },
      ]}
      value='1'
      placeholder='选择货位'
      onChange={(value: string) => {
        setSchoolCustomer('credit_type', value)
      }}
    />
  )
}

export default SelectForHouseware
