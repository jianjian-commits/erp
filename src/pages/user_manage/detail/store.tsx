import { makeAutoObservable, action } from 'mobx'
import {
  GetGroupUser,
  CreateGroupUser,
  UpdateGroupUser,
  UpdateGroupUserRole,
  Role,
} from 'gm_api/src/enterprise'
import type {
  GroupUser,
  UpdateAccountParams,
  UpdateGroupUserRequest,
  UpdateGroupUserRoleRequest,
  CreateAccountParams,
  CreateGroupUserRequest,
} from 'gm_api/src/enterprise'
import _ from 'lodash'
import { Form } from './type'
import sha256 from 'crypto-js/sha256'

const initGroupUser: GroupUser = {
  group_user_id: '',
  name: '',
  type: 9,
  phone: '',
  email: '',
  status: '0',
  username: '',
  is_valid: false,
}

const initRoles: { [key: string]: Role } = {}
const initAccount: UpdateAccountParams = { password: '' }
const initForm: Form = {
  group_user_id: '',
  roles: [],
  is_valid: false,
  password: '',
  password2: '',
  phone: '',
  email: '',
  name: '',
  id_number: '',
  username: '',
  isAdmin: false,
  warehouse_ids: [],
}

class Store {
  groupUser: GroupUser = initGroupUser
  roles: { [key: string]: Role } = initRoles
  account: UpdateAccountParams = initAccount
  form: Form = initForm

  constructor() {
    makeAutoObservable(this)
  }

  turnRolesMapIntoOptionList = (roles: { [key: string]: Role }) => {
    const optionList: any[] = []
    Object.keys(roles).forEach((role_id) => {
      const option = {
        value: role_id,
        text: roles[role_id].name,
      }
      optionList.push(option)
    })
    return optionList
  }

  initForm(groupUser: GroupUser, roles: { [key: string]: Role }) {
    this.form = {
      ...this.form,
      group_user_id: groupUser.group_user_id || '',
      is_valid: groupUser.is_valid || false,
      phone: groupUser.phone || '',
      email: groupUser.email || '',
      name: groupUser.name || '',
      id_number: groupUser.attrs?.id_number || '',
      roles: this.turnRolesMapIntoOptionList(roles),
      username: this.groupUser.username || '',
      isAdmin: groupUser.type === 8,
      warehouse_ids: groupUser?.warehouse_ids?.length
        ? groupUser?.warehouse_ids
        : [],
    }
  }

  initStore() {
    this.groupUser = initGroupUser
    this.roles = initRoles
    this.account = initAccount
    this.form = initForm
  }

  sortGroupUserData() {
    const {
      is_valid,
      phone,
      email,
      name,
      id_number,
      username,
      isAdmin,
      warehouse_ids,
    } = this.form
    const group_user: GroupUser = {
      ...this.groupUser,
      username,
      is_valid,
      phone,
      email,
      name,
      type: isAdmin ? 8 : 9,
      attrs: {
        ...this.groupUser.attrs,
        id_number,
      },
      warehouse_ids,
    }
    return group_user
  }

  handleFormUpdate(key: string, value: any) {
    if (key === 'roles') {
      value = value || []
    } else if (key === 'is_valid' || key === 'isAdmin') {
      value = value || false
    } else {
      value = value || ''
    }
    _.set(this.form, key, value)
  }

  verifyForm() {
    const { password, password2, username, name } = this.form
    if (password !== password2) {
      return ['fail', '两次输入密码不一致！']
    }
    if (!username) {
      return ['fail', '请输入登录账号！']
    }
    if (!name) {
      return ['fail', '请输入姓名！']
    }
    return ['pass', '']
  }

  @action
  fetchGroupUser(group_user_id: string) {
    const req = {
      group_user_id,
      need_roles: true,
    }
    return GetGroupUser(req).then((json) => {
      this.groupUser = json.response.group_user
      this.roles = json.response.roles || {}
      return json.response
    })
  }

  updateGroupUser() {
    const group_user: GroupUser = this.sortGroupUserData()
    const { password } = this.form
    const params: UpdateGroupUserRequest = {
      group_user,
    }
    if (password) {
      const account: UpdateAccountParams = {
        password: sha256(password).toString(),
      }
      params.account = account
    }
    return UpdateGroupUser(params).then((json) => {
      return json.response
    })
  }

  updateGroupUserRole(group_user_id: string) {
    const { roles } = this.form
    const params: UpdateGroupUserRoleRequest = {
      group_user_id,
      role_ids: roles.map((e) => e.value),
    }
    return UpdateGroupUserRole(params).then((json) => {
      return json.response
    })
  }

  createGroupUser() {
    const {
      is_valid,
      phone,
      email,
      name,
      id_number,
      username,
      password,
      isAdmin,
    } = this.form
    const group_user: Omit<GroupUser, 'group_user_id'> = {
      username,
      is_valid,
      phone,
      email,
      name,
      type: isAdmin ? 8 : 9,
      attrs: {
        ...this.groupUser.attrs,
        id_number,
      },
      warehouse_ids: this.getWarehouseIds,
    }
    const account: CreateAccountParams = {
      username,
      password: sha256(password).toString(),
      phone,
      email,
    }
    const params: CreateGroupUserRequest = {
      group_user,
      account,
    }
    return CreateGroupUser(params).then((json) => {
      return json.response
    })
  }
}

export default new Store()
