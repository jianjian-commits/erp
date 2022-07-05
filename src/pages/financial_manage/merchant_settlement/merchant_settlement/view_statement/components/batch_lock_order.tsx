import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex, Button } from '@gm-pc/react'
import type { BatchProps } from '../interface'

interface TaskProps extends BatchProps {
  onCancel: () => void
  onOk: () => void
}

const BatchLockOrder: FC<TaskProps> = ({
  selected,
  isSelectAll = false,
  onCancel,
  onOk,
}) => {
  const handleOk = () => {
    onOk()
  }

  return (
    <Flex column>
      <div className='gm-margin-left-20 gm-margin-bottom-20'>
        {isSelectAll
          ? t('选中了当前所有页订单')
          : t(`已勾选${selected.length}订单，确认批量锁定订单吗？`)}
      </div>
      <div className='gm-text-right'>
        <Button className='gm-margin-right-10' onClick={onCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleOk}>
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
}

export default BatchLockOrder
