import { CSSProperties, ReactNode } from 'react'

export interface CalcBtnConfig {
  /**
   * 按钮内容
   */
  content: ReactNode
  /**
   * 该按钮在文本框内显示的值
   */
  textBoxValue: string
  /**
   * 按钮的值
   */
  value: string
  /**
   * 自定义样式
   */
  style?: CSSProperties
  /**
   * 是否为操作按钮
   */
  isAction?: boolean
  /**
   * 是否为变量
   */
  isVariable?: boolean
}
