import React, { FC, useState, createContext, useEffect } from 'react'
import { setTitle } from '@gm-common/tool'
import { t } from 'gm-i18n'
import WeChatLogin from './wechat_login'
import AccountLogin from './account_login'
import './style.less'

export const LoginMethodContext = createContext<any>(null)

const LiteLogin: FC = () => {
  const [accountLogin, setAccountLogin] = useState<boolean>(false)
  useEffect(() => {
    setTitle(t('观麦数字化管理系统 - 登录'))
  }, [])

  return (
    <div className='light-login-bg'>
      <LoginMethodContext.Provider value={setAccountLogin}>
        {accountLogin ? <AccountLogin /> : <WeChatLogin />}
      </LoginMethodContext.Provider>
    </div>
  )
}

export default LiteLogin
