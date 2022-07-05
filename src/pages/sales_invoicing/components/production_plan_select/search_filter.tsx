import React, { useState } from 'react'
import _ from 'lodash'
import { Select, Input, Flex } from '@gm-pc/react'

import { listSearchType } from './enum'

const SearchFilter = (props: {
  value: {
    serial_no: string
    sku_name: string
  }
  onChange: (key: any, v: any) => void
}) => {
  const [selected, setSelected] = useState(1)
  const target = _.find(listSearchType, (v) => v.value === selected)

  const handleSelected = (selected: any) => {
    setSelected(selected)
    props.onChange(selected === 2 ? 'q' : 'serial_no', '')
  }

  const handleChange = (value: string) => {
    props.onChange(selected === 2 ? 'serial_no' : 'q', value)
  }

  return (
    <Flex>
      <div className='gm-padding-right-5'>
        <Select
          clean
          style={{ minWidth: 100 }}
          className='gm-inline-block'
          data={listSearchType}
          value={selected}
          onChange={handleSelected}
        />
      </div>
      <Flex flex>
        <Input
          className='gm-inline-block form-control'
          value={props.value[target!.key as 'serial_no' | 'sku_name']}
          onChange={(e) => handleChange(_.trim(e.target.value))}
          placeholder={target!.desc}
        />
      </Flex>
    </Flex>
  )
}

export default SearchFilter
