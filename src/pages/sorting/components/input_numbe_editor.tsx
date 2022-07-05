import React, { FC, useState, useRef } from 'react'
import { InputNumber } from '@gm-pc/react'

export interface InputNumberEditorProps {
  defaultValue: number
  editing: boolean
  onChange: (value: number) => void
}

const InputNumberEditor: FC<InputNumberEditorProps> = ({
  defaultValue,
  editing,
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue)

  const handleChangeValue = (value: number) => {
    setValue(value)
    onChange(value)
  }

  return (
    <div>
      {editing ? (
        <InputNumber min={0} value={value} onChange={handleChangeValue} />
      ) : (
        <div>{value}</div>
      )}
    </div>
  )
}

export default InputNumberEditor
