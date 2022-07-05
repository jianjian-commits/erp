import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import {
  Tip,
  Flex,
  Button,
  Form,
  FormItem,
  Select,
  Box,
  ListDataItem,
  Modal,
  TextArea,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import { PrecisionMapKeyType } from '@/common/interface'

export interface DiscountProps {
  reasonData: ListDataItem<any>[]
  actionData: ListDataItem<any>[]
  moneyPrecisionType?: PrecisionMapKeyType
  onEnsure: (data: DiscountState) => void
  onCancel: () => void
  onVerify?: (data: DiscountState) => boolean
}

export interface DiscountState {
  money: number | null
  reason: any
  action: any
  remark?: string
}

const DiscountFormModal: FC<DiscountProps> = observer((props) => {
  const {
    onEnsure,
    onCancel,
    actionData,
    reasonData,
    moneyPrecisionType,
    onVerify,
  } = props

  const [state, setState] = useState<DiscountState>({
    money: null,
    reason: null,
    action: null,
    remark: '',
  })

  const handleChange = <T extends keyof DiscountState>(
    name: T,
    value: DiscountState[T],
  ) => {
    setState({
      ...state,
      [name]: value,
    })
  }

  const verifyShareData = () => {
    const { action, reason, money } = state

    if (!action) {
      Tip.danger(t('请选择折让类型'))
      return false
    }
    if (!reason) {
      Tip.danger(t('请选择折让原因'))
      return false
    }
    if (!money) {
      // 不能为0
      Tip.danger(t('请填写金额'))
      return false
    }

    return true
  }

  const handleEnsure = () => {
    if (verifyShareData()) {
      if (!onVerify || onVerify(state)) {
        onEnsure(state)
        Modal.hide()
      }
    }
  }

  return (
    <Box hasGap>
      <Form>
        <FormItem label={t('折让原因')}>
          <Select
            data={reasonData}
            value={state.reason}
            onChange={(value) => handleChange('reason', value)}
          />
        </FormItem>
        <FormItem label={t('折让类型')}>
          <Select
            data={actionData}
            value={state.action}
            onChange={(value) => handleChange('action', value)}
          />
        </FormItem>
        <FormItem label={t('金额')}>
          <PrecisionInputNumber
            min={0}
            onChange={(value) => handleChange('money', value)}
            value={state.money}
            placeholder={t('金额')}
            precisionType={moneyPrecisionType ?? 'dpInventoryAmount'}
          />
        </FormItem>
        <FormItem label={t('备注')}>
          <TextArea
            onChange={(event) => handleChange('remark', event.target.value)}
            id='share-remark'
            maxLength={50}
          />
        </FormItem>
      </Form>

      <Flex justifyEnd>
        <Button onClick={onCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleEnsure}>
          {t('确认')}
        </Button>
      </Flex>
    </Box>
  )
})

export default DiscountFormModal
