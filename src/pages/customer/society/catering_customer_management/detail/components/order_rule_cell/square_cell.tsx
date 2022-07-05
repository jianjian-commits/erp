import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'

interface SquareCellProps {
  timeItem: string
  textItem: string
}

const SquareCell: FC<SquareCellProps> = ({ timeItem, textItem }) => {
  return (
    <Flex
      column
      justifyCenter
      alignCenter
      className='gm-bg-primary gm-text-white gm-margin-left-10'
      width='68px'
      height='76px'
      style={{
        borderRadius: 6,
      }}
    >
      <span className='gm-text-16'>{timeItem || '-'}</span>
      <span
        className=''
        style={{
          fontFamily: 'PingFangSC-Semibold, PingFangSC',
          fontSize: 30,
        }}
      >
        {textItem || '-'}
      </span>
    </Flex>
  )
}

export default SquareCell
