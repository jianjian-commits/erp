import React, { useState, FC } from 'react'
import _ from 'lodash'
import { Select, Input, Flex, MoreSelectDataItem } from '@gm-pc/react'
import { ProduceType } from 'gm_api/src/production'
import { taskCommandSearchType, TASK_COMMAND_SELECT_TYPE } from '../../../enum'
import SelectName from '@/pages/production/components/select_name'
import store from '../../store'
import { observer } from 'mobx-react'

interface Props {
  value: {
    serial_no: string
    input_sku_id: MoreSelectDataItem<string>
    output_sku_id: MoreSelectDataItem<string>
  }
  type?: ProduceType
}

const SearchFilter: FC<Props> = ({
  value: { serial_no, input_sku_id, output_sku_id },
  type,
}) => {
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
  const handleChangeSku = (value: MoreSelectDataItem<string>) => {
    store.updateFilter(
      selected === TASK_COMMAND_SELECT_TYPE.outPut
        ? 'output_sku_id'
        : 'input_sku_id',
      value,
    )
  }

  // 编号
  const handleChangeName = (value: string) => {
    store.updateFilter('serial_no', value)
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
      <Flex flex>
        {selected !== TASK_COMMAND_SELECT_TYPE.serialNo && (
          <SelectName
            key={selected}
            selectData={selectInput ? input_sku_id : output_sku_id}
            isPack={isPack}
            isMaterial={selectInput}
            onChange={(value: MoreSelectDataItem<string>) =>
              handleChangeSku(value)
            }
          />
        )}
        {selected === TASK_COMMAND_SELECT_TYPE.serialNo && (
          <Input
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
