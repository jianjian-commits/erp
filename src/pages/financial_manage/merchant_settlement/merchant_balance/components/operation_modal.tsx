import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  Form,
  FormBlock,
  FormItem,
  Flex,
  Button,
  Input,
  InputNumber,
} from '@gm-pc/react'
import Big from 'big.js'
import _ from 'lodash'
import { RechargeOptions } from '../interface'
import store from '../store'

interface DataOptions {
  company_code: string
  company_name: string
  balance: string
  target_id: string
}
interface RechargeModalProps {
  onCancel: () => void
  onOK: () => void
  data: DataOptions
  type: 'RECHARGE' | 'DEDUCTION' // 充值或扣款
}

const OperationModal: FC<RechargeModalProps> = observer(
  ({ onCancel, onOK, data, type }) => {
    const {
      recharge_amount,
      deduction_amount,
      voucher_number,
    } = store.recharge_data
    let verifyFactor: boolean = false

    const handleCancel = () => {
      onCancel()
    }

    const handleOk = () => {
      onOK()
    }

    const handleChange = <T extends keyof RechargeOptions>(
      key: T,
      value: RechargeOptions[T],
    ) => {
      store.updateRechargeData(key, value)
    }

    if (type === 'RECHARGE') {
      verifyFactor = !Number(recharge_amount) || !voucher_number
    } else {
      verifyFactor = !Number(deduction_amount)
    }

    useEffect(() => {
      // store.fetchListAccountBalance()
      return () => {
        store.clear()
      }
    }, [])

    return (
      <Flex column>
        <Form
          labelWidth='110px'
          colWidth='460px'
          className='gm-padding-lr-20 gm-text-left'
        >
          <FormBlock col={1}>
            <FormItem label={t('公司编码')}>
              <div className='gm-margin-top-5'>{data.company_code}</div>
            </FormItem>
            <FormItem label={t('公司名称')}>
              <div className='gm-margin-top-5'>{data.company_name}</div>
            </FormItem>
            {type === 'RECHARGE' && (
              <>
                <FormItem label={t('本次充值金额')} required>
                  <Observer>
                    {() => {
                      const { recharge_amount } = store.recharge_data
                      const _recharge_amount =
                        recharge_amount === ''
                          ? null
                          : parseFloat(recharge_amount)
                      return (
                        <InputNumber
                          min={0}
                          precision={2}
                          value={_recharge_amount}
                          placeholder={t('请输入充值金额')}
                          onChange={(value: number) => {
                            const new_value =
                              value === null ? '' : Big(value).toFixed(2) + ''
                            handleChange('recharge_amount', new_value)
                          }}
                        />
                      )
                    }}
                  </Observer>
                </FormItem>
                <FormItem label={t('到账凭证号')} required>
                  <Observer>
                    {() => {
                      const { voucher_number } = store.recharge_data
                      return (
                        <Input
                          value={voucher_number}
                          onChange={(e) => {
                            handleChange('voucher_number', e.target.value)
                          }}
                        />
                      )
                    }}
                  </Observer>
                </FormItem>
              </>
            )}

            {type === 'DEDUCTION' && (
              <FormItem label={t('本次扣款金额')} required>
                <Observer>
                  {() => {
                    const { deduction_amount } = store.recharge_data
                    const _deduction_amount =
                      deduction_amount === ''
                        ? null
                        : parseFloat(deduction_amount)
                    return (
                      <InputNumber
                        min={0}
                        precision={2}
                        max={Number(data?.balance!)}
                        value={_deduction_amount}
                        placeholder={t('请输入扣款金额')}
                        onChange={(value: number) => {
                          const new_value =
                            value === null ? '' : Big(value).toFixed(2) + ''
                          handleChange('deduction_amount', new_value)
                        }}
                      />
                    )
                  }}
                </Observer>
              </FormItem>
            )}

            <FormItem label={t('余额')}>
              <div className='gm-margin-top-5'>
                {Big(data.balance).toFixed(2)}
              </div>
            </FormItem>
            <FormItem label={t('备注')}>
              <Observer>
                {() => {
                  const { mark } = store.recharge_data
                  return (
                    <Input
                      value={mark}
                      onChange={(e) => {
                        handleChange('mark', e.target.value)
                      }}
                    />
                  )
                }}
              </Observer>
            </FormItem>
          </FormBlock>
        </Form>
        <div className='gm-text-right'>
          <Button className='gm-margin-right-10' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button
            type='primary'
            htmlType='submit'
            onClick={handleOk}
            disabled={verifyFactor}
          >
            {t('提交')}
          </Button>
        </div>
      </Flex>
    )
  },
)

export default OperationModal
