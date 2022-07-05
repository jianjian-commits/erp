import React, { FC, useState, useEffect, useRef, useContext } from 'react'
import { Flex } from '@gm-pc/react'
import { Token, ListGroup, UseGroup } from 'gm_api/src/oauth'
import { Group } from 'gm_api/src/enterprise'
import './style.less'
import NoCompany from './no_company'
import CompanyList from './company_list'
import SvgBack from '@/svg/light_login_back.svg'
import { UUID } from '@gm-common/tool'
import { t } from 'gm-i18n'
import classNames from 'classnames'
import { Spin } from 'antd'
import { clearAuth, setAccessToken } from '@gm-common/x-request'
import { LoginMethodContext } from '../index'
import AccountSwitcher from '@/img/account_login_switcher_1.png'
import { addGrayscale } from '@/common/util'

const appid = 'wx160b2968a569643a'

const AfterScan: FC<{ handleBack: () => void; groupList: Group[] }> = ({
  handleBack,
  groupList,
}) => {
  return (
    <Flex column>
      <Flex className='form-head'>
        <Flex alignCenter onClick={handleBack} className='gm-cursor'>
          <SvgBack className='form-head-svg' />
          <span className='form-head-word'>{t('返回')}</span>
        </Flex>
      </Flex>
      {groupList.length > 0 ? <CompanyList data={groupList} /> : <NoCompany />}
    </Flex>
  )
}

const BeforeScan: FC = () => {
  useEffect(() => {
    const nextUrl = `${window.location.protocol}//${window.location.host}/passport`
    const redirect_url = encodeURIComponent(
      `https://x.guanmai.cn/passport?system=erp&type=login&redirect=${nextUrl}`,
    )
    // @ts-ignore
    const wwLogin = new WxLogin({
      self_redirect: true,
      id: 'wechat_login_container',
      appid: appid,
      scope: 'snsapi_login',
      redirect_uri: redirect_url,
      state: UUID.generate(),
      style: '',
      href: 'https://file.guanmai.cn/wechat_login_style.css',
    })
  }, [])

  return <div id='wechat_login_container' />
}

const WeChatLogin: FC = () => {
  const [scanState, setScanState] = useState(false)
  const [groupList, setGroupList] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timer | null>(null)
  const setAccountLogin = useContext(LoginMethodContext)

  const getCode = () => {
    const weComVerifyMsg = JSON.parse(
      sessionStorage.getItem('passport__wechatwork_login_code') || '{}',
    )
    return weComVerifyMsg?.code
  }

  const resetMsg = () => {
    sessionStorage.removeItem('passport__wechatwork_login_code')
    clearInterval(timerRef.current as NodeJS.Timer)
    timerRef.current = null
  }

  const getToken = (code: string) => {
    return Token({
      grant_type: 'wechat_qrconnect',
      wechat_code: code,
      wechat_app_id: appid,
      client_id: '1',
    }).then((res) => res.response)
  }

  const getGroupList = () => {
    return ListGroup().then((res) => {
      return res.response
    })
  }

  const loginGroup = (group_id: string) => {
    return UseGroup({ group_id }).then((res) => {
      const token = res.response.access_token
      if (token) {
        setAccessToken(token)
        addGrayscale(group_id)
        window.location.href = window.location.href.replace(
          window.location.hash,
          '',
        )
      }
      return res.response
    })
  }

  const loginLogic = () => {
    console.log('定时中。。。')
    const code = getCode()
    if (code) {
      setLoading(true)
      resetMsg()
      getToken(code)
        .then((res) => {
          const access_token = res.access_token || ''
          setAccessToken(access_token)
          return getGroupList()
        })
        .then(
          (res) => {
            const groups = res.groups || []
            if (groups.length === 1) {
              loginGroup(groups[0].group_id)
            } else {
              setGroupList(groups)
              setLoading(false)
              setScanState(true)
            }
          },
          () => clearAuth(),
        )
    }
  }

  useEffect(() => {
    timerRef.current = setInterval(loginLogic, 1000)

    return () => {
      resetMsg()
    }
  }, [])

  const handleBack = () => {
    clearAuth()
    setScanState(false)
    timerRef.current = setInterval(loginLogic, 1000)
  }
  return (
    <Flex
      column
      className={classNames('lite-wechat-login-container', {
        'tw-justify-center': !scanState,
        'tw-items-center': !scanState,
      })}
    >
      {!scanState && (
        <div
          className='account-login-switcher'
          onClick={() => setAccountLogin(true)}
        >
          <div className='account-login-switcher-triangle' />
          <p>{t('账号密码登录')}</p>
          <img src={AccountSwitcher} />
        </div>
      )}
      <Spin
        spinning={loading}
        className={classNames({
          'tw-bg-white': loading,
        })}
      >
        {scanState ? (
          <AfterScan handleBack={handleBack} groupList={groupList} />
        ) : (
          <BeforeScan />
        )}
      </Spin>
    </Flex>
  )
}

export default WeChatLogin
