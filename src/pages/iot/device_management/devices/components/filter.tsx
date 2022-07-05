import React, { FC } from 'react'
import {
  BoxForm,
  Input,
  FormButton,
  Button,
  ControlledFormItem,
} from '@gm-pc/react'
import {
  Select_DeviceModel,
  Select_Device_DeviceType,
} from 'gm_api/src/device/pc'
import storeList from '../store/storeList'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { DeviceFilter } from '../interface'

const Filter: FC<{ onSearch: () => {} }> = ({ onSearch }) => {
  const { device_name, device_model_id, device_type } = storeList.filter

  const handleChange = <T extends keyof DeviceFilter>(
    name: T,
    value: DeviceFilter[T],
  ) => {
    storeList.changeFilter(name, value)
  }

  return (
    <BoxForm onSubmit={onSearch} colWidth='280px'>
      <ControlledFormItem label={t('设备型号')}>
        <Select_DeviceModel
          all
          getName={({ device_model_name }) => device_model_name}
          placeholder={t('选择设备型号')}
          value={device_model_id!}
          onChange={(value) => handleChange('device_model_id', value)}
        />
      </ControlledFormItem>
      <ControlledFormItem label={t('设备类型')}>
        <Select_Device_DeviceType
          all
          value={device_type!}
          onChange={(v) => handleChange('device_type', v)}
          placeholder={t('选择设备类型')}
        />
      </ControlledFormItem>
      <ControlledFormItem label={t('设备')}>
        <Input
          type='text'
          placeholder={t('输入设备名称')}
          value={device_name}
          onChange={(e) => handleChange('device_name', e.target.value)}
        />
      </ControlledFormItem>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
