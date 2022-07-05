import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { Spin } from 'antd'

import type { WechatUserInfo } from '../interface'

type OptionWechatProps = Pick<
  WechatUserInfo,
  'wechat_avatar' | 'wechat_nickname'
>

const OptionWechat: FC<
  | OptionWechatProps & {
      unbindWechatToAccount: () => void
    }
> = ({ wechat_avatar, wechat_nickname, unbindWechatToAccount }) => {
  return (
    <Flex column alignCenter className='b-option-wechat'>
      {wechat_nickname ? (
        <>
          <div className=' b-option-wecaht-status'>{t('已绑定的微信')}</div>
          <img src={wechat_avatar} className='b-option-wecaht-avatar' />
          <span className='b-option-wecaht-nickname '>{wechat_nickname}</span>
          <div
            className='b-option-wecaht-click'
            onClick={() => {
              unbindWechatToAccount()
            }}
          >
            {t('解绑微信')}
          </div>
        </>
      ) : (
        <Spin className='tw-mt-32' />
      )}
    </Flex>
  )
}

export default OptionWechat
