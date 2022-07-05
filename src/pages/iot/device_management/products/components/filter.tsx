import React, { FC } from 'react'
import {
  BoxForm,
  FormBlock,
  Input,
  FormButton,
  Button,
  ControlledFormItem,
} from '@gm-pc/react'
import {
  Select_DeviceSupplier,
  Select_Device_DeviceType,
} from 'gm_api/src/device/pc'
import storeList from '../store/storeList'
import { observer } from 'mobx-react'
import { DeviceModelFilter } from '../interface'
import { t } from 'gm-i18n'
import _ from 'lodash'

const Filter: FC<{ onSearch: () => {} }> = ({ onSearch }) => {
  const {
    device_supplier_id,
    device_model_name,
    device_type,
  } = storeList.filter

  const handleChange = <T extends keyof DeviceModelFilter>(
    name: T,
    value: DeviceModelFilter[T],
  ) => {
    storeList.changeFilter(name, value)
  }

  return (
    <BoxForm onSubmit={onSearch} colWidth='280px'>
      <FormBlock col={3}>
        <ControlledFormItem label={t('供应商')}>
          <Select_DeviceSupplier
            all
            value={device_supplier_id!}
            getName={({ device_supplier_name }) => device_supplier_name}
            getResponseData={(res) => {
              const data = res.device_suppliers
              data.unshift({
                device_supplier_id: '-1',
                device_supplier_name: '未选择',
              })
              return data
            }}
            onChange={(v) => handleChange('device_supplier_id', v)}
            placeholder={t('选择供应商')}
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
        <ControlledFormItem label={t('设备型号')}>
          <Input
            type='text'
            placeholder={t('输入设备型号')}
            value={device_model_name}
            onChange={(e) => handleChange('device_model_name', e.target.value)}
          />
        </ControlledFormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
