import React from 'react'
import { Select } from 'antd'
import { t } from 'gm-i18n'
import classNames from 'classnames'
import { AddOrderValueFieldType, options } from './constants'

interface SelectFakeOrderFieldProps {
  className?: string
  style?: React.CSSProperties
  value?: AddOrderValueFieldType
  onChange?: (value: AddOrderValueFieldType) => void
}

/** 选择加单字段 */
const SelectFakeOrderField: React.VFC<SelectFakeOrderFieldProps> = (props) => {
  const { className, style, value, onChange } = props
  return (
    <div
      className={classNames(className, 'tw-inline-flex tw-items-center')}
      style={style}
    >
      <label
        className='tw-whitespace-nowrap'
        htmlFor='smart-add-fake-order-field'
        style={{ marginRight: 12 }}
      >
        {t('加单字段')}
      </label>
      <Select
        id='smart-add-fake-order-field'
        style={{ minWidth: 240 }}
        value={value}
        onChange={onChange}
        placeholder={t('选择加单字段')}
        options={options}
      />
    </div>
  )
}

export default SelectFakeOrderField
