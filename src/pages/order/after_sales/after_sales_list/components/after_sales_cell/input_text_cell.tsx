import React, { FC, ChangeEvent } from 'react'
import { observer } from 'mobx-react'
import { KCInput } from '@gm-pc/keyboard'
import { ReturnRefundList } from '../../interface'

interface Props {
  name: keyof ReturnRefundList
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const InputTextCell: FC<Props> = observer((props) => {
  const { name, value, onChange } = props
  return (
    <KCInput
      type='text'
      autoComplete='off'
      name={name}
      value={value}
      onChange={onChange}
      className='form-control input-sm'
      style={{ width: '150px' }}
    />
  )
})

export default InputTextCell
