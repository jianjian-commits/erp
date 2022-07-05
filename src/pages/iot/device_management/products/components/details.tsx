import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormItem,
  Validator,
  FormButton,
  Button,
  Input,
  FormPanel,
  TextArea,
  Tip,
} from '@gm-pc/react'
import { map_Device_DeviceType } from 'gm_api/src/device'
import { history } from '@/common/service'

import {
  Select_DeviceSupplier,
  Select_Device_DeviceType,
} from 'gm_api/src/device/pc'

import { t } from 'gm-i18n'
import storeInfo from '../store/storeInfo'
import { OptionsType } from '@/pages/iot/device_management/enum'
import { DetailProps } from '@/pages/iot/device_management/interface'
import PaddingDiv from '@/pages/iot/device_management/components/paddingDiv'
import NameInfo from '@/pages/iot/device_management/components/nameInfo'
import { DeviceModelInfo } from '../interface'

const Details: FC<DetailProps> = ({ isEdit = false, model_id }) => {
  const {
    device_model_id,
    device_supplier_id,
    device_model_name,
    remarks,
    creater_name,
    create_time,
    device_supplier_name,
    device_strategy,
    device_type,
  } = storeInfo.modalInfo

  useEffect(() => {
    if (isEdit) {
      storeInfo.getModel(model_id!)
    }
    return () => storeInfo.initData()
  }, [isEdit, model_id])

  const handleOptions = <T extends keyof DeviceModelInfo>(
    name: T,
    value: DeviceModelInfo[T],
  ) => {
    storeInfo.changeModalInfo(name, value)
  }

  return (
    <FormPanel title={t(isEdit ? '基本信息' : '添加设备型号')}>
      <Form
        labelWidth='100px'
        onSubmitValidated={() => {
          storeInfo
            .optionModal(isEdit ? OptionsType.edit : OptionsType.create)
            .then(() => {
              Tip.success(t('操作成功'))
              history.push('/iot/device_management/products')
              return null
            })
        }}
      >
        {isEdit && (
          <FormItem label={t('设备型号ID')}>
            <PaddingDiv>{device_model_id}</PaddingDiv>
          </FormItem>
        )}
        {!isEdit && (
          <>
            <FormItem label={t('供应商')}>
              <Select_DeviceSupplier
                getName={({ device_supplier_name }) => device_supplier_name}
                placeholder={t('选择供应商')}
                value={device_supplier_id!}
                onChange={(v) => handleOptions('device_supplier_id', v)}
              />
            </FormItem>
            <FormItem
              label={t('设备类型')}
              required
              validate={Validator.create([], device_type)}
            >
              <Select_Device_DeviceType
                placeholder={t('选择设备类型')}
                value={device_type!}
                onChange={(v) => handleOptions('device_type', v)}
              />
            </FormItem>
          </>
        )}
        <FormItem
          label={t('设备型号')}
          required
          validate={Validator.create([], device_model_name)}
        >
          <Input
            maxLength={11}
            type='text'
            placeholder={t('输入设备型号')}
            value={device_model_name}
            onChange={(e) => {
              handleOptions('device_model_name', e.target.value)
            }}
          />
        </FormItem>
        {isEdit && (
          <>
            <FormItem label={t('供应商')}>
              <PaddingDiv>{device_supplier_name || '-'}</PaddingDiv>
            </FormItem>
            <FormItem label={t('设备类型')}>
              <PaddingDiv>{map_Device_DeviceType[device_type!]}</PaddingDiv>
            </FormItem>
            <FormItem label={t('策略')}>
              <PaddingDiv>
                {device_strategy?.device_strategy_name ? (
                  <a
                    onClick={() => {
                      history.push(
                        `/iot/device_management/tasks?strategy_id=${device_strategy.device_strategy_id}`,
                      )
                    }}
                  >
                    {device_strategy.device_strategy_name!}
                  </a>
                ) : (
                  '-'
                )}
              </PaddingDiv>
            </FormItem>
            <NameInfo create_time={create_time!} creater_name={creater_name!} />
          </>
        )}

        <FormItem label={t('备注')}>
          <TextArea
            placeholder={t('输入备注')}
            style={{ width: '400px' }}
            maxLength={100}
            value={remarks}
            onChange={(e) => handleOptions('remarks', e.target.value)}
          />
        </FormItem>
        <FormButton>
          <Button
            onClick={() => {
              history.push('/iot/device_management/products')
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
