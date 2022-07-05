import React, { FC } from 'react'
import { MoreSelect } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from '../../store'
import type { ListOptions } from '../../interface'

interface Selected {
  text: string
  value: string
}
const DriverCell: FC<{ order?: ListOptions; index: number }> = ({ index }) => {
  const order = store.list[index]
  const { driverList } = store

  const handleChange = (selected: Selected) => {
    store.updateListColumn(index, 'driver_id', selected?.value!)
  }

  const selected_driver = _.find(
    driverList,
    (driver) => driver?.value! === order?.driver_id!,
  )

  if (order.isEditing) {
    return (
      <div>
        <MoreSelect
          renderListFilterType='pinyin'
          placeholder={t('请选择司机')}
          data={driverList}
          selected={selected_driver}
          onSelect={(selected: Selected) => {
            handleChange(selected)
          }}
        />
      </div>
    )
  } else {
    return <div>{selected_driver?.text! || t('-')}</div>
  }
}

export default observer(DriverCell)
