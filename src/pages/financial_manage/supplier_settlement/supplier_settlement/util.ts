import { SettleSheet_SheetStatus } from 'gm_api/src/finance'
import { ReceiptAction } from './interface'

export const receiptTypeTag = (
  status: any,
): 'error' | 'finish' | 'processing' | undefined => {
  switch (status) {
    case SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED:
    case SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED:
    case SettleSheet_SheetStatus.SHEET_STATUS_PART_PAID:
    case SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID:
      return 'processing'
    case SettleSheet_SheetStatus.SHEET_STATUS_PAID:
      return 'finish'
    case '0':
    case SettleSheet_SheetStatus.SHEET_STATUS_DELETED:
      return 'error'
    default:
      return undefined
  }
}

export const getSettleActionableList = (
  status: SettleSheet_SheetStatus,
): ReceiptAction[] => {
  let actionable: ReceiptAction[] = []
  switch (status) {
    case SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED:
      actionable = ['saveCraft', 'delete', 'submit', 'print', 'export']
      break
    case SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID:
      actionable = ['notApproved', 'signSettle', 'delete', 'print', 'export']
      break
    case SettleSheet_SheetStatus.SHEET_STATUS_PART_PAID:
      actionable = ['signSettle', 'print', 'export', 'blaze']
      break
    case SettleSheet_SheetStatus.SHEET_STATUS_PAID:
      actionable = ['blaze', 'print', 'export']
      break
    case SettleSheet_SheetStatus.SHEET_STATUS_DELETED:
      actionable = ['print', 'export']
      break
    case SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED:
      actionable = ['saveCraft', 'submit', 'delete', 'print', 'export']
      break
  }

  return actionable
}
