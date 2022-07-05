import { Radio } from 'antd'
import { ProductionSettings } from 'gm_api/src/preference'
import React, { FC } from 'react'

type ProductionSettingsKey = keyof ProductionSettings

interface SettingRadioGroupProps {
  settingKey: ProductionSettingsKey
  value: ProductionSettings[ProductionSettingsKey]
  onChange: (
    key: keyof ProductionSettings,
    value: ProductionSettings[ProductionSettingsKey],
  ) => void
}

const SettingRadioGroup: FC<SettingRadioGroupProps> = ({
  settingKey,
  value,
  onChange,
  children,
}) => {
  const handleRadioChange = (e: any) => {
    onChange(settingKey, e.target.value)
  }
  return (
    <Radio.Group onChange={handleRadioChange} value={value}>
      {children}
    </Radio.Group>
  )
}

export default SettingRadioGroup
