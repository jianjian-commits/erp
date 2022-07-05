type ValueOf<T> = T[keyof T]

const ACTION = {
  BACKSPACE: 'Backspace',
  DONE: 'Enter',
  CLEAR: 'CLEAR',
} as const

export type ActionType = ValueOf<typeof ACTION>

export { ACTION }
