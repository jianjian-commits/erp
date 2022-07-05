import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Dropdown, Menu } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { useGMLocation } from '@gm-common/router'
import classNames from 'classnames'
import {
  Flex,
  ControlledForm,
  ControlledFormItem,
  useControlFormRef,
  FormPanel,
  MoreSelect,
  Switch,
  Affix,
  Button,
  Confirm,
} from '@gm-pc/react'
import _ from 'lodash'

import Calendar from './components/editable_calandar/range_calendar'
import store from './store'
import './style.less'

interface FormRefFields {
  customer: string
  status: boolean
}

const MenuCanlendar: FC = observer(() => {
  const location = useGMLocation<{ customer_id: string }>()
  const { customer_id } = location.query
  const formRef = useControlFormRef<FormRefFields>()
  const {
    CustomerData,
    setCustomerId,
    customerId,
    curDate,
    effectedStatus,
    quotation_id,
    fetchCustomers,
    GetManyMealCalendar,
    init,
    CreateOrUpdateMealCalendar,
    changeEffectedStatus,
    resetMealCalendar,
  } = store

  useEffect(() => {
    fetchCustomers()

    const initialCustomer = CustomerData.find(
      (item) => item.value === customer_id,
    )
    initialCustomer &&
      formRef.current.setFieldsValue({ customer: initialCustomer })
    setCustomerId(customer_id)

    return init
  }, [])

  useEffect(() => {
    if (quotation_id && customerId) GetManyMealCalendar()
  }, [quotation_id, curDate, customerId, GetManyMealCalendar])

  useEffect(() => {
    formRef.current.setFieldsValue({ status: effectedStatus })
  }, [effectedStatus, formRef])

  const handleSubmit = async () => {
    formRef.current.validateFields().then(() => {
      CreateOrUpdateMealCalendar()
    })
  }

  const handleReset = (e: any) => {
    const key = e.key

    Confirm({
      title: t('重置就餐日历'),
      children: (
        <Flex column className='gm-margin-left-10'>
          <div className='gm-margin-tb-10'>
            {t(
              `${
                key === 'CUR'
                  ? '是否确定要重置该页的就餐日历？'
                  : '是否确定要重置设定此就餐日历？'
              }`,
            )}
          </div>
          <div className='gm-text-danger'>
            {t('重置将把就餐人数重置为默认人数')}
          </div>
        </Flex>
      ),
    }).then(() => {
      resetMealCalendar(key)
    })
  }

  return (
    <>
      <Flex
        column
        className='gm-margin-bottom-20'
        style={{ minHeight: '89vh' }}
      >
        <FormPanel title={t('基础信息')}>
          <ControlledForm
            form={formRef}
            initialValues={{ status: false, customer: customer_id }}
            onFieldsChange={([changeField, changeValue]) => {
              switch (changeField) {
                case 'customer': {
                  init()
                  if (changeValue) {
                    setCustomerId(changeValue)
                  }
                  break
                }
                case 'status': {
                  changeEffectedStatus(changeValue)
                  break
                }
              }
            }}
          >
            <ControlledFormItem
              label={t('客户')}
              name='customer'
              required
              rules={[{ required: true, message: t('请选择客户') }]}
            >
              <MoreSelect
                placeholder={t('请选择客户')}
                data={CustomerData.slice()}
                onSearch={(select: string) => {
                  store.fetchCustomers(select)
                }}
              />
            </ControlledFormItem>
            <Flex>
              <ControlledFormItem
                colWidth='120'
                label={t('状态')}
                name='status'
                valuePropName='checked'
                trigger='onChange'
                required
              >
                <Switch on={t('启用')} off={t('禁用')} disabled={!customerId} />
              </ControlledFormItem>
              <label className='tw-mt-1.5 gm-text-desc'>
                {t(
                  '开启后可以按日历的形式设置每餐次的就餐人数，且按菜谱下单时将优先基于此计算数量',
                )}
              </label>
            </Flex>
          </ControlledForm>
        </FormPanel>
        <FormPanel title={t('就餐日历')}>
          <div className='root_calendar'>
            <Calendar />
          </div>
        </FormPanel>
      </Flex>
      <Affix bottom={0}>
        <div
          className={classNames(
            'gm-padding-tb-5 gm-text-center gm-form-group-sticky-box',
          )}
        >
          <Dropdown
            placement='topLeft'
            overlay={
              <Menu onClick={handleReset}>
                <Menu.Item key='CUR'>{t('重置当前页')}</Menu.Item>
                <Menu.Item key='ALL'>{t('重置全部页')}</Menu.Item>
              </Menu>
            }
          >
            <Button>
              {t('重置')} <DownOutlined />
            </Button>
          </Dropdown>
          <div className='gm-gap-10' />
          <Button
            type='primary'
            onClick={_.throttle(handleSubmit, 3000, { trailing: false })}
          >
            {t('保存')}
          </Button>
        </div>
      </Affix>
    </>
  )
})

export default MenuCanlendar
