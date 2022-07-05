import React, { useState } from 'react'
import _ from 'lodash'
import { Select, Input, Flex } from '@gm-pc/react'
import { orderSearchType, skuSearchType } from '../../../enum'
import { t } from 'gm-i18n'

interface SearchFilterProps {
  type?: string
  value: {
    serial_no: string
    receive_customer_id: string
    sku_q?: string
  }
  onChange: (key: any, v: any) => void
}
const SearchFilter = ({ type, value, onChange }: SearchFilterProps) => {
  const [selected, setSelected] = useState(1)
  //   const ext = type === 'view_sku' ? skuSearchType : []
  const list = [
    {
      value: 1,
      text: t('按订单号'),
      key: 'serial_no',
      desc: t('输入订单号搜索'),
    },
  ]
  const target = _.find(list, (v) => v.value === selected)
  const { key, desc } = target || {}
  const onSelectChange = (selected: number) => {
    setSelected(selected)
    // 切换的时候要清空上次输入框的数据
    onChange(key, undefined)
  }
  return (
    <Flex>
      <div className='gm-padding-right-5' style={{ minWidth: '90px' }}>
        <Select
          clean
          className='gm-block'
          data={list}
          value={selected}
          onChange={onSelectChange}
        />
      </div>
      <Flex flex>
        <Input
          className='gm-inline-block form-control'
          value={value[key as 'serial_no' | 'receive_customer_id']}
          onChange={(e) => {
            onChange(key, _.trim(e.target.value))
          }}
          placeholder={desc}
        />
      </Flex>
    </Flex>
  )
}

export default SearchFilter
