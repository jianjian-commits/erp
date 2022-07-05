import React, { useState, FC } from 'react'
import { MoreSelect } from '@gm-pc/react'
import { observer } from 'mobx-react'
import store from '../store'
import {
  GetManySkuResponse_SkuInfo,
  ListSkuResponse_SkuInfo,
} from 'gm_api/src/merchandise'
import _ from 'lodash'

interface Prop {
  index: number
  data: GetManySkuResponse_SkuInfo
}

const SkuSelectCell: FC<Prop> = ({ index, data }) => {
  const [skuList, setSkuList] = useState<ListSkuResponse_SkuInfo[]>([])

  const handleSearch = (value: string) => {
    store.searchSkus(value).then((response) => {
      setSkuList(response.sku_infos!)
      return response
    })
  }

  const comList = _.map(skuList, (skuInfo) => {
    return {
      ...skuInfo,
      text: skuInfo.sku?.name!,
      value: skuInfo.sku?.sku_id!,
    }
  })

  return (
    <MoreSelect
      disabledClose
      data={comList}
      selected={{
        ...data,
        text: data.sku?.name!,
        value: data.sku?.sku_id!,
      }}
      onSelect={(selected: any) => {
        store.addSku(
          _.find(skuList, (sku) => sku.sku?.sku_id === selected.sku.sku_id)!,
          index,
        )
      }}
      onSearch={handleSearch}
    />
  )
}

export default observer(SkuSelectCell)
