import React, { FC, ReactNode } from 'react'
import { Popover, Tooltip } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
interface HintPorps {
  type?: string
  content?: ReactNode
}
// 根据你的type 来选择不同的提示
const HintComponent: FC<HintPorps> = ({ type, content }) => {
  if (!content) {
    return <ExclamationCircleOutlined className='hint-color' />
  }
  // 两行
  if (type === '1') {
    return (
      <Tooltip title={content}>
        <ExclamationCircleOutlined className='hint-color' />
      </Tooltip>
    )
  } else {
    return null
  }
}
export default HintComponent
