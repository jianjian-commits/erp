import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import {
  Flex,
  Select,
  Input,
  Button,
  ControlledForm,
  ControlledFormItem,
} from '@gm-pc/react'
import { Order_State } from 'gm_api/src/order'

import type { BatchProps } from '../interface'
import globalStore from '@/stores/global'

interface EditStateProps extends BatchProps {
  onCancel: () => void
  onOk: (status: number, remark: string) => void
}

/**
 * @description: 批量修改订单状态
 * @param {*}
 * @return {*}
 */
const EditState: FC<EditStateProps> = ({
  selected,
  isSelectAll = false,
  onCancel,
  onOk,
}) => {
  const [status, setStatus] = useState(
    globalStore.isLite
      ? Order_State.STATE_DELIVERYING
      : Order_State.STATE_SORTING,
  )
  const [remark, setRemark] = useState('')

  function handleSelect(value: number) {
    setStatus(value)
  }

  function handleOk() {
    onOk(status, remark)
  }

  const orderStateSelectData = globalStore.isLite
    ? [{ value: 3, text: t('已出库') }]
    : [
        { value: Order_State.STATE_SORTING, text: t('分拣中') },
        { value: Order_State.STATE_DELIVERYING, text: t('配送中') },
        { value: Order_State.STATE_RECEIVABLE, text: t('已签收') },
      ]
  return (
    <div className='gm-padding-5 gm-margin-left-15'>
      <ControlledForm labelWidth='90px' className='gm-padding-lr-20'>
        <Flex className='gm-padding-bottom-10 gm-text-14'>
          {isSelectAll
            ? '选中了当前所有页订单'
            : `共计选泽${selected.length}个订单`}
        </Flex>
        <ControlledFormItem label={t('更改状态为')}>
          <Select
            value={status}
            data={orderStateSelectData}
            onChange={handleSelect}
          />
        </ControlledFormItem>
        <ControlledFormItem label={t('分拣波次')} hide={globalStore.isLite}>
          <Input
            value={remark}
            placeholder={t('填写备注信息用于指导分拣')}
            onChange={(e) => setRemark(e.target.value)}
          />
        </ControlledFormItem>
      </ControlledForm>
      <div className='gm-text-right'>
        <Button className='gm-margin-right-10' onClick={onCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleOk}>
          {t('确定')}
        </Button>
      </div>
    </div>
  )
}

export default EditState
