import { t } from 'gm-i18n'
import React, { ReactNode, FC, useState } from 'react'
import { Checkbox, Button, Flex } from '@gm-pc/react'

interface ConfirmProps {
  confirmText: string
  children: ReactNode
  onCancel: () => void
  onOK: () => void
}

const Confirm: FC<ConfirmProps> = ({
  confirmText,
  children,
  onCancel,
  onOK,
}) => {
  const [checked, setChecked] = useState(false)

  return (
    <Flex column className='gm-padding-10'>
      {children}
      <div className='gm-margin-tb-10'>
        <Checkbox checked={checked} onChange={() => setChecked(!checked)}>
          {confirmText}
        </Checkbox>
      </div>
      <Flex justifyEnd>
        <Button onClick={onCancel}>{t('取消')}</Button>
        <Button
          type='primary'
          htmlType='submit'
          className='gm-margin-left-10'
          disabled={!checked}
          onClick={onOK}
        >
          {t('确定')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default Confirm
