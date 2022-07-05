import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'

const ProductionPagination: FC = ({ children }) => {
  return (
    <Flex justifyEnd className='gm-box gm-padding-10 b-production-pagination '>
      {children}
    </Flex>
  )
}

export default ProductionPagination
