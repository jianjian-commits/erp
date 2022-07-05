import React, { ReactNode } from 'react'
import { Popover } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

interface TipMessageProps {
  content: ReactNode
  title?: ReactNode
}

const style = { color: '#8C8C8C' }

const TipMessage = (props: TipMessageProps) => {
  const { content, title } = props
  return (
    <Popover placement='bottom' content={content} title={title}>
      <QuestionCircleOutlined style={style} />
    </Popover>
  )
}

export default TipMessage
