import { t } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import { Tip, Button, Storage, Flex } from '@gm-pc/react'
import { Checkbox, Input } from 'antd'
import './style.less'
import { GetUserInfo, Token } from 'gm_api/src/oauth'
import sha256 from 'crypto-js/sha256'
import LoginLogo from '@/img/login_logo_new.png'
import LoginLogoGroup from '@/img/login_logo_group.png'
import LoginLogoUsername from '@/img/login_logo_username.png'
import LoginLogoPassword from '@/img/login_logo_password.png'
import { setTitle, UUID } from '@gm-common/tool'
import qs from 'query-string'
import { addGrayscale } from '@/common/util'

const GroupKey = 'login_group_key'
const Username = 'login_username'
const Password = 'login_password'

enum PassWordSavingStatus {
  'Save',
  'Unsave',
}

const LoginForm = () => {
  const [groupKey, setGroupKey] = useState(Storage.get(GroupKey) || '')
  const [username, setUsername] = useState(Storage.get(Username) || '')
  const [password, setPassword] = useState(Storage.get(Password) || '')
  const [memorizePassWord, setMemorizePassWord] = useState(
    Storage.get('memorize_passWord') ?? PassWordSavingStatus.Unsave,
  )
  // useEffect(() => {
  //   addEventListener('message', (e) => {
  //     if (e.isTrusted && e.data?.type === 'sendCode') {
  //       const { code } = e.data
  //       console.log('收到code: ' + code)
  //     }
  //   })
  // }, [])
  function isGroupId(key: string) {
    return key.length > 12
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!groupKey || !username || !password) {
      Tip.danger('用户信息必填')
    } else {
      const req: any = {
        grant_type: 'password',
        username,
        password: sha256(password).toString(),
        client_id: '1',
      }
      if (isGroupId(groupKey)) {
        req.group_id = groupKey
      } else {
        req.group_customized_code = groupKey
      }
      Token(req).then(async (res) => {
        const {
          response: { access_token },
        } = res
        Storage.set(GroupKey, groupKey)
        Storage.set('memorize_passWord', memorizePassWord)
        if (memorizePassWord === PassWordSavingStatus.Save) {
          Storage.set(Username, username)
          Storage.set(Password, password)
        } else {
          Storage.remove(Username)
          Storage.remove(Password)
        }
        // 用于小程序第三方平台
        document.cookie = `authorization=${access_token}`
        const userInfo = await GetUserInfo()
        // 灰度
        addGrayscale(userInfo.response.user_info.group_id!)
        return null
      })
    }
  }

  useEffect(() => {
    setTitle(t('观麦数字化管理系统 - 登录'))
  }, [])
  return (
    <form name='gmFormLogin' onSubmit={handleSubmit}>
      <div className='b-login-form-wrap'>
        <Flex className='b-login-form' column>
          <>
            <Flex justifyCenter>
              <div className='gm-text-center b-login-form-title'>
                {t('欢迎登录')}
              </div>
            </Flex>
            <Flex justifyCenter>
              <Input
                className='b-login-input'
                type='text'
                placeholder='请输入企业编码'
                prefix={<img src={LoginLogoGroup} />}
                name='group_id'
                value={groupKey}
                onChange={(e) => setGroupKey(e.target.value)}
              />
            </Flex>
            <div className='gm-padding-top-20' />
            <Flex justifyCenter>
              <Input
                id='loginUsername'
                className='b-login-input'
                type='text'
                placeholder={t('请输入登录账号')}
                prefix={<img src={LoginLogoUsername} />}
                name='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Flex>
            <div className='gm-padding-top-20' />
            <Flex justifyCenter>
              <Input
                className='b-login-input'
                type='password'
                autoComplete='new-password'
                placeholder={t('请输入登录密码')}
                prefix={<img src={LoginLogoPassword} />}
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Flex>
            <div className='gm-padding-top-20' />
            <Flex justifyCenter>
              <Checkbox
                onChange={(e) => {
                  setMemorizePassWord(
                    e.target.checked
                      ? PassWordSavingStatus.Save
                      : PassWordSavingStatus.Unsave,
                  )
                }}
                style={{ width: '350px' }}
                checked={memorizePassWord === PassWordSavingStatus.Save}
              >
                {t('记住密码')}
              </Checkbox>
            </Flex>
            <div className='gm-padding-top-20' />
            <Flex justifyCenter>
              <Button
                type='primary'
                htmlType='submit'
                block
                className='b-login-form-submit'
              >
                {t('登录')}
              </Button>
            </Flex>
          </>
        </Flex>
      </div>
    </form>
  )
}

const ErpLogin = () => {
  return (
    <Flex style={{ height: '100vh' }} className='b-login'>
      <Flex flex block className='b-login-bg'>
        <div className='b-login-logo-content'>
          <img
            src={LoginLogo}
            alt=''
            style={{
              position: 'absolute',
              left: '3vw',
              top: '4vh',
            }}
          />
          <div className='b-login-phoneNum'>客服电话：400-860-0906</div>
          <Flex justifyEnd className='b-login-link'>
            <Flex className='b-login-link-base'>
              <a
                href='https://www.guanmai.cn/'
                target='_blank'
                rel='noreferrer'
              >
                平台介绍
              </a>
            </Flex>
            <Flex className='b-login-link-base'>
              <a
                href='https://www.guanmai.cn/open/'
                target='_blank'
                rel='noreferrer'
              >
                软件代理
              </a>
            </Flex>
            <Flex className='b-login-link-base'>
              <a
                href='https://www.guanmai.cn/case/'
                target='_blank'
                rel='noreferrer'
              >
                合作案例
              </a>
            </Flex>
            <Flex className='b-login-link-base'>
              <a
                href='https://www.guanmai.cn/about/'
                target='_blank'
                rel='noreferrer'
              >
                关于我们
              </a>
            </Flex>
          </Flex>
          <LoginForm />
        </div>
      </Flex>
    </Flex>
  )
}

export default ErpLogin
