import React, { ReactNode, FC } from 'react'
import { Flex } from '@gm-pc/react'
interface ContainerProps {
  children: ReactNode
  title: string
}

const Container: FC<ContainerProps> = ({ children, title }) => (
  <div style={{ overflowY: 'auto', height: '100%', maxHeight: '100%' }}>
    <div className='gm-back-bg gm-padding-tb-10 gm-padding-lr-20 gm-text-14'>
      <Flex>
        <div className='gm-form-panel-header-tag gm-inline-block' />
        <div>
          <strong className='gm-padding-left-5'>{title}</strong>
        </div>
      </Flex>
    </div>
    {children}
  </div>
)

export default Container
