import { Permission } from 'gm_api/src/enterprise'

export interface Form {
  role_id: string
  name: string
  description: string
}

export interface PermissionOption {
  text: string
  value: string
  checked: boolean
  indeterminate: boolean
  children: {
    text: string
    value: string
    checked: boolean
    indeterminate: boolean
    children: { text: string; value: Permission; checked: boolean }[]
  }[]
}

export interface Option3Type {
  text: string
  value: Permission
  checked: boolean
}
export interface Option2Type {
  text: string
  value: string
  checked: boolean
  indeterminate: boolean
  children: Option3Type[]
}

export interface Option1Type {
  text: string
  value: string
  checked: boolean
  indeterminate: boolean
  children: Option2Type[]
}
