import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Input, Select, Flex } from '@gm-pc/react'
import { FtSheet } from '../../interface'

interface Props {
  select: number
  input_value: { customer_q: string; sku_q: string }
  onChange: <T extends keyof FtSheet>(key: T, value: FtSheet[T]) => any
}

const selectData = [
  {
    text: t('按客户'),
    value: 0,
  },
  {
    text: t('按周转物'),
    value: 1,
  },
]

const SelectFilter: FC<Props> = (props) => {
  const {
    input_value: { customer_q, sku_q },
    select,
    onChange,
  } = props
  const change_select = select === 1
  const test = change_select ? '周转物名称' : '客户名称/客户编码'
  const handleSelect = (e: number) => {
    onChange('select_type', e)
  }
  const handleChange = (e: string) => {
    const change_p = change_select ? 'sku_q' : 'customer_q'
    onChange(change_p, e)
  }
  return (
    <Flex>
      <Select clean value={select} onChange={handleSelect} data={selectData} />
      <Input
        style={{ width: '75%' }}
        value={change_select ? sku_q : customer_q}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t(`输入${test}搜索`)}
      />
    </Flex>
  )
}

export default observer(SelectFilter)
