import React from 'react'
import { ControlledFormItem, Validator } from '@gm-pc/react'
import { Select_DeviceSupplier_Type } from 'gm_api/src/device/pc'
import storeInfo from '../store/storeInfo'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'

const Supplier = () => {
  const { type } = storeInfo.supplierInfo
  return (
    <ControlledFormItem
      label={t('供应商类型')}
      required
      validate={Validator.create([], type)}
    >
      <Select_DeviceSupplier_Type
        placeholder={t('选择供应商')}
        value={type!}
        onChange={(e) => storeInfo.changeSupplierInfo('type', e)}
      />
    </ControlledFormItem>
  )
}

export default observer(Supplier)
