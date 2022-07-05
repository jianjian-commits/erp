import type { GroupUser } from 'gm_api/src/enterprise'

interface User extends GroupUser {
  isEditing?: boolean
}

export type { User }
