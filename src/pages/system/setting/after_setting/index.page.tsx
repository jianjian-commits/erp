import { t } from 'gm-i18n'
import React, { useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Radio,
  RadioGroup,
  Transfer,
} from '@gm-pc/react'
import store from './store'
import _ from 'lodash'
import { AfterSaleSettings_WhiteListType } from 'gm_api/src/preference/types'
import { RadioCheckDataType, WhiteListDataType } from './interface'

const AfterSetting = observer(() => {
  const formRef = useRef(null)
  const {
    radioCheck,
    setRadioValue,
    whitListRadio,
    setWhitListRadioValue,
    selected,
    onSelected,
    getListAfterSaleSettings,
    handleSubmit,
    newTreeData,
  } = store
  useEffect(() => {
    getListAfterSaleSettings()
  }, [])

  const whitListRadioData: WhiteListDataType[] = [
    {
      value: AfterSaleSettings_WhiteListType.WHITE_LIST_TYPE_QUOTATION,
      text: t('按报价单'),
      disabled: true,
    },
    {
      value: AfterSaleSettings_WhiteListType.WHITE_LIST_TYPE_CUSTOMER_LABEL,
      text: t('按客户标签'),
    },
  ]

  const radioCheckData: RadioCheckDataType[] = [
    {
      value: 256,
      text: t('需要人工审核'),
      tip: t('自动生成未审核的售后单,经过人工审核才能生效'),
      disabled: true,
    },
    {
      value: 0,
      text: t('不需要人工审核'),
      tip: t(
        `自动生成审核通过的售后单,直接生效,仅针对"只包含仅退款售后"的售后单生效`,
      ),
    },
  ]
  return (
    <FormGroup formRefs={[formRef]} onSubmit={(): void => handleSubmit()}>
      <FormPanel title={t('审核流程设置')}>
        <Form ref={formRef} labelWidth='166px' disabledCol>
          <FormItem label={t('售后申请审核流程')}>
            <RadioGroup
              value={radioCheck.value}
              onChange={(value) => setRadioValue(value)}
            >
              {_.map(radioCheckData, (v) => (
                <div key={v.value}>
                  <Radio value={v.value}>{v.text}</Radio>
                  <div className='gm-text-desc gm-margin-top-5'>
                    {t(`${v.tip}`)}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </FormItem>
          <FormItem label={t('审核白名单')}>
            <div className='gm-text-desc gm-margin-top-5'>
              {t(
                '在需要人工审核的情况下，设置白名单客户，设置为白名单的客户产生的售后单无需审核，直接生效',
              )}
            </div>
            <RadioGroup
              className='gm-margin-top-5'
              value={whitListRadio.value}
              onChange={(value) => setWhitListRadioValue(value)}
            >
              {_.map(whitListRadioData, (v) => (
                <span key={v.value}>
                  <Radio value={v.value} disabled={radioCheck.value !== 256}>
                    {v.text}
                  </Radio>
                </span>
              ))}
            </RadioGroup>

            <div style={{ marginTop: '30px' }}>
              <Transfer
                list={toJS(newTreeData)}
                selectedValues={selected}
                onSelectValues={(selected) => onSelected(selected)}
                leftTitle={t('全部客户')}
                rightTitle={t('已选客户')}
                rightTree
              />
            </div>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})
export default AfterSetting
