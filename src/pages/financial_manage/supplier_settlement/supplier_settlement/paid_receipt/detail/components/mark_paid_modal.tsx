import {
  Button,
  Flex,
  Form,
  FormItem,
  Input,
  Modal,
  Price,
  TextArea,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import Big from 'big.js'
import store from '../store'
import { toFixedByType } from '@/common/util'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'

interface MarkPaidData {
  code: string
  money: number | null
  remark: string
}

interface Props {
  onCancel?: () => {}
  onEnsure: (data: MarkPaidData) => unknown
}

const initData = {
  code: '',
  money: null,
  remark: '',
}

const MarkPaidModal: FC<Props> = (props) => {
  const [state, setState] = useState<MarkPaidData>({ ...initData })
  const { actual_amount } = store.receiptDetail
  const { shouldPay } = store

  const handleEnsureMark = () => {
    props.onEnsure(state)
    handleHideModal()
  }

  const handleHideModal = () => {
    props.onCancel && props.onCancel()
    Modal.hide()
  }
  const waitForPaid = toFixedByType(
    Big(+shouldPay || 0).minus(+actual_amount! || 0),
    'dpSupplierSettle',
  )
  return (
    <>
      <Form labelWidth='80px'>
        <FormItem label={t('应付款')}>
          <div className='gm-margin-top-5'>
            {toFixedByType(+(shouldPay ?? 0), 'dpSupplierSettle') +
              Price.getUnit()}
          </div>
        </FormItem>
        <FormItem label={t('已付款')}>
          <div className='gm-margin-top-5'>
            {toFixedByType(+(actual_amount ?? 0), 'dpSupplierSettle') +
              Price.getUnit()}
          </div>
        </FormItem>
        <FormItem label={t('待付款')}>
          <div className='gm-margin-top-5'>{waitForPaid + Price.getUnit()}</div>
        </FormItem>
        <FormItem label={t('交易流水')}>
          <Input
            autoFocus
            value={state.code}
            onChange={(e) => setState({ ...state, code: e.target.value })}
          />
        </FormItem>
        <FormItem label={t('结款金额')}>
          <PrecisionInputNumber
            min={0}
            value={state.money}
            precisionType='dpSupplierSettle'
            onChange={(value) => setState({ ...state, money: value })}
          />
        </FormItem>
        <FormItem label={t('备注')}>
          <TextArea
            value={state.remark}
            maxLength={30}
            onChange={(e) => setState({ ...state, remark: e.target.value })}
          />
        </FormItem>
      </Form>
      <Flex
        className='gm-margin-top-10'
        style={{ flexDirection: 'row-reverse' }}
      >
        <Button
          type='primary'
          onClick={handleEnsureMark}
          disabled={!_.trim(state.code) || (!state.money && state.money !== 0)}
        >
          {t('确认')}
        </Button>
        <Button className='gm-margin-right-5' onClick={handleHideModal}>
          {t('取消')}
        </Button>
      </Flex>
    </>
  )
}

export default observer(MarkPaidModal)
export type { MarkPaidData }
