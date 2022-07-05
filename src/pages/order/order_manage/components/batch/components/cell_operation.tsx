import React, { FC } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from '../store'

const { OperationCell, EditOperation } = TableXUtil
interface OperationProps {
  orderIndex: number
  ssuIndex: number
  /** 组合商品的原料数量 */
  ingredientsCount?: number
}
const Operation: FC<OperationProps> = (props) => {
  const { orderIndex, ssuIndex, ingredientsCount } = props
  return (
    <OperationCell>
      <EditOperation
        onAddRow={() => {
          store.addSsuRow(
            orderIndex,
            undefined,
            ssuIndex + (ingredientsCount || 0),
          )
        }}
        onDeleteRow={
          store.list[orderIndex].list.filter((item) => !item.parentId).length >
          1
            ? () => {
                store.deleteSsuRow(orderIndex, ssuIndex)
              }
            : undefined
        }
      />
    </OperationCell>
  )
}

export default observer(Operation)
