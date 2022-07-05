import { Student } from 'gm_api/src/eshop'

interface StudentRef {
  validateFieldFn: () => Promise<Record<string, any>>
}

interface StudentList extends Student {
  key: string
}

interface StudentProps {
  is_look: boolean
}

interface BaseInfoProps {
  is_look: boolean
  class_id: string
}

export type { StudentRef, StudentList, StudentProps, BaseInfoProps }
