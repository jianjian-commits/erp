import React from 'react'
import { t } from 'gm-i18n'
import { Form, FormItem, DatePicker, Input } from '@gm-pc/react'
import { Observer } from 'mobx-react'
import store from '../store'

const Info = () => {
  return (
    <Form disabledCol inline labelWidth='100px'>
      <FormItem label={t('计划交期')}>
        <Observer>
          {() => {
            const { delivery_time } = store.specDetail
            return (
              <DatePicker
                date={delivery_time}
                placeholder={t('请选择日期')}
                enabledTimeSelect
                timeLimit={{
                  timeSpan: 30 * 60 * 1000,
                }}
                onChange={(date) => store.updateSpec('delivery_time', date)}
              />
            )
          }}
        </Observer>
        <div className='gm-text-desc gm-margin-top-5'>
          {t('填写采购计划交期')}
        </div>
      </FormItem>
      <FormItem label={t('采购波次')}>
        <Observer>
          {() => {
            const { info } = store.specDetail
            return (
              <Input
                value={info}
                placeholder={t('请填写采购波次')}
                onChange={(e) => store.updateSpec('info', e.target.value)}
              />
            )
          }}
        </Observer>
        <div className='gm-text-desc gm-margin-top-5'>
          {t(
            '填写采购波次如“1”“第一波次”等，指导采购部门分批进行采购，不填写则为“无波次”',
          )}
        </div>
      </FormItem>
    </Form>
  )
}

export default Info
