import React, { FC } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  Button,
  Dialog,
  Input,
  BoxForm,
  FormBlock,
  FormItem,
  Flex,
  InputNumber,
  TimeSpanPicker,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { CreateOrBatchData } from '../interface'
import store from '../store'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import ChoseIcon from './chose_icon'

const Create: FC = observer(() => {
  const handleDataChange = <T extends keyof CreateOrBatchData>(
    key: T,
    value: CreateOrBatchData[T],
  ) => {
    store.updateCreateOrBatchData(key, value)
  }
  const handleCreateMealTimes = () => {
    Dialog.render({
      title: t('新建餐次'),
      size: 'md',
      buttons: [
        {
          text: t('取消'),
          onClick: Dialog.hide,
        },
        {
          text: t('保存'),
          onClick: () => {
            store.createMealTimes()
          },
          btnType: 'primary',
        },
      ],
      children: (
        <BoxForm labelWidth='100px' colWidth='500px'>
          <FormBlock col={3}>
            <FormItem label={t('餐次名称')}>
              <Observer>
                {() => {
                  const { name } = store.create_or_batch_data
                  return (
                    <Input
                      value={name}
                      onChange={(e) => handleDataChange('name', e.target.value)}
                      placeholder={t('请输入餐次名称')}
                      maxLength={10}
                    />
                  )
                }}
              </Observer>
            </FormItem>
            <FormItem label={t('选择图标')} className='gm-margin-top-20'>
              <ChoseIcon
                iconData={store.icons}
                onSelect={(value) => handleDataChange('icon', value)}
              />
            </FormItem>
            <FormItem label={t('截止下单时间')} className='gm-margin-top-20'>
              <Observer>
                {() => {
                  const { order_receive_min_date, order_create_min_time } =
                    store.create_or_batch_data
                  const _order_receive_min_date =
                    order_receive_min_date === ''
                      ? null
                      : parseFloat(order_receive_min_date)
                  return (
                    <Flex justifyStart alignCenter>
                      <span className='gm-margin-right-10'>{t('当天前')}</span>
                      <InputNumber
                        style={{ width: '100px' }}
                        min={0}
                        max={15}
                        value={_order_receive_min_date}
                        placeholder={t('请输入天数')}
                        onChange={(value: number | null) => {
                          const new_value = value === null ? '' : value + ''
                          handleDataChange('order_receive_min_date', new_value)
                          handleDataChange('order_receive_max_date', '60')
                        }}
                        precision={0}
                      />
                      <span className='gm-margin-left-10 gm-margin-right-20'>
                        {t('天')}
                      </span>
                      <TimeSpanPicker
                        style={{ width: '100px' }}
                        date={order_create_min_time}
                        onChange={(date) => {
                          const min_time = moment(date).add(1, 'ms').toDate()
                          const max_time = moment(date).toDate()
                          handleDataChange(
                            'order_create_min_time',
                            // dateTMM(min_time.toDate()),
                            min_time,
                          )
                          handleDataChange(
                            'order_create_max_time',
                            max_time,
                            // dateTMM(max_time.toDate()),
                          )
                        }}
                      />
                    </Flex>
                  )
                }}
              </Observer>
            </FormItem>
            <FormItem label={t('默认收货日期')} className='gm-margin-top-20'>
              <Observer>
                {() => {
                  const { default_receive_time, default_receive_date } =
                    store.create_or_batch_data
                  const _default_receive_date =
                    default_receive_date === ''
                      ? null
                      : parseFloat(default_receive_date)
                  return (
                    <Flex justifyStart alignCenter>
                      <span className='gm-margin-right-10'>{t('当天前')}</span>
                      <InputNumber
                        style={{ width: '100px' }}
                        min={0}
                        max={15}
                        value={_default_receive_date}
                        placeholder={t('请输入天数')}
                        onChange={(value: number | null) => {
                          const new_value = value === null ? '' : value + ''
                          handleDataChange('default_receive_date', new_value)
                        }}
                        precision={0}
                      />
                      <span className='gm-margin-left-10 gm-margin-right-20'>
                        {t('天')}
                      </span>
                      <TimeSpanPicker
                        style={{ width: '100px' }}
                        date={default_receive_time}
                        onChange={(date: Date) => {
                          const min_time = moment(date).toDate()

                          handleDataChange(
                            'default_receive_time',
                            // dateTMM(min_time.toDate()),
                            min_time,
                          )
                        }}
                      />
                    </Flex>
                  )
                }}
              </Observer>
            </FormItem>
          </FormBlock>
        </BoxForm>
      ),
    })
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_MERCHANDISE_CREATE_MENU_PERIOD}
    >
      <Button
        className='gm-margin-right-10'
        type='primary'
        onClick={handleCreateMealTimes}
      >
        {t('新建餐次')}
      </Button>
    </PermissionJudge>
  )
})

export default Create
