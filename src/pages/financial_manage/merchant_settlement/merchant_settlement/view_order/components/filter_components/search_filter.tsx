import React, { useState } from 'react'
import _ from 'lodash'
import { Select, Input, Flex } from '@gm-pc/react'
import { orderSearchType, skuSearchType } from '../../enum'

const SearchFilter = (props: {
  type?: string
  value: {
    serial_no: string
    receive_customer_id: string
    ssu_q?: string
  }
  onChange: (key: any, v: any) => void
}) => {
  const [selected, setSelected] = useState(1)
  const ext = props.type === 'view_sku' ? skuSearchType : []
  const list = [...orderSearchType, ...ext]
  const target = _.find(list, (v) => v.value === selected)

  return (
    <Flex>
      <div className='gm-padding-right-5' style={{ minWidth: '90px' }}>
        <Select
          clean
          className='gm-block'
          data={list}
          value={selected}
          onChange={setSelected}
        />
      </div>
      <Flex flex>
        <Input
          className='gm-inline-block form-control'
          value={
            props.value[target!.key as 'serial_no' | 'receive_customer_id']
          }
          onChange={(e) => props.onChange(target!.key, _.trim(e.target.value))}
          placeholder={target!.desc}
        />
      </Flex>
    </Flex>
  )
}

export default SearchFilter
