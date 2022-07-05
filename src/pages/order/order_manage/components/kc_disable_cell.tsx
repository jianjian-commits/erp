import React, { ReactNode, FC } from 'react'
import { KC as Kc } from '@gm-pc/keyboard'

/**
 * TODO: 这个组件不是很有必要存在，我把它从common拿下来了，后续看怎么优化 @涌弟 @俊旭
 */
const KCDisabledCell: FC<{ children: ReactNode }> = (props) => {
  const handleFocus = () => {}
  const handleScroll = () => {}

  return (
    <Kc onFocus={handleFocus} onScroll={handleScroll} disabled>
      {props.children}
    </Kc>
  )
}

export default KCDisabledCell
