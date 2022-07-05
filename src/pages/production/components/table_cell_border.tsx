import React, { FC, ReactNode } from 'react'
import classNames from 'classnames'
import { Flex } from '@gm-pc/react'

import { cellHeight } from '@/pages/production/enum'

interface CellBorderProps {
  children: ReactNode
  border: boolean
  height?: string // 默认提供45px
}

const CellBorder: FC<CellBorderProps> = ({ children, border, height }) => {
  return (
    <Flex
      alignCenter
      className={classNames('gm-padding-0', {
        'gm-border-bottom': border,
      })}
      style={{ height: height || cellHeight, lineHeight: 1.2 }}
    >
      {children}
    </Flex>
  )
}

export default CellBorder
