import React, { FC, useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Tip, Flex } from '@gm-pc/react'
import { RECEIPT_STATUS, RECEIPT_TYPE } from '@/pages/sales_invoicing/enum'
import { TableXUtil } from '@gm-pc/table-x'
import { StockSheetInfo, StatusType } from '../../interface'

const { OperationDelete, OperationCellRowEdit } = TableXUtil

interface Props {
  index: number
  data: StockSheetInfo
  updateSheetInfo: <T extends keyof StockSheetInfo>(
    index: number,
    key: T,
    value: StockSheetInfo[T],
  ) => any
  doRequest: () => any
  updateSheet: (index: number, status?: StatusType) => any
}

const Operation: FC<Props> = (props) => {
  const { index, data, updateSheetInfo, updateSheet, doRequest } = props
  const { old_sheet_status, edit, quantity, sheet_type } = data
  const text = sheet_type === RECEIPT_TYPE.turnoverLoan ? '借出' : '归还'

  const handleClose = () => {
    doRequest()
  }
  const handleSave = () => {
    if (!quantity) {
      Tip.danger('数量必须大于0')
      return
    }
    updateSheet(index).then(() => {
      Tip.success('更新成功')
      handleClose()
      return null
    })
  }

  const handleDelete = () => {
    updateSheet(index, 'deleted').then(() => {
      Tip.success('删除成功')
      handleClose()
      return null
    })
  }

  return (
    <>
      {old_sheet_status === RECEIPT_STATUS.toBeSubmitted ? (
        <OperationCellRowEdit
          isEditing={edit!}
          onClick={() => {
            updateSheetInfo(index, 'edit', true)
          }}
          onCancel={() => {
            handleClose()
          }}
          onSave={() => {
            handleSave()
          }}
        >
          <OperationDelete
            title='警告'
            onClick={() => {
              handleDelete()
            }}
          >
            {t(`${text}记录删除之后无法恢复，是否确认删除？`)}
          </OperationDelete>
        </OperationCellRowEdit>
      ) : (
        <Flex>-</Flex>
      )}
    </>
  )
}

export default observer(Operation)
