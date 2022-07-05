import React, { forwardRef } from 'react'
import { t } from 'gm-i18n'
import {
  FormPanel,
  Form,
  FormItem,
  Flex,
  InputNumber,
  TimeSpanPicker,
} from '@gm-pc/react'
import { observer } from 'mobx-react'
import store from '../store'

const Rule = forwardRef<Form, { storeDetail: typeof store }>(
  ({ storeDetail }, ref) => {
    const { leave_day, leave_time } = storeDetail

    return (
      <FormPanel title={t('规则配置')}>
        <Form ref={ref} labelWidth='150px' disabledCol>
          <FormItem label={t('请假截止时间设置')}>
            <Flex column>
              <Flex justifyStart alignCenter>
                <span className='gm-margin-right-10'>{t('当天前')}</span>
                <InputNumber
                  min={0}
                  precision={0}
                  placeholder={t('请输入天数')}
                  style={{ width: '100px' }}
                  value={leave_day}
                  onChange={storeDetail._handleChangeLeaveDay}
                />
                <span className='gm-margin-right-10 gm-margin-left-10'>
                  {t('天')}
                </span>
                <TimeSpanPicker
                  style={{ width: '100px' }}
                  date={leave_time as Date}
                  onChange={storeDetail._handleChangeLeaveTime}
                />
              </Flex>
              <div className='gm-margin-top-5 gm-text-desc'>
                {t(
                  '示例：请9月10日的假，需在9月8日 08：00前进行请假申请，否则只可申请9月11日及之后的假。',
                )}
              </div>
            </Flex>
          </FormItem>
        </Form>
      </FormPanel>
    )
  },
)

export default observer(Rule)
