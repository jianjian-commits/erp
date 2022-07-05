import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import React, { ComponentType, FC, Fragment, ReactNode } from 'react'

interface PermissionProps {
  permission: Permission
  children: ReactNode
  /**
   * 外层节点
   *
   * 默认为 div，若不需要外层节点，则传入 null
   *
   * @default "div"
   */
  tag?: string | ComponentType | null
}

/**
 * 根据权限展示内容的组件
 *
 * 注意：
 * 由于最后是通过React.createElement创建的
 * 所以内容外面会多一层结构，可能导致原有结构失效
 * 如果是按钮的话，可以通过使用PermissionButton组件解决
 */
const PermissionJudge: FC<PermissionProps> = (props) => {
  const { permission, children, tag = 'div', ...rest } = props

  return globalStore.hasPermission(permission)
    ? React.createElement(tag === null ? Fragment : tag, rest, children)
    : null
}

export default PermissionJudge
