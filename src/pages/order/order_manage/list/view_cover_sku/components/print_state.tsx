import React, { FC } from 'react'
import { Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from '../store'

const printStateSelectData = [
  { value: 1, text: t('是') },
  { value: 2, text: t('否') },
]

const PrintState: FC<{ index: number }> = ({ index }) => {
  const order = store.list[index]
  function handleChange(v: number) {
    store.updateSku(index, 'is_print', v)
  }
  const printStateText =
    order.is_print === 1 ? t('是') : order.is_print === 2 ? t('否') : '-'
  if (order.editing) {
    return (
      <div>
        <Select
          value={order.is_print}
          style={{ minWidth: '80px' }}
          data={printStateSelectData}
          onChange={handleChange}
        />
      </div>
    )
  } else {
    return <div>{printStateText}</div>
  }
}

export default observer(PrintState)
