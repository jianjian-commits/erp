import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Form, Button, FormItem, Input, FormButton, Modal } from '@gm-pc/react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Menu_Period } from '../interface'
import store from '../store'
import Validator from '@gm-pc/react/src/validator/validator'
import ChoseIcon from './chose_icon'

interface Props {
  index: number
  onCancel: (index: number) => any
  onChange: <T extends keyof Menu_Period>(
    index: number,
    key: T,
    value: Menu_Period[T],
  ) => any
}

const EditMenu: FC<Props> = (props) => {
  const { index, onCancel, onChange } = props
  const menu_info = store.menu_period[index]
  const {
    name,
    icon: { id: iconId },
  } = menu_info
  return (
    <Form
      labelWidth='100px'
      colWidth='500px'
      btnPosition='right'
      // eslint-disable-next-line react/jsx-handler-names
      onSubmitValidated={Modal.hide}
    >
      <FormItem
        label={t('餐次名称')}
        required
        validate={Validator.create([], name)}
      >
        <Input
          value={name}
          onChange={(e) => {
            onChange(index, 'name', e.target.value)
          }}
          placeholder={t('请输入餐次')}
          maxLength={10}
        />
      </FormItem>
      <FormItem label={t('选择图标')}>
        <ChoseIcon
          id={iconId}
          iconData={store.icons}
          onSelect={(value) => {
            onChange(index, 'icon', value)
          }}
        />
      </FormItem>
      <FormButton>
        <Button
          onClick={() => {
            onCancel(index)
          }}
        >
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' className='gm-margin-left-5'>
          {t('保存')}
        </Button>
      </FormButton>
    </Form>
  )
}

export default observer(EditMenu)
