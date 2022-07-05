import { UUID } from '@gm-common/tool'
import React, { FC, useEffect, useImperativeHandle, RefObject } from 'react'

export interface WeQrCodeRef {
  getCode(): string | undefined
  getAppId(): string
}

interface WeQrCodeType {
  /** 展示二维码的元素id */
  elementId: string
  /** 该二维码用于登录还是验证身份 */
  type: 'login' | 'verify'
  /** 通过getCode方法获取code */
  onRef: RefObject<WeQrCodeRef>
}

const appid = 'wx160b2968a569643a'

const WeQrCode: FC<WeQrCodeType> = ({
  elementId = 'qr',
  type = 'verify',
  onRef,
}) => {
  useEffect(() => {
    const nextUrl = `${window.location.protocol}//${window.location.host}/passport`
    const redirect_url = encodeURIComponent(
      `https://x.guanmai.cn/passport?system=erp&type=${type}&redirect=${nextUrl}`,
    )

    // @ts-ignore
    const wwLogin = new WxLogin({
      self_redirect: true,
      id: elementId,
      appid: appid,
      scope: 'snsapi_login',
      redirect_uri: redirect_url,
      state: UUID.generate(),
      style: '',
      href: 'https://file.guanmai.cn/wechat_bind_style.css',
    })
  }, [])

  const getCode = () => {
    const weComVerifyMsg = JSON.parse(
      sessionStorage.getItem(`passport__wechatwork_${type}_code`) || '{}',
    )
    return weComVerifyMsg?.code
  }

  const getAppId = () => {
    return appid
  }

  useImperativeHandle(onRef, () => {
    return {
      getCode,
      getAppId,
    }
  })
  return <div id={elementId} style={{ width: '50%', textAlign: 'center' }} />
}

export default WeQrCode
