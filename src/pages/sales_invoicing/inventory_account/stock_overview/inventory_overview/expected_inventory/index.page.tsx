import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'

import itStore from '../stores/inventory_store'
import Filter from './filter'
import List from './list'

export default () => {
  const { sku_id, sku_unit_id, type } = useGMLocation<{
    sku_id: string
    sku_unit_id: string
    type: number
  }>().query

  const getSkuInfo = () => {
    itStore.handleChangeFilter('sku_id', sku_id)
    if (sku_unit_id) {
      itStore.handleChangeFilter('sku_unit_id', sku_unit_id)
      itStore.handleChangeUnitID(sku_unit_id)
    }
    if (type) {
      itStore.handleChangeFilter('pending_type', parseInt(type))
    }
    itStore.getSkuList()
  }

  const { pagination, run } = usePagination<any>(
    itStore.getSkuUnitStock,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'expectedInventoryList',
    },
  )

  useEffect(() => {
    getSkuInfo()
    run()
    return itStore.clean
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination}/>
    </>
  )
}
