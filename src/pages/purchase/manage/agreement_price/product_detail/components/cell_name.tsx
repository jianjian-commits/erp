import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { observer } from 'mobx-react'
import { ListSku, ListSkuRequest_RequestData } from 'gm_api/src/merchandise'
import store from '../store'
import type { ListSkuResponse_SkuInfo, SsuInfo } from 'gm_api/src/merchandise'

import type { MoreSelectDataItem } from '@gm-pc/react'
import globalStore from '@/stores/global'

type SelectItem = MoreSelectDataItem<string>

const CellName = (props: { index: number }) => {
  const [list, setList] = useState<MoreSelectDataItem<string>[]>([])
  const { index } = props
  const name = store.list[index]?.skuName
  const skuId = store.list[index]?.skuId
  const selected: MoreSelectDataItem<string> | undefined =
    skuId && name
      ? {
          value: `${skuId}`,
          text: name,
        }
      : undefined

  function sortDataFromSsu(ssu: any) {
    const rate = ssu.unit.rate
    // 计量单位
    const meas_unit = globalStore.unitMap[ssu.unit.parent_id].name
    // 包装单位
    const pkg_unit = ssu.unit.name
    const unit_id = ssu.unit.unit_id
    const ssu_id = ssu.ssu_id
    return { rate, meas_unit, pkg_unit, unit_id, ssu_id }
  }

  function generateSsuSelectData(ssuInfos: SsuInfo[]) {
    return ssuInfos!.map((v) => {
      const { rate, meas_unit, pkg_unit, unit_id, ssu_id } = sortDataFromSsu(
        v.ssu!,
      )
      return {
        text: `${rate}${meas_unit}/${pkg_unit}`,
        value: `${rate}/${meas_unit}/${pkg_unit}/${unit_id}/${ssu_id}`,
      }
    })
  }

  function combineSku(skuInfos: ListSkuResponse_SkuInfo[]) {
    const skuList: MoreSelectDataItem<string>[] = []
    skuInfos
      .filter((v) => v.ssu_infos?.length !== 0)
      .forEach((v) => {
        const ssuSelectData: MoreSelectDataItem<string>[] =
          generateSsuSelectData(v.ssu_infos!)
        skuList.push({
          value: v.sku!.sku_id,
          text: v.sku!.name || '未知',
          category_name:
            v?.category_infos?.map((v) => v.category_name)?.join('/') || '未知',
          ssuSelectData: ssuSelectData,
        })
      })
    return skuList
  }

  function getSkuList(q: string) {
    const req = {
      q,
      request_data:
        ListSkuRequest_RequestData.SSU + ListSkuRequest_RequestData.CATEGORY,
      paging: { limit: 999 },
    }
    return ListSku(req).then((json) => json.response)
  }

  function handleSelect(selected: SelectItem) {
    const sheet = {
      skuName: selected.text,
      skuId: selected.value,
      ssuSelectData: selected.ssuSelectData,
      categoryName: selected.category_name,
    }
    store.updateList(index, sheet)
  }

  function handleSearch(text: string) {
    getSkuList(text).then((res) => {
      const sku_infos = res.sku_infos!
      const skuList = combineSku(sku_infos)
      return setList(skuList)
    })
  }

  return (
    <KCMoreSelect
      data={list}
      selected={selected}
      onSelect={handleSelect}
      onSearch={handleSearch}
      placeholder={t('输入自定义编码或者商品名')}
      renderListFilter={(data) => {
        return data
      }}
    />
  )
}

export default observer(CellName)
