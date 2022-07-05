import { t } from 'gm-i18n'
import React, { FC, ChangeEvent, useState } from 'react'
import { observer } from 'mobx-react'
import { FormItem, Input, Button } from '@gm-pc/react'
import _ from 'lodash'

interface AccountProps {
  accountData: {
    [key: string]: string
  }
  onChangeAccount: (key: string, value: string) => void
  isCreate: boolean
}

const Account: FC<AccountProps> = observer(
  ({ accountData, onChangeAccount, isCreate }) => {
    const { account_username, password, password_confirm } = accountData

    const [active, setActive] = useState(false)
    return (
      <>
        <FormItem required label={t('司机账号')}>
          <Input
            value={account_username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onChangeAccount('account_username', e.target.value)
            }}
            placeholder={t('填写司机账号')}
            style={{ width: '300px' }}
            className='form-control'
            type='text'
            disabled={!isCreate}
          />
        </FormItem>
        <FormItem label={t('登录密码')}>
          <>
            {(isCreate || active) && (
              <>
                <Input
                  className='form-control'
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChangeAccount('password', e.target.value)
                  }
                  placeholder={t('请输入密码')}
                  style={{ width: '300px' }}
                  type='password'
                />
                <Input
                  className='form-control gm-margin-top-10'
                  value={password_confirm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChangeAccount('password_confirm', e.target.value)
                  }
                  placeholder={t('请再次输入密码')}
                  style={{ width: '300px' }}
                  type='password'
                />
              </>
            )}
          </>
          {!isCreate && !active && (
            <Button type='link' onClick={() => setActive(true)}>
              {t('修改密码')}
            </Button>
          )}
        </FormItem>
      </>
    )
  },
)

export default Account
