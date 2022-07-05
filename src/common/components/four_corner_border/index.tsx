import React, { FC, CSSProperties } from 'react'

interface FourCornerBorderProps {
  style?: CSSProperties
}

// 投屏模式 各模块的边框组件
const FourCornerBorder: FC<FourCornerBorderProps> = ({ children, style }) => {
  return (
    <div className='b-border-content' style={{ ...style }}>
      <div className='b-angle-border b-left-top-border' />
      <div className='b-angle-border b-right-top-border' />
      <div className='b-angle-border b-left-bottom-border' />
      <div className='b-angle-border b-right-bottom-border' />
      <div>{children}</div>
    </div>
  )
}

export default FourCornerBorder
