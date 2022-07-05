import { Permission } from 'gm_api/src/enterprise'

import { PermissionOption, Option1Type, Option2Type, Option3Type } from './type'
import { AuthMap } from 'gm_auth'

function generateAuthObject(permissions: Permission[]): any {
  const authObject: any = {}
  permissions.forEach((permission: Permission) => {
    const key = String(permission)
    const msg = AuthMap[key]
    if (msg) {
      if (!authObject[msg.one]) {
        authObject[msg.one] = {}
      }
      if (!authObject[msg.one][msg.two]) {
        authObject[msg.one][msg.two] = {}
      }
      authObject[msg.one][msg.two][msg.name] = msg.auth
    }
  })
  return authObject
}

function generateOptionList(authObject: any): PermissionOption[] {
  const optionList: PermissionOption[] = []
  for (const level1 in authObject) {
    const option1: Option1Type = {
      text: level1,
      checked: false,
      value: level1,
      indeterminate: false,
      children: [],
    }
    const level2Object = authObject[level1]
    for (const level2 in level2Object) {
      const option2: Option2Type = {
        text: level2,
        checked: false,
        value: level1 + level2,
        indeterminate: false,
        children: [],
      }
      const level3Object = authObject[level1][level2]
      for (const level3 in level3Object) {
        const option3: Option3Type = {
          text: level3,
          value: level3Object[level3],
          checked: false,
        }
        option2.children.push(option3)
      }
      option1.children.push(option2)
    }
    optionList.push(option1)
  }
  return optionList
}

export function initPermissionOptionList(
  group_id: string,
  permissions: Permission[],
): PermissionOption[] {
  const authObject = generateAuthObject(permissions)
  const permissionOptionList = generateOptionList(authObject)
  // SessionStorage.set(`permission_option_list_${group_id}`, permissionOptionList)
  return permissionOptionList
}
