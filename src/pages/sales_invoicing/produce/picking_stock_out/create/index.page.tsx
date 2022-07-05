import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { HeaderDetail, EditDetail } from '../components'
import _ from 'lodash'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'

import { OutStorageScan } from '@/pages/sales_invoicing/components/scan'

import globalStore from '@/stores/global'
import commonStore from '@/pages/sales_invoicing/store'
import { DetailStore } from '../stores/index'

const Create = () => {
  const { fetchProcess, fetchShelf, clear, receiptDetail, handleScanData } =
    DetailStore
  const { warehouse_id } = receiptDetail

  const { run, loading } = useAsync(() =>
    Promise.all([fetchProcess(), fetchShelf()]),
  )

  useEffect(() => {
    run()
    return clear
  }, [])

  // 扫码进来的数据，轮询进行对应的库存匹配
  const matchInventory = async (data: any) => {
    const dealDataPro = _.map(data, async (item) => {
      const { sku_id } = item
      const { sku_stock } = await commonStore.getStock(sku_id, [
        receiptDetail?.warehouse_id!,
      ])
      /** 当前库存数 */
      const currStockQuantity = sku_stock?.stock?.base_unit?.quantity || '0'

      return Object.assign(item, {
        currStockQuantity,
      })
    })
    const dealData = await Promise.all(dealDataPro)
    handleScanData(dealData)
  }

  const renderDetail = () => {
    if (globalStore.isOpenMultWarehouse && !warehouse_id) return null
    return (
      <>
        <EditDetail />
        <OutStorageScan onEnsure={matchInventory} type='getMaterial' />
      </>
    )
  }

  return (
    <LoadingChunk loading={loading}>
      <HeaderDetail type='add' />
      {renderDetail()}
    </LoadingChunk>
  )
}

export default observer(Create)
