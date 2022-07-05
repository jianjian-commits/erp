import React, { FC, useCallback, useMemo } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from '../../store'
import type { CellProps } from '../interface'

const { OperationCell, EditOperation } = TableXUtil

const Operation: FC<CellProps> = ({ index, ingredientsCount }) => {
  const len = store.list.filter((item) => !item.parentId).length
  const handleAddRow = useCallback(() => {
    store.addRow(index + ingredientsCount)
  }, [index, ingredientsCount])

  const handleDeleteRow = useCallback(() => {
    // 删除原料
    store.deleteRow(index, ingredientsCount || 0)
  }, [index, ingredientsCount])

  const onDeleteRow = useMemo(
    () => (len > 1 ? handleDeleteRow : undefined),
    [handleDeleteRow, len],
  )

  return (
    <OperationCell>
      <EditOperation onAddRow={handleAddRow} onDeleteRow={onDeleteRow} />
    </OperationCell>
  )
}

export default observer(Operation)
