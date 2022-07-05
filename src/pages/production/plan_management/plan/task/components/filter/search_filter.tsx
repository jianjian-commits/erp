import React, { useState, FC } from 'react'
import _ from 'lodash'
import { Select, Flex } from '@gm-pc/react'
import { ProduceType } from 'gm_api/src/production'
import { TASK_COMMAND_SELECT_TYPE } from '@/pages/production/enum'
import SelectName from './select_name'
import store from '../../store'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Input } from 'antd'
import { MoreSelectDataItem } from '@/pages/production/plan_management/plan/task/interface'

interface Props {
  value: {
    serial_no: string
    input_sku_ids_list: MoreSelectDataItem[]
    output_sku_ids_list: MoreSelectDataItem[]
  }
  type?: ProduceType
  onSearch?: () => void
}

const SearchFilter: FC<Props> = ({ value: { serial_no }, type, onSearch }) => {
  const taskCommandSearchType = [
    type === ProduceType.PRODUCE_TYPE_PACK
      ? {
          value: TASK_COMMAND_SELECT_TYPE.outPut,
          text: t('按包装成品'),
          desc: t('输入包装成品名称搜索'),
          key: 'sku_name',
        }
      : {
          value: TASK_COMMAND_SELECT_TYPE.outPut,
          text: t('按生产成品'),
          desc: t('输入生产成品名称搜索'),
          key: 'sku_name',
        },
    {
      value: TASK_COMMAND_SELECT_TYPE.inPut,
      text: t('按物料名称'),
      desc: t('输入物料名称搜索'),
      key: 'process_name',
    },
    {
      value: TASK_COMMAND_SELECT_TYPE.serialNo,
      text: t('按任务编号'),
      desc: t('输入任务编号搜索'),
      key: 'serial_no',
    },
  ]
  const [selected, setSelected] = useState(1)
  const isPack = type === ProduceType.PRODUCE_TYPE_PACK
  const selectInput = selected === TASK_COMMAND_SELECT_TYPE.inPut
  const target = _.find(taskCommandSearchType, (v) => v.value === selected)

  // 用于判断搜索传值
  const handleSelect = (value: number) => {
    setSelected(value)
    store.updateFilter('select_type', value)
  }

  // 成品、物料
  const handleChangeSku = (value: string[]) => {
    store.updateFilter(
      selected === TASK_COMMAND_SELECT_TYPE.outPut
        ? 'output_sku_ids'
        : 'input_sku_ids',
      value,
    )
  }

  // 编号
  const handleChangeName = (value: string) => {
    store.updateFilter('serial_no', value)
    onSearch && onSearch()
  }
  return (
    <Flex>
      <div className='gm-padding-right-5'>
        <Select
          clean
          style={{ minWidth: 100 }}
          className='gm-inline-block'
          data={taskCommandSearchType}
          value={selected}
          onChange={handleSelect}
        />
      </div>
      <Flex flex style={{ minWidth: '200px' }}>
        {selected !== TASK_COMMAND_SELECT_TYPE.serialNo && (
          <SelectName
            key={selected}
            isPack={isPack}
            isMaterial={selectInput}
            onChange={(value: string[]) => {
              handleChangeSku(value)
              onSearch && onSearch()
            }}
          />
        )}
        {selected === TASK_COMMAND_SELECT_TYPE.serialNo && (
          <Input
            style={{ minWidth: '250px' }}
            className='gm-inline-block form-control'
            value={serial_no}
            onChange={(e) => handleChangeName(e.target.value)}
            placeholder={target!.desc}
          />
        )}
      </Flex>
    </Flex>
  )
}

export default observer(SearchFilter)
