import React from 'react'
import { Switch, SwitchProps } from '@gm-pc/react'

interface SwitchEnumProps<T> extends SwitchProps {
  trueValue: T
  falseValue: T
  status: T
  onEnumChange(checked: T): void
}

function SwitchEnum<T>({
  trueValue,
  falseValue,
  status,
  onEnumChange,
}: SwitchEnumProps<T>) {
  return (
    <Switch
      style={{ width: '35px', cursor: 'pointer' }}
      checked={status === trueValue}
      onChange={(checked) => onEnumChange(checked ? trueValue : falseValue)}
    />
  )
}

export default SwitchEnum
