import React, { FC, useEffect, useState } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import { KCSelect } from '@gm-pc/keyboard'
import store from '../store'

interface UnitProps {
  index: number
  // selectData: any
  // selected?: string
}

const CellUnit: FC<UnitProps> = ({ index }) => {
  const selectData = store.list[index]?.ssuSelectData
  const [selected, setSelected] = useState('')

  useEffect(() => {
    const selectedValue = selectData.length ? selectData[0].value : ''
    setSelected(selectedValue)
    if (selectedValue) {
      const [rate, measUnit, pkgUnit, unitId, ssuId] = selectedValue.split('/')
      store.updateList(index, { rate, measUnit, pkgUnit, unitId, ssuId })
    }
  }, [selectData])

  function handleChange(value: any) {
    const [rate, measUnit, pkgUnit, unitId, ssuId] = value.split('/')
    store.updateList(index, { rate, measUnit, pkgUnit, unitId, ssuId })
    setSelected(value)
  }
  return <KCSelect data={selectData} value={selected} onChange={handleChange} />
}

export default observer(CellUnit)
