import React, { FC, useEffect, useCallback } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  Form,
  FormItem,
  Validator,
  FormButton,
  Button,
  Input,
  FormPanel,
  TextArea,
  RadioGroup,
  Radio,
  Select,
  InputNumber,
  Flex,
  Tip,
} from '@gm-pc/react'
import {
  DeviceStrategy_Status,
  TimeType,
  DeviceStrategy_Type,
} from 'gm_api/src/device'
import {
  Select_DeviceStrategy_Type,
  Select_DeviceModel,
  Select_DeviceStrategy_CollectionType,
  Select_TimeType,
} from 'gm_api/src/device/pc'
import { history } from '@/common/service'

import { t } from 'gm-i18n'
import storeInfo from '../store/storeInfo'
import { OptionsType } from '@/pages/iot/device_management/enum'
import { DetailProps } from '@/pages/iot/device_management/interface'
import PaddingDiv from '@/pages/iot/device_management/components/paddingDiv'
import NameInfo from '@/pages/iot/device_management/components/nameInfo'
import { FrequencySelect, FrequencyValue } from '../enum'
import { ExpandDeviceStrategy } from '../interface'
import '../../style.less'

const Details: FC<DetailProps> = ({ isEdit = false, strategy_id }) => {
  const {
    device_strategy_id,
    device_strategy_name,
    type,
    device_model_id,
    collection_type,
    strategy_frequency,
    time_type,
    status,
    create_time,
    creater_name,
    timeSelect,
  } = storeInfo.strategyInfo

  useEffect(() => {
    if (isEdit) {
      storeInfo.getStrategy(strategy_id!)
    }
    return () => storeInfo.initData()
  }, [isEdit, strategy_id])

  const handleOptions = <T extends keyof ExpandDeviceStrategy>(
    name: T,
    value: ExpandDeviceStrategy[T],
  ) => {
    storeInfo.changeStrategyInfo(name, value)
  }

  const Remarks = useCallback(() => {
    return (
      <Observer>
        {() => {
          const { remarks } = storeInfo.strategyInfo
          return (
            <FormItem label={t('策略说明')}>
              <TextArea
                maxLength={100}
                placeholder={t('输入策略说明')}
                style={{ width: '400px' }}
                value={remarks}
                onChange={(e) => handleOptions('remarks', e.target.value)}
              />
            </FormItem>
          )
        }}
      </Observer>
    )
  }, [])

  return (
    <FormPanel title={t(isEdit ? '基本信息' : '创建策略')}>
      <Form
        labelWidth='100px'
        onSubmitValidated={() => {
          storeInfo
            .optionStrategy(isEdit ? OptionsType.edit : OptionsType.create)
            .then(() => {
              Tip.success(t('操作成功'))
              history.push('/iot/device_management/tasks')
              return null
            })
        }}
      >
        {isEdit && (
          <FormItem label={t('策略ID')}>
            <PaddingDiv>{device_strategy_id}</PaddingDiv>
          </FormItem>
        )}
        <FormItem
          label={t('策略名称')}
          required
          validate={Validator.create([], device_strategy_name)}
        >
          <Input
            maxLength={11}
            type='text'
            placeholder={t('输入策略名称')}
            value={device_strategy_name}
            onChange={(e) => {
              handleOptions('device_strategy_name', e.target.value)
            }}
          />
        </FormItem>
        <FormItem
          label={t('策略类型')}
          required
          validate={Validator.create([], type)}
        >
          <Select_DeviceStrategy_Type
            value={type!}
            onChange={(v) => handleOptions('type', v)}
            disabled
          />
        </FormItem>
        {isEdit && <Remarks />}
        <FormItem
          label={t('设备型号')}
          required
          validate={Validator.create([], device_model_id)}
        >
          <Select_DeviceModel
            params={{
              is_no_strategy: true,
              strategy_type: DeviceStrategy_Type.TYPE_COLLECTION, // 策略类型暂不可选写死
            }}
            getName={({ device_model_name }) => device_model_name}
            placeholder={t('选择目标产品')}
            value={device_model_id!}
            onChange={(v) => handleOptions('device_model_id', v)}
          />
        </FormItem>
        <FormItem
          label={t('采集方式')}
          required
          validate={Validator.create([], collection_type)}
        >
          <Select_DeviceStrategy_CollectionType
            placeholder={t('选择采集方式')}
            value={collection_type!}
            onChange={(v) => handleOptions('collection_type', v)}
          />
        </FormItem>
        <FormItem
          label={t('采集频率')}
          required
          validate={Validator.create([], timeSelect, (r) => {
            if (r === FrequencyValue.free) {
              if (strategy_frequency! <= 0) {
                return '频率需要大于0'
              }
            }
            return ''
          })}
        >
          <>
            <Select
              placeholder={t('选择采集频率')}
              data={FrequencySelect}
              value={timeSelect}
              onChange={(v) => handleOptions('timeSelect', v)}
            />
            {timeSelect === FrequencyValue.free && (
              <Flex className='gm-margin-top-10'>
                <InputNumber
                  className='input_length'
                  min={0}
                  max={time_type === TimeType.TIMETYPE_SECOND ? 3600 : 60}
                  value={strategy_frequency}
                  onChange={(v) => handleOptions('strategy_frequency', v!)}
                  precision={0}
                />
                <Select_TimeType
                  enumFilter={(res) => {
                    res.splice(2, 1)
                    return res
                  }}
                  className='gm-margin-left-10'
                  style={{ flex: '1' }}
                  value={time_type!}
                  onChange={(v) => storeInfo.changeStrategyTime(v)}
                />
              </Flex>
            )}
          </>
        </FormItem>
        {isEdit && (
          <>
            <FormItem label={t('启动状态')}>
              <RadioGroup
                className='gm-margin-left-10'
                value={status}
                onChange={(e) => handleOptions('status', e)}
              >
                <Radio value={DeviceStrategy_Status.STATUS_ENABLE}>
                  {t('开启')}
                </Radio>
                <Radio value={DeviceStrategy_Status.STATUS_DISABLE}>
                  {t('关闭')}
                </Radio>
              </RadioGroup>
            </FormItem>
            <NameInfo create_time={create_time!} creater_name={creater_name!} />
          </>
        )}
        {!isEdit && <Remarks />}
        <FormButton>
          <Button
            onClick={() => {
              history.push('/iot/device_management/tasks')
            }}
          >
            {t('取消')}
          </Button>
          <Button type='primary' htmlType='submit' className='gm-margin-left-5'>
            {t('保存')}
          </Button>
        </FormButton>
      </Form>
    </FormPanel>
  )
}

export default observer(Details)
