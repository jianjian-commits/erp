import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import { Form, FormItem, Select, Button, Modal } from '@gm-pc/react'
import { Filters_Bool } from 'gm_api/src/common'

interface ChangeReceiptProps {
  onOk: (status: number) => void
}

const BatchChangeReceiptStatus: FC<ChangeReceiptProps> = ({ onOk }) => {
  const [status, setStatus] = useState<Filters_Bool>(Filters_Bool.FALSE)

  function handleSelect(value: number) {
    setStatus(value)
  }

  function handleOk() {
    onOk(status)
  }

  function onCancel(): void {
    Modal.hide()
  }
  return (
    <div className='gm-padding-5 gm-margin-left-15'>
      <Form labelWidth='90px' className='gm-padding-lr-20'>
        <FormItem label={t('批量修改为')}>
          <Select
            value={status}
            data={[
              { value: Filters_Bool.FALSE, text: t('未回单') },
              { value: Filters_Bool.TRUE, text: t('已回单') },
            ]}
            onChange={handleSelect}
          />
        </FormItem>
      </Form>
      <div className='gm-text-right'>
        <Button className='gm-margin-right-10' onClick={onCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleOk}>
          {t('确定')}
        </Button>
      </div>
    </div>
  )
}

export default BatchChangeReceiptStatus
