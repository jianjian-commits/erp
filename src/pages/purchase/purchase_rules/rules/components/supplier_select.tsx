import React, { FC, useState, useMemo } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { LabelFilter } from '../interface'
import { Select } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
interface SupplierSelectProps {
  onChange?: (value: string) => void
  style?: {}
  value?: string
  options: LabelFilter[]
}
const SupplierSelect: FC<SupplierSelectProps> = ({
  onChange,
  style,
  value,
  options,
}) => {
  const select = useMemo(() => {
    console.log('asdas', value)
    const res = _.some(options, (item) => item.value === value)
    return !res ? undefined : value
  }, [value, options])
  return (
    <Select
      value={select || undefined}
      placeholder={t('请选择供应商')}
      allowClear
      showSearch
      options={options}
      optionFilterProp='label'
      onChange={onChange}
      style={style}
    />
  )
}

SupplierSelect.defaultProps = {
  onChange: _.noop,
}
export default observer(SupplierSelect)
