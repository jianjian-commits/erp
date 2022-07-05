import React, { FC } from 'react'
import { Flex, ProgressCircle } from '@gm-pc/react'

const Percentage: FC = () => {
  return (
    <Flex>
      <ProgressCircle percentage={20} />
    </Flex>
  )
}

export default Percentage
