import React, { FC } from 'react'
import { t } from 'gm-i18n'
import store from '../store'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
const { OperationDelete, OperationCell } = TableXUtil

const Operation: FC<any> = observer(({ index }) => {
  function handleDelete() {
    store.deleteOrderItem(index)
  }

  return (
    <OperationCell>
      <OperationDelete title={t('警告')} onClick={handleDelete}>
        {t('确认删除商品?')}
      </OperationDelete>
    </OperationCell>
  )
})

export default Operation
