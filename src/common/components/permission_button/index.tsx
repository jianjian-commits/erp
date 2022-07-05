import globalStore from '@/stores/global'
import { Button, ButtonProps } from 'antd'
import { Permission } from 'gm_api/src/enterprise'
import React, { FC } from 'react'

/**
 * 根据权限展示按钮的属性
 * @extends ButtonProps
 */
interface PermissionButtonProps extends ButtonProps {
  /** 需要的权限 */
  permission: Permission
}

/**
 * 根据权限展示的按钮
 * 目前已经有一个类似的组件PermissionJudge，适用于一般情况
 * 这个组件仅限于按钮，因为发现很多权限都是按钮相关的,所以单独抽出来
 * 这样做的好处一是可以简化代码，二是不会破坏原来的结构，详情见PermissionJudge组件
 *
 * @example
 * // 使用PermissionJudge时
 * <PermissionJudge permission={PermissionA}>
 *   <Button type='primary'>测试按钮</Button>
 * </PermissionJudge>
 *
 * @example
 * // 使用PermissionButton时
 * <PermissionButton type='primary' permission={PermissionA}>测试按钮</PermissionButton>
 */
const PermissionButton: FC<PermissionButtonProps> = ({
  permission,
  ...props
}) => {
  return globalStore.hasPermission(permission) ? <Button {...props} /> : null
}

export default PermissionButton
