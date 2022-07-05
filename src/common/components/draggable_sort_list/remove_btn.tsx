import React from 'react'
import { CloseCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'

interface RemoveBtnProps {
  className?: string
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLSpanElement>
}

const RemoveBtn: React.VFC<RemoveBtnProps> = (props) => {
  const { className, style, onClick } = props

  return (
    <CloseCircleOutlined
      className={classNames('tw-cursor-pointer', className)}
      style={{ color: '#ccc', ...style }}
      onClick={onClick}
    />
  )
}

export default RemoveBtn
