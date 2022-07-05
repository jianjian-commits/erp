import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  FormItem,
  TimeSpanPicker,
  Validator,
  Form,
  Flex,
  Input,
  TextArea,
} from '@gm-pc/react'
import DaySelect from './day_select'
import ReceiveDateTable from './receive_date_table'
import ReceiveTimeTable from './receive_time_table'
import { MToDate, dayMM, dateTMM } from '@/common/util'
import type { ServicePeriod } from 'gm_api/src/enterprise'
import store from '../store'

const FormComponent = React.forwardRef<Form>((_props, ref) => {
  function handleChange<T extends keyof ServicePeriod>(
    key: T,
    value: ServicePeriod[T],
  ) {
    store.updatePeriod(key, value)
  }

  function handleTimeChange<T extends keyof ServicePeriod>(
    key: T,
    value: Date | null,
  ) {
    let val = dateTMM(value as Date)
    if (+store.servicePeriod[key] >= dayMM) {
      val = `${+val + dayMM}`
    }
    handleChange(key, val)
  }

  function handleSelectChange(key: keyof ServicePeriod, v: 0 | 1) {
    const { order_create_min_time } = store.servicePeriod
    if (v) {
      handleChange(key, `${+order_create_min_time! + dayMM}`)
    } else {
      handleChange(key, `${dayMM - 30 * 60 * 1000}`)
    }
  }

  function handleCreateMinTimeChange(value: Date) {
    handleTimeChange('order_create_min_time', value)
    if (+store.servicePeriod.order_receive_min_date! === 0) {
      const mm = +dateTMM(value) + 30 * 60 * 1000
      if (+store.servicePeriod.order_receive_min_time! < mm)
        handleTimeChange('order_receive_min_time', MToDate(mm))
    }
  }

  const { name, description, order_create_max_time, order_create_min_time } =
    store.servicePeriod

  const createFlag = +order_create_max_time! >= dayMM ? 1 : 0

  return (
    <Form colWidth='700px' labelWidth='170px' ref={ref}>
      <FormItem
        required
        label={t('运营时间名称')}
        validate={Validator.create([], name)}
      >
        <>
          <Input
            type='text'
            value={name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <div className='gm-text-desc gm-margin-top-5'>
            {t(
              '自定义一个运营时间名称，比如可以命名为“夜宵档运营时间”，后续用于一个报价单，为这个报价单配置服务时间',
            )}
          </div>
        </>
      </FormItem>
      <FormItem label={t('描述')}>
        <TextArea
          value={description}
          rows={2}
          style={{ height: 'auto' }}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </FormItem>
      <FormItem label={t('用户下单时间限制')}>
        <div>
          <Flex alignCenter>
            <TimeSpanPicker
              date={MToDate(+order_create_min_time!)}
              onChange={handleCreateMinTimeChange}
              style={{ width: '80px' }}
            />
            <div className='gm-gap-5' />
            ~
            <div className='gm-gap-5' />
            <DaySelect
              value={createFlag}
              max={2}
              onChange={(v) => handleSelectChange('order_create_max_time', v)}
            />
            <div className='gm-gap-10' />
            <TimeSpanPicker
              min={
                createFlag === 0 ? MToDate(+order_create_min_time!) : undefined
              }
              max={
                createFlag === 1 ? MToDate(+order_create_min_time!) : undefined
              }
              date={MToDate(+order_create_max_time!)}
              onChange={(v) => handleTimeChange('order_create_max_time', v)}
              style={{ width: '80px' }}
            />
          </Flex>
          <div className='gm-text-desc gm-margin-top-5'>
            {t('设置用户可下单时间，超过该时间段用户无法下单')}
          </div>
        </div>
      </FormItem>
      <FormItem label={t('设置可选收货日')}>
        <>
          <ReceiveDateTable />
          <div className='gm-text-desc gm-margin-top-5'>
            {t(
              '表明当日下单，可选择的收货日期，如设置的最早为当天收货，最晚为第三天收货，当前日期为3月1日，则可以选择3月1日，3月2日，3月3日收货',
            )}
          </div>
        </>
      </FormItem>
      <FormItem label={t('设置每日可配送时间')}>
        <>
          <ReceiveTimeTable />
          <div className='gm-text-desc gm-margin-top-5'>
            {t(
              '设置可选收货返回范围，用户可以在这个范围内选择收货时间可选收货时间以30分钟为期限，可选的时候时间必须大于当前时间',
            )}
            <br />
            {t(
              '例如：最早收货时间6:00，最晚收货时间当天7:30，当前时间为5:00, 用户可选择的收货时间为6:00, 7:00, 7:30；如当前时间为7:30,则可选的收货时间为7:30',
            )}
          </div>
        </>
      </FormItem>
    </Form>
  )
})

export default observer(FormComponent)
