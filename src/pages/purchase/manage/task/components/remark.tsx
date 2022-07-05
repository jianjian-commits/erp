import React, { FC } from 'react'
import store from '../store'
import type { Task } from '../store'
import { PurchaseTask_Status } from 'gm_api/src/purchase'
import { Input, Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { Popover } from 'antd'
import { t } from 'gm-i18n'
import { wrap } from 'lodash'
interface RemarkProps {
  index: number
}
const Remark: FC<RemarkProps> = ({ index }) => {
  const task = store.list[index]
  function handleChange<T extends keyof Task>(
    index: number,
    key: T,
    value: Task[T],
  ) {
    store.rowUpdate(index, key, value)
  }
  const { remark, isEditing, status } = task

  if (isEditing && status < PurchaseTask_Status.RELEASED) {
    return (
      <Flex alignCenter>
        <Input
          placeholder={t('请输入备注')}
          onChange={(e) => handleChange(index, 'remark', e.target.value)}
          value={remark}
        />
      </Flex>
    )
  }
  return (
    <div className='b-input-long'>
      <Popover
        overlayStyle={{
          width: '200px',
          wordBreak: 'break-all',
        }}
        placement='topLeft'
        content={remark}
        trigger='hover'
      >
        <span>{remark || '-'}</span>
      </Popover>
    </div>
  )
}

export default observer(Remark)
