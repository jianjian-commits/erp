import React, { useState } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Select, Input, Flex } from '@gm-pc/react'
import store from '../store'
// 列表文本搜索
export const listSearchType = [
  {
    value: 1,
    text: t('学生姓名'),
    desc: t('输入学生姓名搜索'),
    key: 'student_name',
  },
  {
    value: 2,
    text: t('家长姓名'),
    desc: t('输入家长姓名搜索'),
    key: 'parent_name',
  },
]
const SearchFilter = (props: {
  value: {
    student_name: string
    parent_name: string
  }
  onChange: (key: any, v: any) => void
}) => {
  const [selected, setSelected] = useState(1)
  const target = _.find(listSearchType, (v) => v.value === selected)

  const handleChange = (value: string) => {
    props.onChange(selected === 2 ? 'parent_name' : 'student_name', value)
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
            // 重置家长和学生姓名
            store.reSetFilter()
          }}
        />
      </div>
      <Flex flex>
        <Input
          className='gm-inline-block form-control'
          value={props.value[target!.key as 'student_name' | 'parent_name']}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={target!.desc}
        />
      </Flex>
    </Flex>
  )
}

export default SearchFilter
