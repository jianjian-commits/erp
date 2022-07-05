import React, { FC } from 'react'
import { Uploader, Flex, Popover } from '@gm-pc/react'
import { t } from 'gm-i18n'
import defaultLogo from '@/img/station.png'
import { LogoProps } from './interface'

const Logo: FC<LogoProps> = ({ logo, disabled, onUpload }) => {
  return (
    <Flex column>
      <Popover
        type='hover'
        showArrow
        popup={<div className='gm-padding-5'>点击更换</div>}
      >
        <Uploader
          accept='image/*'
          onUpload={onUpload}
          disabled={disabled}
          style={{ height: '50px', width: '50px', border: '1px solid #D4D8D8' }}
        >
          <img
            style={{ height: '100%', width: '100%' }}
            src={logo || defaultLogo}
          />
        </Uploader>
      </Popover>
      <span className='gm-text-desc gm-margin-top-5'>
        {t('图片大小请不要超过50kb，默认尺寸64x64，支持jpg/png格式')}
      </span>
    </Flex>
  )
}

export default Logo
