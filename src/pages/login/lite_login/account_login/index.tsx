import React, { FC, useContext, useEffect, useState } from 'react'
import { Flex, Storage } from '@gm-pc/react'
import { Input } from 'antd'
import { t } from 'gm-i18n'
import { GetUserInfo, Token } from 'gm_api/src/oauth'
import { clearAuth, setAccessToken } from '@gm-common/x-request'
import { encrypt, decrypt, addGrayscale } from '@/common/util'
import sha256 from 'crypto-js/sha256'
import AccountLoginGroup from '@/img/account_login_group.png'
import AccountLoginUsername from '@/img/account_login_username.png'
import AccountLoginPassword from '@/img/account_login_password.png'
import WechatSwitcher from '@/img/wechat_login_switcher_1.png'
import './style.less'
import { LoginMethodContext } from '../index'

const LoginForm = 'login_form'

enum PassWordSavingStatus {
  'Save',
  'Unsave',
}

const AccountLogin: FC = () => {
  const setAccountLogin = useContext(LoginMethodContext)
  const { group_id, username, password } = Storage.get(LoginForm) || {
    group_id: '',
    username: '',
    password: '',
  }
  const [groupKey, setGroupKey] = useState<string>(group_id)
  const [groupUsername, setGroupUsername] = useState<string>(username)
  const [groupPassword, setGroupPassword] = useState<string>(decrypt(password))
  const [memorizePassWord, setMemorizePassWord] = useState(
    Storage.get('memorize_passWord') ?? PassWordSavingStatus.Unsave,
  )
  const [canLogin, setCanLogin] = useState<boolean>(false)

  useEffect(() => {
    const value = groupKey && groupUsername && groupPassword
    if (value !== '') setCanLogin(true)
    else setCanLogin(false)
  }, [groupKey, groupUsername, groupPassword])

  const isGroupId = (key: string) => {
    return key.length > 12
  }

  const handleLogin = () => {
    const req: any = {
      grant_type: 'password',
      username: groupUsername,
      password: sha256(groupPassword).toString(),
      client_id: '1',
    }
    if (isGroupId(groupKey)) req.group_id = groupKey
    else req.group_customized_code = groupKey

    Token(req).then(async (res) => {
      const {
        response: { access_token },
      } = res
      setAccessToken(access_token || '')
      Storage.set('memorize_passWord', memorizePassWord)
      Storage.set(LoginForm, {
        group_id: groupKey,
        username: groupUsername,
        password:
          memorizePassWord === PassWordSavingStatus.Save
            ? encrypt(groupPassword)
            : '',
      })
      // 用于小程序第三方平台
      document.cookie = `authorization=${access_token}`
      const userInfo = await GetUserInfo()
      // 灰度
      addGrayscale(userInfo.response.user_info.group_id!)
      return null
    })
  }

  return (
    <Flex className='lite-account-login-container'>
      <div
        className='wechat-login-switcher'
        onClick={() => setAccountLogin(false)}
      >
        <div className='wechat-login-switcher-triangle' />
        <p>{t('微信扫码登录')}</p>
        <img src={WechatSwitcher} />
      </div>
      <div className='lite-account-login-form'>
        <div className='lite-account-login-title'>{t('账号密码登录')}</div>
        <Input
          type='text'
          className='lite-account-login-input'
          placeholder={t('输入企业编码')}
          prefix={
            <img
              src={AccountLoginGroup}
              className='lite-account-login-input-icon'
            />
          }
          name='group_id'
          value={groupKey}
          onChange={(e) => {
            setGroupKey(e.target.value)
          }}
        />
        <Input
          type='text'
          className='lite-account-login-input'
          placeholder={t('输入登录账号')}
          prefix={
            <img
              src={AccountLoginUsername}
              className='lite-account-login-input-icon'
            />
          }
          name='username'
          value={groupUsername}
          onChange={(e) => {
            setGroupUsername(e.target.value)
          }}
        />
        <Input
          type='password'
          className='lite-account-login-input'
          autoComplete='new-password'
          placeholder={t('输入登录密码')}
          prefix={
            <img
              src={AccountLoginPassword}
              className='lite-account-login-input-icon'
            />
          }
          name='password'
          value={groupPassword}
          onChange={(e) => {
            setGroupPassword(e.target.value)
          }}
        />
        <div style={{ height: '16px' }} />
        <label>
          <input
            className='login-checkbox-input'
            type='checkbox'
            checked={memorizePassWord === PassWordSavingStatus.Save}
            onChange={(e) => {
              setMemorizePassWord(
                e.target.checked
                  ? PassWordSavingStatus.Save
                  : PassWordSavingStatus.Unsave,
              )
            }}
          />
          <span className='login-checkbox-span' />
          <span className='login-checkbox-span-text'>{t('记住密码')}</span>
        </label>
        <button
          className='lite-account-login-button'
          disabled={!canLogin}
          onClick={handleLogin}
        >
          {t('登录')}
        </button>
      </div>
    </Flex>
  )
}

export default AccountLogin
