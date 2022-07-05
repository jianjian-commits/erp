import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import SvgNoCompany from '@/svg/no_company.svg'
import './style.less'

const NoCompany: FC = () => {
  return (
    <Flex column>
      <SvgNoCompany className='no-company-logo' />
      <Flex justifyCenter className='no-company-word'>
        <div className='no-company-word'>{t('该微信未加入任何企业')}</div>
      </Flex>
      <Flex column alignCenter className='no-company-tips'>
        <div>{t('请打开手机微信')}</div>
        <div>{t('使用【观麦轻巧版】小程序进行认证')}</div>
      </Flex>
    </Flex>
  )
}

export default NoCompany
