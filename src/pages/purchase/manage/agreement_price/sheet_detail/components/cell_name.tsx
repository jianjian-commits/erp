import React, { useState } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { observer } from 'mobx-react'
import { ListSkuV2, ListSkuV2Request_RequestData } from 'gm_api/src/merchandise'
import store from '../store'
import type { ListSkuResponse_SkuInfo, SsuInfo } from 'gm_api/src/merchandise'
import { dealWithSku } from '@/pages/purchase/util'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import type { MoreSelectDataItem } from '@gm-pc/react'
// import globalStore from '@/stores/global'
// import type { ListSkuResponse_SkuInfo, SsuInfo } from 'gm_api/src/merchandise'

type SelectItem = MoreSelectDataItem<string>

const CellName = (props: { index: number; supplier_id: string }) => {
  const { index, supplier_id } = props

  const [list, setList] = useState<MoreSelectDataItem<string>[]>([])
  const name = store.list[index]?.skuName
  const skuId = store.list[index]?.skuId
  const selected: MoreSelectDataItem<string> | undefined =
    skuId && name
      ? {
          value: `${skuId}`,
          text: name,
        }
      : undefined

  // function sortDataFromSsu(ssu: any) {
  //   const rate = ssu.unit.rate
  //   // 计量单位
  //   const meas_unit = globalStore.unitMap[ssu.unit.parent_id].name
  //   // 包装单位
  //   const pkg_unit = ssu.unit.name
  //   const unit_id = ssu.unit.unit_id
  //   const ssu_id = ssu.ssu_id
  //   return { rate, meas_unit, pkg_unit, unit_id, ssu_id }
  // }

  // function generateSsuSelectData(ssuInfos: SsuInfo[]) {
  //   return ssuInfos!.map((v) => {
  //     const { rate, meas_unit, pkg_unit, unit_id, ssu_id } = sortDataFromSsu(
  //       v.ssu!,
  //     )
  //     return {
  //       text: `${rate}${meas_unit}/${pkg_unit}`,
  //       value: `${rate}/${meas_unit}/${pkg_unit}/${unit_id}/${ssu_id}`,
  //     }
  //   })
  // }

  function getSkuList(q: string) {
    const req = {
      filter_params: { q },
      request_data: ListSkuV2Request_RequestData.CATEGORY,
      paging: { limit: 999 },
    }
    return ListSkuV2(req).then((json) => json.response)
  }

  // function combineSku(skuInfos: ListSkuResponse_SkuInfo[]) {
  //   const skuList: MoreSelectDataItem<string>[] = []
  //   skuInfos
  //     .filter((v) => v.ssu_infos?.length !== 0)
  //     .forEach((v) => {
  //       const ssuSelectData: MoreSelectDataItem<string>[] =
  //         generateSsuSelectData(v.ssu_infos!)
  //       skuList.push({
  //         value: v.sku!.sku_id,
  //         text: v.sku!.name || '未知',
  //         category_name:
  //           v?.category_infos?.map((v) => v.category_name)?.join('/') || '未知',
  //         ssuSelectData: ssuSelectData,
  //         supplier_tax: v.sku?.supplier_input_taxs?.supplier_input_tax, // 特殊税率
  //         general_input_tax: v.sku?.input_tax, // 普通说率
  //       })
  //     })
  //   return skuList
  // }

  function handleSelect(selected: SelectItem) {
    if (!selected) return store.delRowList(index)

    store.changeSaveSelectItem(index, 'add', selected)

    const invoice_type =
      store.headerInfo?.supplier?.attrs?.china_vat_invoice?.invoice_type

    const sheet = {
      skuName: selected.text,
      skuId: selected.value,
      purchase_unit_id: selected.purchase_unit_id,
      // ssuSelectData: selected.ssuSelectData,
      categoryName: selected.category_name,
      price: '',
      pkgPrice: '',
      purchase_unit_name: selected.purchase_unit_name,
      // measUnit:,
      input_tax:
        invoice_type === ChinaVatInvoice_InvoiceType.VAT_SPECIAL
          ? selected?.supplier_input_taxs?.supplier_input_tax?.[supplier_id] ??
            selected?.input_tax ??
            0
          : 0,
    }
    store.updateList(index, sheet)
  }

  function handleSearch(text: string) {
    return getSkuList(text).then((res) => {
      const sku_infos = res.skus!
      const category_map = res.category_map!
      const skuList = dealWithSku(sku_infos, category_map)
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
      // 用renderListItem的话搜编码会显示不出来
      renderListFilter={(data) => {
        return data
      }}
    />
  )
}

export default observer(CellName)
