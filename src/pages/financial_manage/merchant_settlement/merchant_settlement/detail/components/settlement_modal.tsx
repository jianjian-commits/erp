import React, { FC, ReactNode, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import {
  Flex,
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  FormBlock,
  Price,
  Tip,
} from '@gm-pc/react'
import Big from 'big.js'
import _ from 'lodash'
import store from '../store'

export interface SettlementData {
  remark: string
  settle_amount: string
  arrival_serial_no: string
  recharge_amount: string
}
interface SettlementProps {
  serial_no: string // 对账单ID
  company: string
  need_amount: string
  target_id: string
  onCancel: () => void
  onOk: (data: SettlementData) => void
}

const Settlement: FC<SettlementProps> = observer((props) => {
  const { serial_no, company, need_amount, target_id, onCancel, onOk } = props
  const { account_balance } = store
  let verifyFactor: boolean = false
  const [state, setState] = useState<SettlementData>({
    remark: '',
    settle_amount: Big(Number(need_amount)).toFixed(2),
    arrival_serial_no: '',
    recharge_amount:
      Number(
        Big(account_balance.toFixed(2)).minus(Number(need_amount)).toFixed(2),
      ) < 0
        ? Big(Number(need_amount)).minus(account_balance.toFixed(2)).toFixed(2)
        : '',
  })
  const is_recharge_amount = Number(
    Big(Number(state.settle_amount)).minus(account_balance).toFixed(2),
  )
  const IS_NEED_RECHARGE: 'RECHARGE' | 'NOT_RECHARGE' =
    is_recharge_amount > 0 ? 'RECHARGE' : 'NOT_RECHARGE'

  if (IS_NEED_RECHARGE === 'RECHARGE') {
    verifyFactor =
      !Number(state.settle_amount) ||
      !Number(state.recharge_amount) ||
      !state.arrival_serial_no
  } else {
    verifyFactor = !Number(state.settle_amount)
  }

  const handleCancel = () => {
    onCancel()
  }
  const handleOk = () => {
    if (
      state.recharge_amount !== '' &&
      Number(
        Big(account_balance).plus(Number(state.recharge_amount)).toFixed(2),
      ) < Number(Big(Number(state.settle_amount).toFixed(2)))
    ) {
      Tip.danger(t('充值金额不够，不能结款'))
      // throw new Error(t('充值金额不够，不能结款'))
      return
    }
    onOk(state)
    setState({ ...state, recharge_amount: '' })
  }

  useEffect(() => {
    store.fetchListAccountBalance(target_id)
    return () => {
      setState({ ...state, recharge_amount: '' })
    }
  }, [account_balance, need_amount])

  useEffect(() => {
    setState({
      ...state,
      recharge_amount:
        Number(
          Big(account_balance.toFixed(2)).minus(Number(need_amount)).toFixed(2),
        ) < 0
          ? Big(Number(need_amount))
              .minus(account_balance.toFixed(2))
              .toFixed(2)
          : '',
    })
  }, [account_balance])

  return (
    <Flex column>
      <Form
        labelWidth='110px'
        colWidth='460px'
        className='gm-padding-lr-20 gm-text-left'
      >
        <FormBlock col={1}>
          <FormItem label={t('对账单号')}>
            <Flex justifyStart className='gm-margin-top-5'>
              {serial_no || '-'}
            </Flex>
          </FormItem>
          <FormItem label={t('商户名')}>
            <Flex justifyStart className='gm-margin-top-5'>
              {company || '-'}
            </Flex>
          </FormItem>
          <FormItem label={t('本次结款金额')} required>
            <Observer>
              {() => {
                const { settle_amount } = state
                const _settle_amount =
                  settle_amount === ''
                    ? null
                    : Number(parseFloat(settle_amount).toFixed(2))
                return (
                  <InputNumber
                    style={{ width: '200px' }}
                    min={0}
                    precision={2}
                    max={Number(need_amount)} // 最大输入值为待结款金额
                    placeholder={t('请输结款金额')}
                    value={_settle_amount}
                    onChange={(value: number | null) => {
                      const new_value =
                        value === null ? '' : Big(value).toFixed(2) + ''
                      setState({ ...state, settle_amount: new_value })
                    }}
                  />
                )
              }}
            </Observer>
          </FormItem>
          <FormItem label={t('余额')}>
            <Flex justifyStart className='gm-margin-top-5'>
              <Flex justifyStart className='gm-margin-top-5'>
                <Price value={+Big(account_balance!).toFixed(2) || 0} />
              </Flex>
            </Flex>
          </FormItem>
          {IS_NEED_RECHARGE === 'RECHARGE' && (
            <>
              <FormItem label={t('本次充值金额')} required>
                <Observer>
                  {() => {
                    const { recharge_amount } = state
                    const _recharge_amount =
                      recharge_amount === ''
                        ? null
                        : parseFloat(recharge_amount)
                    return (
                      <InputNumber
                        style={{ width: '200px' }}
                        min={0}
                        precision={2}
                        placeholder={t('请输充值金额')}
                        value={_recharge_amount}
                        onChange={(value: number | null) => {
                          const new_value =
                            value === null ? '' : Big(value).toFixed(2) + ''
                          setState({ ...state, recharge_amount: new_value })
                        }}
                      />
                    )
                  }}
                </Observer>
              </FormItem>
              <FormItem label={t('到账凭证号')} required>
                <Observer>
                  {() => {
                    const { arrival_serial_no } = state
                    return (
                      <Input
                        value={arrival_serial_no}
                        onChange={(e) => {
                          setState({
                            ...state,
                            arrival_serial_no: e.target.value,
                          })
                        }}
                        placeholder={t('请输入到账凭证号')}
                      />
                    )
                  }}
                </Observer>
              </FormItem>
            </>
          )}

          <FormItem label={t('待结款余额')}>
            <Flex justifyStart className='gm-margin-top-5'>
              <Price value={+need_amount! || 0} />
            </Flex>
          </FormItem>

          <FormItem label={t('备注')}>
            <Observer>
              {() => {
                const { remark } = state

                return (
                  <Input
                    value={remark}
                    onChange={(e) => {
                      setState({ ...state, remark: e.target.value })
                    }}
                    placeholder={t('请输入备注')}
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
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
})

export default Settlement
