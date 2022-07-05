import React, { FC, HTMLAttributes } from 'react'
import { Flex, Tooltip } from '@gm-pc/react'
import classNames from 'classnames'
import '../style.less'

interface PanelHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  underline?: boolean
  info?: string
}

const PanelHeader: FC<PanelHeaderProps> = ({
  title,
  className,
  underline,
  info, // tip内容
  ...rest
}) => {
  return (
    <Flex {...rest} className={classNames('b-panel-header', className)}>
      <div className='b-panel-header-symbol' />
      <div
        className={classNames('b-panel-header-title', {
          'b-panel-header-underline': underline,
        })}
      >
        {title}
        {info && (
          <Tooltip
            className='gm-margin-left-10'
            popup={
              <div className='gm-padding-5' style={{ minWidth: '170px' }}>
                {info}
              </div>
            }
          />
        )}
      </div>
    </Flex>
  )
}

export default PanelHeader
