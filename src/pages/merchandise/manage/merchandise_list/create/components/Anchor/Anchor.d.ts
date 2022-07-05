import React, { ReactNode } from 'react'

export interface AnchorProps {
  animation?: boolean
  affix?: boolean // 固定模式
  bounds?: number // 锚点区域边界
  getContainer?: () => HTMLElement // 指定滚动的容器
  getCurrentAnchor?: () => string // 距离窗口顶部达到指定偏移量后触发
  offsetTop?: number // 距离窗口顶部达到指定偏移量后触发
  children?: ReactNode
  targetOffset?: number
  onChange?: (currentActiveLink: string) => void // 监听锚点链接改变
  onClick?: (e: Event, link: Record<string, any>) => void
  options?: Array<LinkProps>
}

export interface LinkProps {
  id: string
  title?: ReactNode | string
  [key: string]: any
}

export interface TAnchorContext {
  onActive: (id: string) => void
  activeId: string
}
