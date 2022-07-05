import '@/pages/production/style.less'
import { Popover } from 'antd'
// import { Popover } from '@gm-pc/react'
import React, { FC } from 'react'

/** 超出显示省略号组件的属性 */
interface Props {
  /** 文本内容 */
  text: string
  /** 文本最大长度，超出显示省略号 */
  maxLength?: number
}

/**
 * 超出显示省略号的组件函数
 * 当文本超出最大限定长度（默认12）时，后面的内容用省略号代替
 * 并增加提示弹窗，鼠标移入时显示全部内容
 */
const EllipsesText: FC<Props> = ({ text, maxLength = 12, children }) => {
  return (
    <span style={{ width: '100%' }}>
      {text.length && text.length > maxLength ? (
        <Popover
          content={
            <div style={{ width: '250px', wordWrap: 'break-word' }}>{text}</div>
          }
          trigger='hover'
        >
          <div className='b-24-text-overflow '>{children || text}</div>
        </Popover>
      ) : (
        <div>{children || text}</div>
      )}
    </span>
  )
}

export default EllipsesText
