import { t } from 'gm-i18n'
import React, { FC, useState, useEffect, useRef, ChangeEvent } from 'react'
import { AddSubclassInputOption } from '../../../manage/interface'
import { Form, FormItem, Input } from '@gm-pc/react'

const AddSubclassInput: FC<AddSubclassInputOption> = ({ onChange }) => {
  const [name, changeName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    onChange('')
    inputRef.current?.focus()
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    changeName(value)
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <Form inline disabledCol>
      <FormItem label={t('分类名称')} required>
        <Input
          value={name}
          className='form-control'
          style={{ width: '280px' }}
          onChange={handleChange}
          ref={inputRef}
          maxLength={30}
        />
      </FormItem>
    </Form>
  )
}

export default AddSubclassInput
