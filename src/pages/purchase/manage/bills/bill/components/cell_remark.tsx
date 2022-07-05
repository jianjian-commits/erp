import React, { FC, ChangeEvent } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import { KCInput } from '@gm-pc/keyboard'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
import store from '../store'
import { Popover } from 'antd'

interface CellRemarkProps {
  index: number
}

const CellRemark: FC<CellRemarkProps> = (props) => {
  const { index } = props
  const { remark } = store.list[index] as any
  const { status } = store.info
  const isCommitted = status === (PurchaseSheet_Status.COMMIT as number)
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    store.updateRowColumn(index, 'remark', e.target.value)
  }
  if (isCommitted) {
    return (
      <Popover
        placement='bottom'
        overlayStyle={{ width: '200px' }}
        content={remark}
        trigger='hover'
      >
        <span className='b-span-overflow'> {remark || '-'}</span>
      </Popover>
    )
  }

  return (
    <KCInput
      maxLength={50}
      type='text'
      value={remark || ''}
      className='input-sm'
      onChange={handleChange}
    />
  )
}

export default observer(CellRemark)
