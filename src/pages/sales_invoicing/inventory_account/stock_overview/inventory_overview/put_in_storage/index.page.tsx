import React from 'react'
import { observer } from 'mobx-react'
import { usePagination } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'
import { useMount } from 'react-use'
import storageStore from '../stores/storage_store'
import Filter from './filter'
import List from './list'
import store from './../stores/storage_store'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

export default observer(() => {
  const { sku_id, sku_unit_id } = useGMLocation<{
    sku_id: string
    sku_unit_id: string
  }>().query

  const { pagination, run } = usePagination<any>(storageStore.getListBatch, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'putInStorageList',
  })
  const {
    filter: { warehouse_id },
  } = store

  const getSkuInfo = () => {
    storageStore.handleChangeFilter('sku_id', sku_id)
    if (sku_unit_id) {
      storageStore.handleChangeFilter('sku_unit_id', sku_unit_id)
    }
  }

  const toTun = async () => {
    storageStore.getShelf()
    getSkuInfo()
    await run()
    storageStore.getSkuList() // 获取商品名字和规格 只处理一次
  }

  useEffectOnce(toTun, warehouse_id)

  useMount(() => {
    // storageStore.getShelf()
    // getSkuInfo()
    execMutiWarehouseJudge(toTun)
    return storageStore.clean
  })

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
})
