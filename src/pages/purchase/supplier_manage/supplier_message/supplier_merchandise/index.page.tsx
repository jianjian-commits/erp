import React, { useLayoutEffect, useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import { observer } from 'mobx-react'
import { useTableListRef } from '@/common/hooks'
import { useGMLocation } from '@gm-common/router'

import store from './store/store'
const SupplierMerchandise = observer(() => {
  const { supplier_id } = useGMLocation<{
    supplier_id: string
  }>().query
  const tableRef = useTableListRef()
  useLayoutEffect(() => {
    store.setSupplierId(supplier_id)
  }, [])
  useEffect(() => {
    store.getFinanceCategoryTree()
    return store.clear
  }, [])
  const onExport = () => {
    return store.export()
  }
  return (
    <>
      <Filter onExport={onExport} />
      <List tableRef={tableRef} />
    </>
  )
})
export default SupplierMerchandise
