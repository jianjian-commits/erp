import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import classnames from 'classnames'
import { PanelOptions } from '../interface'

const Panel: FC<PanelOptions> = ({
  children,
  title,
  right,
  className,
  height,
  ...rest
}) => {
  return (
    <Flex
      column
      height={height}
      className={classnames('b-home-panel', className)}
      {...rest}
    >
      <Flex
        justifyBetween
        alignCenter
        height='30px'
        className='b-home-panel-header gm-padding-bottom-5 gm-margin-bottom-10'
      >
        <div className='gm-text-14'>
          <span className='b-home-panel-header-icon' />
          {title}
        </div>
        <Flex height='35px' alignCenter>
          {right}
        </Flex>
      </Flex>
      {children || (
        <Flex flex justifyCenter alignCenter column className='gm-text-desc'>
          {t('没有更多数据了')}
        </Flex>
      )}
    </Flex>
  )
}

export default Panel
