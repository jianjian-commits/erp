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
  Modal,
  Tip,
  Select,
} from '@gm-pc/react'

import {
  Device_AlarmEnableStatus,
  Device_EnableStatus,
  DeviceModel,
  map_Device_DeviceType,
} from 'gm_api/src/device'
import { history } from '@/common/service'

import { t } from 'gm-i18n'
import storeInfo from '../store/storeInfo'
import { OptionsType } from '@/pages/iot/device_management/enum'
import { DetailProps } from '@/pages/iot/device_management/interface'
import PaddingDiv from '@/pages/iot/device_management/components/paddingDiv'
import NameInfo from '@/pages/iot/device_management/components/nameInfo'
import { ExpandDevice } from '../interface'
import Sync from './sync'
import _ from 'lodash'

const Details: FC<DetailProps> = ({ isEdit = false, deviceId }) => {
  const {
    device_id,
    device_name,
    region,
    device_serial_no,
    device_mac,
    device_alarm_rule_id,
    device_model_id,
    device_type,
    remarks,
    create_time,
    creater_name,
    enable_status,
    alarm_enable_status,
    device_model_name,
  } = storeInfo.deviceInfo
  const { ModelData, AlarmRuleData } = storeInfo

  // 设备型号依赖与供应商、报警设置依赖于设备型号
  // 创建时只获取设备型号，同步后设备型号需要在拉取一次
  useEffect(() => {
    const getData = async () => {
      if (isEdit) {
        await storeInfo.getDevice(deviceId!)
        storeInfo.getAlarmRule()
      } else storeInfo.getModel()
    }
    getData()
    return () => storeInfo.initData()
  }, [isEdit, deviceId])

  const handleOptions = <T extends keyof ExpandDevice>(
    name: T,
    value: ExpandDevice[T],
  ) => {
    storeInfo.changeDeviceInfo(name, value)
  }

  const handleChangeInfos = (device: DeviceModel) => {
    const { device_model_id, device_supplier_id, device_supplier_name } = device
    storeInfo.changeDeviceInfos(
      Object.assign(storeInfo.deviceInfo, {
        device_model_id,
        device_supplier_id,
        device_supplier_name,
        device_alarm_rule_id: '0',
      }),
    )
  }

  const handleSync = () => {
    Modal.render({
      style: {
        width: '600px',
        height: '670px',
      },
      title: t('同步供应商设备'),
      children: <Sync />,
      onHide: Modal.hide,
    })
  }

  const Key = useCallback(() => {
    return (
      <Observer>
        {() => {
          const { device_key } = storeInfo.deviceInfo
          return (
            <FormItem label={t('设备识别号')}>
              <Input
                maxLength={30}
                type='text'
                placeholder={t('输入设备识别号')}
                value={device_key}
                onChange={(e) => {
                  handleOptions('device_key', e.target.value)
                }}
              />
            </FormItem>
          )
        }}
      </Observer>
    )
  }, [])

  const Supplier = useCallback(() => {
    return (
      <Observer>
        {() => {
          const { device_supplier_name } = storeInfo.deviceInfo
          return (
            <FormItem label={t('供应商')}>
              <PaddingDiv>{device_supplier_name || '-'}</PaddingDiv>
            </FormItem>
          )
        }}
      </Observer>
    )
  }, [])

  return (
    <FormPanel title={t(isEdit ? '基本信息' : '添加设备')}>
      <Form
        labelWidth='100px'
        onSubmitValidated={() => {
          storeInfo
            .optionStrategy(isEdit ? OptionsType.edit : OptionsType.create)
            .then(() => {
              Tip.success(t('操作成功'))
              history.push('/iot/device_management/devices')
              return null
            })
        }}
      >
        {isEdit && (
          <>
            <FormItem label={t('设备编号')}>
              <PaddingDiv>{device_id}</PaddingDiv>
            </FormItem>
            <Key />
          </>
        )}
        {!isEdit && (
          <>
            <Button onClick={handleSync}>{t('同步供应商设备')}</Button>
            <Supplier />
          </>
        )}
        <FormItem
          label={t('设备型号')}
          required
          validate={Validator.create([], device_model_id)}
        >
          {isEdit ? (
            <PaddingDiv>{device_model_name}</PaddingDiv>
          ) : (
            <Select
              data={ModelData.slice()}
              value={device_model_id!}
              onChange={(value) => {
                storeInfo.getAlarmRule(value)
                handleChangeInfos(
                  _.find(ModelData.slice(), { device_model_id: value })!,
                )
              }}
              placeholder={t('选择设备型号')}
            />
          )}
        </FormItem>
        {isEdit && (
          <FormItem label={t('设备类型')}>
            <PaddingDiv>{map_Device_DeviceType[device_type!]}</PaddingDiv>
          </FormItem>
        )}
        <FormItem
          label={t('设备名称')}
          required
          validate={Validator.create([], device_name)}
        >
          <Input
            type='text'
            placeholder={t('输入设备名称')}
            maxLength={11}
            value={device_name}
            onChange={(e) => {
              handleOptions('device_name', e.target.value)
            }}
          />
        </FormItem>
        <FormItem label={t('区域')}>
          <Input
            maxLength={11}
            type='text'
            placeholder={t('输入区域名称')}
            value={region}
            onChange={(e) => {
              handleOptions('region', e.target.value)
            }}
          />
        </FormItem>
        {isEdit && <Supplier />}
        <FormItem label={t('设备序列号')}>
          <Input
            maxLength={30}
            type='text'
            placeholder={t('输入设备序列号')}
            value={device_serial_no}
            onChange={(e) => {
              handleOptions('device_serial_no', e.target.value)
            }}
          />
        </FormItem>
        {!isEdit && <Key />}
        <FormItem label={t('设备MAC地址')}>
          <Input
            maxLength={30}
            type='text'
            placeholder={t('输入设备MAC地址')}
            value={device_mac}
            onChange={(e) => {
              handleOptions('device_mac', e.target.value)
            }}
          />
        </FormItem>
        <FormItem label={t('报警设置')}>
          <Select
            data={AlarmRuleData.slice()}
            value={device_alarm_rule_id!}
            onChange={(value) => handleOptions('device_alarm_rule_id', value)}
            placeholder={t('选择报警设置')}
          />
        </FormItem>
        {isEdit && (
          <>
            <NameInfo create_time={create_time!} creater_name={creater_name!} />
            <FormItem label={t('启动状态')}>
              <RadioGroup
                className='gm-margin-left-10'
                value={enable_status}
                onChange={(e) => handleOptions('enable_status', e)}
              >
                <Radio value={Device_EnableStatus.ENABLESTATUS_ENABLE}>
                  {t('开启')}
                </Radio>
                <Radio value={Device_EnableStatus.ENABLESTATUS_DISABLE}>
                  {t('关闭')}
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label={t('报警启停')}>
              <RadioGroup
                className='gm-margin-left-10'
                value={alarm_enable_status}
                onChange={(e) => handleOptions('alarm_enable_status', e)}
              >
                <Radio
                  value={Device_AlarmEnableStatus.ALARMENABLESTATUS_ENABLE}
                >
                  {t('开启')}
                </Radio>
                <Radio
                  value={Device_AlarmEnableStatus.ALARMENABLESTATUS_DISABLE}
                >
                  {t('关闭')}
                </Radio>
              </RadioGroup>
            </FormItem>
          </>
        )}
        <FormItem label={t('备注')}>
          <TextArea
            maxLength={100}
            placeholder={t('输入备注')}
            style={{ width: '400px' }}
            value={remarks}
            onChange={(e) => handleOptions('remarks', e.target.value)}
          />
        </FormItem>
        <FormButton>
          <Button
            onClick={() => {
              history.push('/iot/device_management/devices')
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
