import React, { ChangeEvent } from 'react'
import { t } from 'gm-i18n'
import { Form, FormItem, DatePicker, Input } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'

import store from '../../store'

const Filter = observer(() => {
  return (
    <Form disabledCol inline labelWidth='100px'>
      <FormItem label={t('计划交期')}>
        <Observer>
          {() => {
            const { plan_finish_time } = store.recommendSkuFilter
            return (
              <DatePicker
                date={plan_finish_time}
                placeholder={t('选择日期')}
                onChange={(date) => {
                  store.updateRecommendSkuFilter('plan_finish_time', date)
                }}
              />
            )
          }}
        </Observer>
        <div className='gm-text-desc gm-margin-top-5'>
          {t('填写采购计划交期')}
        </div>
      </FormItem>
      <FormItem label={t('生产波次')}>
        <Observer>
          {() => {
            const { plan_wave } = store.recommendSkuFilter
            return (
              <Input
                value={plan_wave}
                placeholder={t('请填写波次')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  store.updateRecommendSkuFilter('plan_wave', e.target.value)
                }
              />
            )
          }}
        </Observer>
        <div className='gm-text-desc gm-margin-top-5'>
          {t(
            '填写生产波次如“1”“第一波次”等，指导生产部门分批进行生产，不填写则为“无波次”',
          )}
        </div>
      </FormItem>
      <FormItem label={t('生产对象')}>
        <Observer>
          {() => {
            // 后续需要改成选择类型
            const { product_object } = store.recommendSkuFilter
            return (
              <Input
                value={product_object}
                placeholder={t('请输入商户名或账号名、账户KID查找')}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  store.updateRecommendSkuFilter(
                    'product_object',
                    e.target.value,
                  )
                }
              />
            )
          }}
        </Observer>
        <div className='gm-text-desc gm-margin-top-5'>
          {t('填写生产对象，如按客户生产，可填写具体客户')}
        </div>
      </FormItem>
    </Form>
  )
})

export default Filter
