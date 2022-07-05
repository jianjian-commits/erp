import React, { useState } from 'react'
import _ from 'lodash'
import { Select, Input, Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'

export const orderSearchType = [
  {
    value: 1,
    text: t('按订单号'),
    key: 'serial_no',
    desc: t('输入订单号搜索'),
  },
  {
    value: 2,
    text: t('按商户'),
    key: 'customer_text',
    desc: t('输入商户名称、商户编码搜索'),
  },
]
const SearchFilter = (props: {
  value: {
    serial_no: string
    customer_text: string
  }
  onChange: (key: any, v: any) => void
}) => {
  const [selected, setSelected] = useState(1)
  const target = _.find(orderSearchType, (v) => v.value === selected)
  return (
    <Flex>
      <div className='gm-padding-right-5' style={{ minWidth: '100px' }}>
        <Select
          className='gm-block'
          clean
          data={orderSearchType}
          value={selected}
          onChange={(value) => {
            props.onChange(target!.key, '')
            setSelected(value)
          }}
        />
      </div>
      <Flex flex>
        <Input
          className='gm-form-control'
          value={props.value[target!.key as 'serial_no' | 'customer_text']}
          onChange={(e) => props.onChange(target!.key, _.trim(e.target.value))}
          placeholder={target!.desc}
        />
      </Flex>
    </Flex>
  )
}

export default SearchFilter
