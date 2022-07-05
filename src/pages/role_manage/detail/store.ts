import { makeAutoObservable, action, toJS } from 'mobx'
import {
  GetRole,
  CreateRole,
  UpdateRolePermission,
  Permission,
  Role_Type,
  GetGroupPermission,
} from 'gm_api/src/enterprise'
import type { Role, UpdateRolePermissionRequest } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { Form, PermissionOption } from './type'

const initForm: Form = {
  role_id: '',
  name: '',
  description: '',
}

class Store {
  form: Form = initForm
  levelValue: Permission[] = []
  permissionOptionList: any = []

  constructor() {
    makeAutoObservable(this)
  }

  @action
  fetchGroupPermission(group_id: string) {
    return GetGroupPermission({ group_id }).then((res) => {
      return res.response
    })
  }

  setOptionList(optionList: PermissionOption[]) {
    this.permissionOptionList = optionList
  }

  initStore() {
    this.form = initForm
    this.levelValue = []
  }

  initForm(role: Role) {
    this.form = {
      name: role.name || '',
      description: role.description || '',
      role_id: role.role_id || '',
    }
  }

  initLevelValue(permissions: Permission[]) {
    // this.levelValue = permissions
    this.levelValue = [...new Set(permissions)]
    this.permissionOptionList.forEach((level1: any) => {
      let level2AllChecked = true
      level1.children.forEach((level2: any) => {
        let level3AllChecked = true
        level2.children.forEach((level3: any) => {
          const index = this.levelValue.indexOf(level3.value)
          if (index !== -1) {
            level3.checked = true
          }
          level3AllChecked = level3AllChecked && level3.checked
        })
        level2.checked = level3AllChecked
        level2AllChecked = level2AllChecked && level2.checked
      })
      level1.checked = level2AllChecked
    })
  }

  handleFormUpdate(key: string, value: any) {
    value = value || ''
    _.set(this.form, key, value)
  }

  verifyForm() {
    const { name } = this.form
    if (!name) {
      return ['fail', '请输入角色名称！']
    }
    return ['passed', '']
  }

  checkChildren(
    checked: boolean,
    children: { checked: boolean; indeterminate?: boolean }[],
  ) {
    children.forEach((child) => {
      child.checked = checked
      // child.indeterminate = false
    })
  }

  checkParent(
    parentLevel: {
      children: { checked: boolean }[]
      checked: boolean
      indeterminate: boolean
    },
    childChecked: boolean,
  ) {
    let sameChecked = true
    const children = parentLevel.children
    for (let i = 0; i < children.length; i++) {
      if (children[i].checked !== childChecked) {
        // parentLevel.indeterminate = true
        parentLevel.checked = false
        sameChecked = false
        break
      }
    }
    if (sameChecked) {
      parentLevel.checked = childChecked
      // parentLevel.indeterminate = false
    }
  }

  handleLevel1Change(level1: {
    indeterminate: boolean
    checked: boolean
    children: { value: string; checked: boolean; children: [] }[]
  }) {
    // level1.indeterminate = false
    level1.checked = !level1.checked

    // 改变二级、三级勾选状态
    this.checkChildren(level1.checked, level1.children)
    level1.children.forEach((level2) => {
      this.checkChildren(level1.checked, level2.children)
    })

    // 删除或添加三级值
    level1.children.forEach((level2: { value: string; children: [] }) => {
      level2.children.forEach((level3: { value: Permission }) => {
        const index = this.levelValue.indexOf(level3.value)
        if (level1.checked && index === -1) {
          this.levelValue.push(level3.value)
        } else if (!level1.checked && index !== -1) {
          this.levelValue.splice(index, 1)
        }
      })
    })
  }

  handleLevel2Change(
    level1: {
      children: { checked: boolean }[]
      checked: boolean
      indeterminate: boolean
    },
    level2: { indeterminate: boolean; checked: boolean; children: [] },
  ) {
    level2.checked = !level2.checked
    // level2.indeterminate = false

    // 改变一级、三级勾选状态
    this.checkParent(level1, level2.checked)
    this.checkChildren(level2.checked, level2.children)

    // 删除或添加三级值
    level2.children.forEach((level3: { value: Permission }) => {
      const index = this.levelValue.indexOf(level3.value)
      if (level2.checked && index === -1) {
        this.levelValue.push(level3.value)
      } else if (!level2.checked && index !== -1) {
        this.levelValue.splice(index, 1)
      }
    })
  }

  @action
  handleLevel3Change(
    level1: {
      children: { checked: boolean }[]
      checked: boolean
      indeterminate: boolean
    },
    level2: { checked: boolean; children: []; indeterminate: boolean },
    level3: { checked: boolean; value: Permission },
  ) {
    level3.checked = !level3.checked

    // 改变一级、二级勾选状态
    this.checkParent(level2, level3.checked)
    this.checkParent(level1, level3.checked)

    // 添加或删除三级值
    const index = this.levelValue.indexOf(level3.value)
    if (level3.checked && index === -1) {
      this.levelValue.push(level3.value)
    } else if (!level3.checked && index !== -1) {
      this.levelValue.splice(index, 1)
    }
  }

  fetchRole(role_id: string) {
    const req = {
      role_id,
      need_permissions: true,
    }
    return GetRole(req).then((json) => {
      // this.roles = json.response.roles || {}
      return json.response
    })
  }

  createRole() {
    const { name, description } = this.form
    const role: Omit<Role, 'role_id'> = {
      name,
      description,
      type: Role_Type.NORMAL,
    }
    return CreateRole({ role }).then((json) => {
      return json.response
    })
  }

  updateRolePermission(role_id: string) {
    const req: UpdateRolePermissionRequest = {
      role_id,
      permissions: this.levelValue,
    }
    return UpdateRolePermission(req).then((json) => {
      return json.response
    })
  }
}

export default new Store()
