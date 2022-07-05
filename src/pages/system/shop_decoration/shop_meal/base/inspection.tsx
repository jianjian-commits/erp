import React, { forwardRef } from 'react'
import store from '../store'
import { observer } from 'mobx-react'
import { FormPanel, Form, FormItem, RadioGroup, Radio } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { BSwitch } from '../../common/index'
import _ from 'lodash'
import { RadioCheckDataType } from '@/pages/system/setting/after_setting/interface'
const Inspection = forwardRef<Form, { storeDetail: typeof store }>(
  ({ storeDetail }, ref) => {
    const {
      status,
      inspectionCount_code,
      radioCheck,
      need_write_signature,
      allow_update_signature,
      setRadioValue,
    } = storeDetail

    const radioCheckData: RadioCheckDataType[] = [
      {
        value: 1,
        text: '不生成售后申请',
        tip: '验收数与出库数不符时，不做额外处理，不生成售后单据',
        disabled: true,
      },
      {
        value: 2,
        text: '生成仅退款申请',
        tip: '当验收数与出库数不符时，验收数与出库数的差异值自动生成仅退款申请',
      },
      {
        value: 3,
        text: '生成退款退货申请',
        tip: '当验收数与出库数不符时，验收数与出库数的差异值自动生成退款退货申请',
      },
    ]

    return (
      <FormPanel title={t('验收设置')}>
        <Form labelWidth='150px' colWidth='460px'>
          <FormItem label={t('商城端验货')}>
            <BSwitch
              tip={t('开启后客户可以在商城端进行验货')}
              // TODO: 暂时禁用
              // checked={status || false}
              checked={false}
              disabled
              onChange={storeDetail._handleChangeInspectionCode}
            />
          </FormItem>

          {status && (
            <>
              <FormItem label={t('是否开启更改验收数')}>
                <BSwitch
                  tip={t(
                    '开启后客户可以在商城端进行验货的时候，同时更改验货数，否则不展现验货数',
                  )}
                  checked={inspectionCount_code}
                  onChange={storeDetail._handleChangeInspectionCountCode}
                />
              </FormItem>
              <FormItem label={t('验收数小于出库时的处理方式')}>
                <RadioGroup
                  value={radioCheck.value}
                  onChange={(value) => setRadioValue(value)}
                >
                  {_.map(radioCheckData, (v) => (
                    <div key={v.value}>
                      <Radio value={v.value}>
                        {v.text}
                        <div className='gm-text-desc gm-margin-top-5'>
                          {v.tip}
                        </div>
                      </Radio>
                    </div>
                  ))}
                </RadioGroup>
              </FormItem>
            </>
          )}

          <FormItem label={t('电子签名')}>
            <BSwitch
              tip={t('开启后，商城端在签收时必须使用签名的形式进行签收')}
              // TODO: 暂时禁用
              // checked={need_write_signature || false}
              checked={false}
              disabled
              onChange={(value) => {
                storeDetail.updateProps({ name: 'need_write_signature', value })
                if (!value) {
                  storeDetail.updateProps({
                    name: 'allow_update_signature',
                    value,
                  })
                }
              }}
            />
          </FormItem>

          {need_write_signature && (
            <FormItem label={t('追加电子签名')}>
              <BSwitch
                tip={t('开启后，商城端可对订单的签名信息进行追加签名')}
                checked={allow_update_signature || false}
                onChange={(value) => {
                  storeDetail.updateProps({
                    name: 'allow_update_signature',
                    value,
                  })
                }}
              />
            </FormItem>
          )}
        </Form>
      </FormPanel>
    )
  },
)
export default observer(Inspection)
