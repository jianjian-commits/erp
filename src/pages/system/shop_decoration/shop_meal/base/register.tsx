import React, { forwardRef } from 'react'
import { t } from 'gm-i18n'
import { FormPanel, Form, FormItem } from '@gm-pc/react'
import { observer } from 'mobx-react'

import store from '../store'
import { BSwitch } from '../../common'

const Register = forwardRef<Form, { storeDetail: typeof store }>(
  ({ storeDetail }, ref) => {
    const { register_code } = storeDetail
    return (
      <FormPanel title={t('注册流程')}>
        <Form ref={ref} labelWidth='150px' colWidth='450px'>
          <FormItem label={t('邀请码')}>
            <BSwitch
              checked={register_code}
              onChange={storeDetail._handleChangeRegisterCode}
              tip={t('关闭时，允许商户免邀请码注册')}
            />
          </FormItem>
        </Form>
      </FormPanel>
    )
  },
)

export default observer(Register)
