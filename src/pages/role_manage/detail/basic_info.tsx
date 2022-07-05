import React, { ChangeEvent, FC, useState, forwardRef } from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  MoreSelect,
  Switch,
  Input,
  Button,
  Validator,
  TextArea,
} from '@gm-pc/react'
import { t } from 'gm-i18n'

interface BasicInfoProps {
  store: any
}

const BasicInfo = observer(
  forwardRef<Form, BasicInfoProps>(({ store }, ref) => {
    return (
      <FormPanel title={t('基本信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          <FormItem required label={t('角色名称')}>
            <Input
              className='form-control'
              value={store.form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                store.handleFormUpdate('name', e.target.value)
              }
            />
          </FormItem>
          <FormItem label={t('角色描述')}>
            <TextArea
              name='desc'
              rows={3}
              maxLength={50}
              value={store.form.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                store.handleFormUpdate('description', e.target.value)
              }
            />
          </FormItem>
        </Form>
      </FormPanel>
    )
  }),
)

export default BasicInfo
