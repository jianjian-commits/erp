import React, { FC, ChangeEvent, forwardRef } from 'react'
import { observer } from 'mobx-react'
import { FormPanel, Form, FormItem, Input } from '@gm-pc/react'
import { t } from 'gm-i18n'

interface UserInfoProps {
  store: any
}

const UserInfo = observer(
  forwardRef<Form, UserInfoProps>(({ store }, ref) => {
    return (
      <FormPanel title={t('用户信息')}>
        <Form ref={ref} colWidth='400px' labelWidth='150px'>
          <FormItem required label={t('姓名')}>
            <Input
              className='form-control'
              value={store.form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                store.handleFormUpdate('name', e.target.value)
              }
            />
          </FormItem>
          <FormItem label={t('手机')}>
            <Input
              className='form-control'
              value={store.form.phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                store.handleFormUpdate('phone', e.target.value)
              }
            />
          </FormItem>
          <FormItem label={t('邮箱')}>
            <Input
              className='form-control'
              value={store.form.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                store.handleFormUpdate('email', e.target.value)
              }
            />
          </FormItem>
          <FormItem label={t('身份证号')}>
            <Input
              className='form-control'
              value={store.form.id_number}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                store.handleFormUpdate('id_number', e.target.value)
              }
            />
          </FormItem>
        </Form>
      </FormPanel>
    )
  }),
)

export default UserInfo
