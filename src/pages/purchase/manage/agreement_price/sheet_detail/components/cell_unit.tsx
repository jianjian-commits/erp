import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { KCSelect } from '@gm-pc/keyboard'
import store from '../store'

interface UnitProps {
  index: number
}

const CellUnit: FC<UnitProps> = ({ index }) => {
  const selectData = store.list[index]?.ssuSelectData
  const { rate, measUnit, pkgUnit, unitId, skuId, ssuId } = store.list[index]
  const [selected, setSelected] = useState('')

  useEffect(() => {
    let selectedValue = ''
    if (selectData?.length && rate) {
      selectedValue = `${rate}/${measUnit}/${pkgUnit}/${unitId}/${ssuId}`
    } else if (selectData?.length) {
      selectedValue = selectData[0].value
    }
    setSelected(selectedValue)
    if (selectedValue) {
      const [rate, measUnit, pkgUnit, unitId, ssuId] = selectedValue.split('/')
      store.updateList(index, { rate, measUnit, pkgUnit, unitId, ssuId })
    }
  }, [selectData, skuId])

  function handleChange(value: any) {
    const [rate, measUnit, pkgUnit, unitId, ssuId] = value.split('/')
    store.updateList(index, {
      rate,
      measUnit,
      pkgUnit,
      unitId,
      ssuId,
      price: '',
      pkgPrice: '',
    })
    setSelected(value)
  }
  return <KCSelect data={selectData} value={selected} onChange={handleChange} />
}

export default observer(CellUnit)
