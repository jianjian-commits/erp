import React, { useState } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Select, Input, Flex } from '@gm-pc/react'
import store from '../store'
// 列表文本搜索
export const listSearchType = [
  {
    value: 0,
    text: t('按商户名称'),
    desc: t('输入商户名称搜索'),
    key: 'customer_name',
  },
  {
    value: 1,
    text: t('按商户编号'),
    desc: t('输入商户编号搜索'),
    key: 'customer_id',
  },
]
const map_flied = ['customer_name', 'customer_id']

const SearchFilter = (props: {
  value: {
    customer_name: string
    customer_id: string
  }
  onChange: (key: any, v: any) => void
}) => {
  const [selected, setSelected] = useState(0)
  const target = _.find(listSearchType, (v) => v.value === selected)

  const handleChange = (value: string) => {
    props.onChange(map_flied[selected], value)
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
          onChange={(selected) => {
            setSelected(selected)
            store.reSetFilter()
          }}
        />
      </div>
      <Flex flex>
        <Input
          className='gm-inline-block form-control'
          value={props.value[target!.key as 'customer_name' | 'customer_id']}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={target!.desc}
        />
      </Flex>
    </Flex>
  )
}

export default SearchFilter
