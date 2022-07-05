import React, { FC } from 'react'
import classNames from 'classnames'
import { Flex } from '@gm-pc/react'

interface OverViewProps {
  name: string
  value: string
  className?: string
  color?: string
}

const OverView: FC<OverViewProps> = (props) => {
  const { name, value, className, color } = props
  return (
    <Flex
      flex
      justifyCenter
      alignCenter
      className={classNames('gm-padding-15', className)}
    >
      <Flex column justifyCenter>
        <Flex alignCenter>
          <Flex className='gm-text-14'>{name}</Flex>
        </Flex>
        <Flex
          className='gm-text-bold gm-text-16 gm-margin-top-5'
          style={{ color: color || 'initial' }}
          alignCenter
          justifyCenter
        >
          <span className='gm-number-family b-something-content'>{value}</span>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default OverView
