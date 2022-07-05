import { Flex, Input, Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { useState } from 'react'

export enum SearchType {
  /** 订单号（默认） */
  SERIAL_NO = 1,
  /** 商户信息（编号/名称） */
  CUSTOMER_INFO = 2,
  /** 商品信息（编号/名称） */
  SSU_INFO = 3,
}

const selectData = [
  {
    value: SearchType.SERIAL_NO,
    text: t('按订单号'),
    key: 'serial_no',
    desc: t('输入订单号搜索'),
  },
  {
    value: SearchType.CUSTOMER_INFO,
    text: t('按商户信息'),
    key: 'customer_search_text',
    desc: t('按商户编码/名称'),
  },
  {
    value: SearchType.SSU_INFO,
    text: t('按商品信息'),
    key: 'customize_code',
    desc: t('按商品编码/名称'),
  },
]

const SearchFilter = (props: {
  value: string
  onChange: (key: any, v: any, type: SearchType) => void
}) => {
  const [type, setType] = useState(SearchType.SERIAL_NO)

  return (
    <Flex>
      <div className='gm-padding-right-5' style={{ width: '100px' }}>
        <Select
          clean
          className='gm-block'
          data={selectData}
          value={type}
          onChange={(newType) => {
            setType(newType)

            props.onChange(SearchType[type].toLowerCase(), '', type)
            props.onChange(SearchType[newType].toLowerCase(), '', newType)
          }}
        />
      </div>
      <Flex flex>
        <Input
          className='gm-inline-block form-control'
          value={props.value}
          onChange={(e) => {
            props.onChange(SearchType[type].toLowerCase(), e.target.value, type)
          }}
          placeholder={selectData.find((option) => option.value === type)?.desc}
        />
      </Flex>
    </Flex>
  )
}

export default observer(SearchFilter)
