import React, { FC, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormItem,
  Validator,
  Input,
  FormPanel,
  TextArea,
  RadioGroup,
  Radio,
  FormBlock,
  FormGroup,
  Tip,
} from '@gm-pc/react'
import { DeviceAlarmRule, DeviceAlarmRule_Status } from 'gm_api/src/device'
import { Select_DeviceModel } from 'gm_api/src/device/pc'
import { history } from '@/common/service'
import RuleList from './ruleList'

import { t } from 'gm-i18n'
import storeInfo from '../store/storeInfo'
import { OptionsType } from '@/pages/iot/device_management/enum'
import { DetailProps } from '@/pages/iot/device_management/interface'
import PaddingDiv from '@/pages/iot/device_management/components/paddingDiv'
import NameInfo from '@/pages/iot/device_management/components/nameInfo'
import _ from 'lodash'

const Details: FC<DetailProps> = ({ isEdit = false, alarm_rule_id }) => {
  const {
    device_alarm_rule_name,
    device_model_id,
    status,
    create_time,
    creater_name,
    device_alarm_rule_id,
    remarks,
  } = storeInfo.alarmRuleInfo

  const formRef = useRef(null)

  useEffect(() => {
    if (isEdit) {
      storeInfo
        .getAlarmRule(alarm_rule_id!)
        .then(() => storeInfo.getDeviceDataType(undefined, true))
    }
    return () => storeInfo.initData()
  }, [isEdit, alarm_rule_id])

  const handleOptions = <T extends keyof DeviceAlarmRule>(
    name: T,
    value: DeviceAlarmRule[T],
  ) => {
    storeInfo.changeAlarmRuleInfo(name, value)
  }

  const strategyDataRule = () => {
    let pass = true
    if (!storeInfo.strategyData.length) {
      Tip.danger('策略列表不能为空')
      return false
    }

    const isNum = (num?: number) => (num === 0 ? false : !num)

    _.each(
      storeInfo.strategyData,
      ({ data_type, standard_value, upper_limit_value, lower_limit_value }) => {
        if (!data_type) {
          Tip.danger('策略数据为必填')
          pass = false
          return false
        }
        if (
          isNum(standard_value) ||
          isNum(upper_limit_value) ||
          isNum(lower_limit_value)
        ) {
          Tip.danger('标准值、上限、下限为必填')
          pass = false
          return false
        }
        if (lower_limit_value! >= upper_limit_value!) {
          Tip.danger('下限值不能小于等于上限值')
          pass = false
          return false
        }
      },
    )
    return pass
  }

  return (
    <FormGroup
      formRefs={[formRef]}
      onSubmitValidated={() => {
        if (!strategyDataRule()) return
        storeInfo
          .optionAlarmRule(isEdit ? OptionsType.edit : OptionsType.create)
          .then(() => {
            Tip.success(t('操作成功'))
            history.push('/iot/device_management/alerts')
            return null
          })
      }}
      onCancel={() => history.push('/iot/device_management/alerts')}
    >
      <FormPanel title={t(isEdit ? '报警规则' : '创建规则')}>
        <Form ref={formRef} labelWidth='100px'>
          <FormBlock col={2}>
            <FormItem
              label={t('规则名称')}
              required
              validate={Validator.create([], device_alarm_rule_name)}
            >
              <Input
                maxLength={11}
                type='text'
                placeholder={t('输入规则名称')}
                value={device_alarm_rule_name}
                onChange={(e) => {
                  handleOptions('device_alarm_rule_name', e.target.value)
                }}
              />
            </FormItem>
            {isEdit && (
              <FormItem label={t('规则ID')}>
                <PaddingDiv>{device_alarm_rule_id}</PaddingDiv>
              </FormItem>
            )}
          </FormBlock>
          <FormBlock col={2}>
            <FormItem
              label={t('设备型号')}
              required
              validate={Validator.create([], device_model_id)}
            >
              <Select_DeviceModel
                getName={({ device_model_name }) => device_model_name}
                placeholder={t('选择设备型号')}
                value={device_model_id!}
                onChange={(v) => handleOptions('device_model_id', v)}
              />
            </FormItem>
            {isEdit && (
              <FormItem label={t('启用状态')}>
                <RadioGroup
                  className='gm-margin-left-10'
                  value={status}
                  onChange={(e) => handleOptions('status', e)}
                >
                  <Radio value={DeviceAlarmRule_Status.STATUS_ENABLE}>
                    {t('开启')}
                  </Radio>
                  <Radio value={DeviceAlarmRule_Status.STATUS_DISABLE}>
                    {t('关闭')}
                  </Radio>
                </RadioGroup>
              </FormItem>
            )}
          </FormBlock>
          <FormItem label={t('备注')}>
            <TextArea
              maxLength={100}
              placeholder={t('输入备注')}
              style={{ width: '400px' }}
              value={remarks}
              onChange={(e) => handleOptions('remarks', e.target.value)}
            />
          </FormItem>
        </Form>
      </FormPanel>
      {isEdit && (
        <FormPanel>
          <Form labelWidth='100px'>
            <div className='gm-text-bold gm-margin-top-10 gm-margin-bottom-10'>
              {t('其他信息')}
            </div>
            <NameInfo create_time={create_time!} creater_name={creater_name!} />
          </Form>
        </FormPanel>
      )}
      <FormPanel title={t('策略信息')}>
        <RuleList />
      </FormPanel>
    </FormGroup>
  )
}

export default observer(Details)
