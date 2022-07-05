import React, { useState } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Select, Input, Flex } from '@gm-pc/react'
import store from '../store'
// 列表文本搜索
export const listSearchType = [
  // {
  //   value: 0,
  //   text: t('按商品名'),
  //   desc: t('输入商品名搜索'),
  //   key: 'sku_name',
  // },
  {
    value: 1,
    text: t('按商品编号'),
    desc: t('输入商品编号搜索'),
    key: 'ssu_customize_code',
  },
  {
    value: 2,
    text: t('按售后单号'),
    desc: t('输入售后单号搜索'),
    key: 'serial_no',
  },
  {
    value: 3,
    text: t('按订单号'),
    desc: t('输入订单号搜索'),
    key: 'order_serial_no',
  },
  // {
  //   value: 4,
  //   text: t('按账户名称'),
  //   desc: t('输入账户名称搜索'),
  //   key: 'customer_user_name',
  // },
  // {
  //   value: 5,
  //   text: t('按商户名称'),
  //   desc: t('输入商户名称搜索'),
  //   key: 'customer_name',
  // },
]
const map_flied = [
  'sku_name',
  'ssu_customize_code',
  'serial_no',
  'order_serial_no',
  'customer_user_name',
  'customer_name',
]

const SearchFilter = (props: {
  value: {
    sku_name: string
    ssu_customize_code: string
    serial_no: string
    order_serial_no: string
    customer_user_name: string
    customer_name: string
  }
  onChange: (key: any, v: any) => void
}) => {
  const [selected, setSelected] = useState(1)
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
            // 重置家长和学生姓名
            store.reSetFilter()
          }}
        />
      </div>
      <Flex flex>
        <Input
          className='gm-inline-block form-control'
          value={
            props.value[
              target!.key as  // | 'sku_name'
                | 'ssu_customize_code'
                | 'serial_no'
                | 'order_serial_no'
              // | 'customer_user_name'
              // | 'customer_name'
            ]
          }
          onChange={(e) => handleChange(e.target.value)}
          placeholder={target!.desc}
        />
      </Flex>
    </Flex>
  )
}

export default SearchFilter
