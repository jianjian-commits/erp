import React, { FC, useMemo } from 'react'
import { observer } from 'mobx-react'
import { LabelFilter } from '../interface'
import { Select } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
interface PurchaseSelectProps {
  onChange?: (value: string) => void
  style?: {}
  options: LabelFilter[]
  value?: string
}
const PurchaseSelect: FC<PurchaseSelectProps> = ({
  onChange,
  style,
  options,
  value,
}) => {
  const select = useMemo(() => {
    const res = _.some(options, (item) => item.value === value)
    return !res ? undefined : value
  }, [value, options])

  return (
    <Select
      placeholder={t('请选择采购员')}
      value={select || undefined}
      allowClear
      showSearch
      optionFilterProp='label'
      options={options}
      style={style}
      onChange={onChange}
    />
  )
}

PurchaseSelect.defaultProps = {
  onChange: _.noop,
}
export default observer(PurchaseSelect)
