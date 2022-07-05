/* eslint-disable prefer-promise-reject-errors */
import { t } from 'gm-i18n'
import React, { useImperativeHandle, forwardRef } from 'react'
import { Observer, observer } from 'mobx-react'
import { FormPanel, DateRangePicker, Flex } from '@gm-pc/react'
import { Radio, Space, Form, InputNumber, TimePicker, Button } from 'antd'
import { Cycle } from 'gm_api/src/eshop'
import store from '../store'
import CycleComponent from './cycle'
import moment from 'moment'
import _ from 'lodash'
import { StudentFormValidator } from '../../interface'
interface ServiceInfoLookProps {
  is_look?: boolean
}
const ServiceInfo = observer(
  forwardRef<StudentFormValidator, ServiceInfoLookProps>(
    ({ is_look }, form2) => {
      const { semester_end, semester_start, delivery_infos, cycle } =
        store.serviceInfo
      const { setServiceInfo, setServiceInfoDelivery, img_url } = store

      const handleChange = (value: number) => {
        setServiceInfo('cycle', value)
      }

      // 到货改变天数
      const handleChangeReciveDate = (value: string, index: number) => {
        setServiceInfoDelivery(value, index, 'receive_date')
      }

      // 收货改变时间
      const handleChangeReciveTime = (value: string, index: number) => {
        setServiceInfoDelivery(value, index, 'receive_time')
      }

      // 校验一下订餐周期
      const ValidatorChange = (): Promise<boolean> => {
        const { cycle, CycleTime } = store.serviceInfo
        const cyc = CycleTime[cycle]
        const { start, start_time, end, end_time } = cyc
        return new Promise((resolve) => {
          if (
            start === '' ||
            start_time === '' ||
            end === '' ||
            end_time === ''
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        })
      }

      useImperativeHandle(form2, () => ({
        ValidatorChange,
      }))

      const handleDownLoad = () => {
        const a = document.createElement('a')
        a.download = t('邀请码')
        a.href = img_url
        a.click()
      }

      return (
        <FormPanel style={{ paddingBottom: '20px' }} title={t('运营管理')}>
          <Form labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
            <Form.Item label={t('默认学期')} required>
              <DateRangePicker
                disabled={is_look}
                style={{ width: '300px' }}
                begin={semester_start}
                end={semester_end}
                onChange={(begin: Date, end: Date) => {
                  if (begin && end) {
                    setServiceInfo('semester_start', begin)
                    setServiceInfo('semester_end', end)
                  }
                }}
                enabledTimeSelect
              />
            </Form.Item>
            <Form.Item
              label={t('订单周期')}
              required
              rules={[
                {
                  required: true,
                  message: t('请完善订餐周期!'),
                },
                { validator: ValidatorChange },
              ]}
            >
              <Radio.Group
                onChange={(value) => handleChange(value.target.value)}
                value={cycle}
                disabled={is_look}
              >
                <Space style={{ margin: '5px 0  10px 0' }}>
                  <Radio value={Cycle.CYCLE_WEEKLY}>
                    <span>{t('按周')}</span>
                  </Radio>
                  <Radio value={Cycle.CYCLE_MONTHLY}>
                    <span>{t('按月')}</span>
                  </Radio>
                  <Radio value={Cycle.CYCLE_SEMESTER}>
                    <span>{t('按学期')}</span>
                  </Radio>
                </Space>
              </Radio.Group>
              <CycleComponent type={cycle} is_look={is_look} />
            </Form.Item>
            <Form.Item label={t('学校收货日期')} required>
              {delivery_infos.map((item, index) => {
                return (
                  <Flex
                    style={{ marginBottom: '10px' }}
                    alignCenter
                    key={item?.menu_period_group?.menu_period_group_id!}
                  >
                    <Flex alignCenter className='delivery-border'>
                      <img
                        style={{ width: '20px' }}
                        src={
                          _.find(
                            store.icons,
                            (i) => i.id === item.menu_period_group?.icon,
                          )?.url
                        }
                      />
                      <span>{item.menu_period_group?.name}</span>
                    </Flex>
                    <span style={{ marginRight: '10px' }}>
                      {t(`-就餐当天前`)}
                    </span>
                    <Observer>
                      {() => {
                        return (
                          <>
                            <InputNumber
                              disabled={is_look}
                              onChange={(value) =>
                                handleChangeReciveDate(
                                  '' + value === null ? '' : value,
                                  index,
                                )
                              }
                              max='15'
                              min='0'
                              value={item.receive_date!}
                            />
                            &nbsp;
                            {t('天,')}
                            &nbsp;
                            <TimePicker
                              disabled={is_look}
                              allowClear={false}
                              value={moment(item.receive_time!, 'HH:mm')}
                              onChange={(__, dateString) =>
                                handleChangeReciveTime(dateString, index)
                              }
                              format='HH:mm'
                            />
                          </>
                        )
                      }}
                    </Observer>
                  </Flex>
                )
              })}
            </Form.Item>

            {img_url && (
              <Form.Item label={t('邀请码')}>
                <img
                  src={img_url}
                  style={{ width: '220px' }}
                  alt={t('eshop邀请码')}
                />
                <div
                  style={{
                    width: '220px',
                    textAlign: 'center',
                    marginTop: '20px',
                  }}
                >
                  <Button type='primary' onClick={handleDownLoad}>
                    {t('下载图片')}
                  </Button>
                </div>
              </Form.Item>
            )}
          </Form>
        </FormPanel>
      )
    },
  ),
)

export default ServiceInfo
