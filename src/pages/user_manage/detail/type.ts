export interface RolesOptionItem {
  value: string
  text: string
}

export interface Form {
  group_user_id: string
  roles: RolesOptionItem[]
  is_valid: boolean
  password: string
  password2: string
  name: string
  phone: string
  email: string
  id_number: string
  username: string
  isAdmin: boolean
  warehouse_ids: string[]
}
