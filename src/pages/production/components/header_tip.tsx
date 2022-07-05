import React, { FC, CSSProperties, ReactNode } from 'react'
import { Tooltip, Flex } from '@gm-pc/react'

interface HeaderTipProps {
  header: string
  info?: string | ReactNode
  right?: boolean
  tipStyle?: CSSProperties
  desc?: React.ReactNode
}

const HeaderTip: FC<HeaderTipProps> = ({
  header,
  desc,
  info,
  right,
  tipStyle,
}) => {
  return (
    <Flex alignCenter>
      <Flex column alignCenter>
        <div>{header}</div>
        {desc && <div>{desc}</div>}
      </Flex>
      {info && (
        <Tooltip
          popup={
            <div
              className='gm-padding-5'
              style={tipStyle || { minWidth: '170px' }}
            >
              {info}
            </div>
          }
          right={right}
          style={{ marginLeft: '3px' }}
        />
      )}
    </Flex>
  )
}

export default HeaderTip
