export interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}

type ReceiptAction =
  | 'saveCraft'
  | 'submit'
  | 'notApproved'
  | 'signSettle'
  | 'blaze'
  | 'delete'
  | 'print'
  | 'export'

export type { ReceiptAction }
