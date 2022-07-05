/*
 * @Description: 客户商品销售情况
 */
import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useTableListRef } from '@/common/hooks'

import { Filter, List } from './components'

import store from './store'

export default observer(() => {
  const tableRef = useTableListRef()
  useEffect(() => store.clear, [])
  const onExport = () => {
    const diyShowMap = tableRef.current?.getDiyShowMap()
    return store.exportList(diyShowMap)
  }
  return (
    <>
      <Filter onExport={onExport} />
      <List tableRef={tableRef} />
    </>
  )
})
