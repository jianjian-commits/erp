import React, { FC } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from '../store'
const { OperationCell, EditOperation } = TableXUtil
interface OperationProps {
  index: number
  // isEditing: boolean
}

const CellOperation: FC<OperationProps> = ({ index }) => {
  return (
    <OperationCell>
      <EditOperation
        onAddRow={() => store.addRow(index)}
        onDeleteRow={
          store.list.length > 1
            ? () => {
                store.deleteRow(index)
              }
            : undefined
        }
      />
    </OperationCell>
  )
}

export default observer(CellOperation)
