import React from 'react'
import { Input, InputProps as AntdInputProps } from 'antd'
import { useControllableValue } from '@/common/hooks'
import _ from 'lodash'
import globalStore from '@/stores/global'

type InputProps = Omit<AntdInputProps, 'onChange'> & {
  onChange?: (value: string) => void
}

function checkValue(value: string, precision: number, min?: number): boolean {
  // 正则说明：前置无限【1-9】的数字加小数点加精度个数字，前置为「0」加小数点加精度个数字
  const reg = new RegExp(
    '(^[1-9]\\d*(\\.\\d{0,' +
      precision +
      '})?$)|(^0(\\.\\d{0,' +
      precision +
      '})?$)',
  )
  // min >= 0 '-' 就是不合法的
  if ((_.isUndefined(min) || min < 0) && value.startsWith('-')) {
    value = value.slice(1)
  }
  if (value === '') {
    return true
  }
  return reg.test(value)
}

const InputNumber: React.VFC<InputProps> = (props) => {
  const [value, setValue] = useControllableValue<string>(props)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    if (checkValue(value, globalStore.dpOrder, 0)) {
      setValue(e.target.value)
    }
  }

  return <Input {...props} value={value} onChange={handleChange} />
}

export default InputNumber
