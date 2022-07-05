import React, { ReactNode, FC } from 'react'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'

interface TipBoxProps {
  tip: ReactNode
  others: ReactNode
  className?: string
}
const TipBox: FC<TipBoxProps> = ({ tip, others, className }) => {
  return (
    <Flex
      alignCenter
      className={classNames('gm-padding-10 gm-border-top', className)}
    >
      <Flex>{tip}</Flex>
      {others}
    </Flex>
  )
}

export default TipBox
