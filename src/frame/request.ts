import React from 'react'
import {
  configHeaders,
  configError,
  configProgress,
  initAuth,
  Response,
  instance,
} from '@gm-common/x-request'
import { Tip, NProgress } from '@gm-pc/react'
import { AxiosResponse } from 'axios'
import { Token, Status_Code as Oauth_Status_Code } from 'gm_api/src/oauth'
import { Modal } from 'antd'
import { logout } from '@/common/util'
import _ from 'lodash'
import MapStatusCode from 'gm_api/src/map_status_code'
import { Status_Code } from 'gm_api/src/common'
import { t } from 'gm-i18n'
import {
  catchUnitsFromRelationInfo,
  catchUnitsFromSkuMap,
} from '@/stores/global'

initAuth(Token.url, 'access_token')

const TokenExpiredCodeMsg: {
  [key: string]: string
} = {
  [String(Oauth_Status_Code.CODE_TOKEN_INVALID_SESSION_EXPIRED)]: t(
    '系统长时间无操作，为确保数据安全已自动退出，请您重新登录。',
  ),
  [String(Oauth_Status_Code.CODE_TOKEN_INVALID_DUPLICATE_LOGIN)]: t(
    '您的账号在其他地方登录，为确保账号安全，建议您修改密码后重新登录。',
  ),
}

function isUnauthorized(code: number) {
  const unauthorized =
    code === Status_Code.UNAUTHENTICATED &&
    !['#/demo', '#/share'].some((ignorePath) =>
      location.hash.startsWith(ignorePath),
    )
  return unauthorized
}

configError(
  _.debounce((message, res?: AxiosResponse<Response<any>>) => {
    const code = res?.data?.code || 0

    // 按领导的要求，请求如果带auto_request参数，走特殊的报错处理逻辑
    const reqData = JSON.parse(res?.config.data)
    if (reqData?.auto_request) {
      if (isUnauthorized(code)) {
        logout()
      }
      return
    }

    if (isUnauthorized(code)) {
      const desc = _.get(res, 'data.message.description', '')
      const modalMsg = TokenExpiredCodeMsg[desc]

      if (modalMsg) {
        const node = React.createElement('div', null, modalMsg)
        Modal.warning({
          title: t('提示'),
          autoFocusButton: null,
          content: node,
          onOk() {
            logout()
          },
          okText: t('好的'),
        })
      } else {
        Tip.danger({
          children: t('会话超时，请重新登录'),
          time: 3000,
        })
        logout()
      }
    } else {
      /**
       * 首先需要判断有没有额外携带内容，就是有“｜”可以分割后且长度为2的，没有携带就直接翻译展示，
       * 如果携带了就解析，然后再判断code做不同方式的输出：0～16就把翻译内容输出到控制台，其它的弹框提示
       */
      const customizeReason =
        res?.data.message.detail?.reason ||
        `${MapStatusCode[code] || 'unknown'} (code:${code})`

      if (code >= Status_Code.OK && code <= Status_Code.UNAUTHENTICATED) {
        // gRPC 官方预定义的状态码，reason输出到控制台
        Tip.danger({
          children: `服务异常 (code:${code})`,
          time: 5000,
        })
        throw new Error(customizeReason)
      } else {
        Tip.danger({
          children: customizeReason,
          time: 5000,
        })
      }
    }
  }, 500),
)

configProgress(NProgress.start, NProgress.done)

configHeaders('erp')

instance.interceptors.response.use((res) => {
  if (
    [
      '/ceres/merchandise/MerchandiseService/ListBasicPriceV2',
      '/ceres/merchandise/MerchandiseService/ListBestSaleSku',
      '/ceres/merchandise/MerchandiseService/ListBasicPriceByCustomerID',
    ].includes(res.config.url || '')
  ) {
    catchUnitsFromSkuMap(res.data)
  }
  if (
    [
      '/ceres/order/OrderService/ListOrderDetail',
      '/ceres/order/OrderService/GetOrder',
    ].includes(res.config.url || '')
  ) {
    catchUnitsFromRelationInfo(res.data)
  }
  return res
})
