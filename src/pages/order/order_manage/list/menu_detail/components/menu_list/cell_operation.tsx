import React, { FC, useCallback, useMemo } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from '../../store'
import type { CellProps } from '../../../../components/detail/list/interface'
import globalStore from '@/stores/global'

const { OperationCell, EditOperation } = TableXUtil

const Operation: FC<CellProps> = ({ index }) => {
  const len = store.menuList.length
  const handleAddRow = useCallback(() => {
    store.addMenuListRow(index)
  }, [index])

  const handleDeleteRow = useCallback(() => {
    store.deleteMenuListRow(index, globalStore.orderSetting)
  }, [index])

  const onDeleteRow = useMemo(
    () => (len > 1 ? handleDeleteRow : undefined),
    [handleDeleteRow, len],
  )

  return (
    <OperationCell>
      <EditOperation
        onAddRow={handleAddRow}
        onDeleteRow={len === 1 ? undefined : onDeleteRow}
      />
    </OperationCell>
  )
}

export default observer(Operation)
