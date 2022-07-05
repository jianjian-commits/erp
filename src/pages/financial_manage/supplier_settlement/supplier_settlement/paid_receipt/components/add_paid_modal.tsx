import { Button, Flex, Form, FormItem, Input, Modal } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import _ from 'lodash'

interface Props {
  onEnsure: (code: string) => void
  onCancel: () => void
}

const AddPaidModal: FC<Props> = (props) => {
  const [value, setValue] = useState('')

  return (
    <div className='gm-margin-10'>
      <Form labelWidth='80px' colWidth='100%'>
        <FormItem label={t('交易流水号')}>
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        </FormItem>
        <FormItem label={t('提示')}>
          <div className='gm-text-desc'>
            {t(
              '批量结款会将所有结款的的实结金额作为已结金额，并标记为已结款，批量结款的结款单共用一个交易流水号',
            )}
          </div>
        </FormItem>
      </Form>
      <Flex justifyEnd className='gm-margin-10'>
        <Button
          type='default'
          className='gm-margin-right-10'
          onClick={props.onCancel}
        >
          {t('取消')}
        </Button>
        <Button
          type='primary'
          disabled={!_.trim(value)}
          onClick={() => {
            props.onEnsure(value)
            Modal.hide()
          }}
        >
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

export default AddPaidModal
