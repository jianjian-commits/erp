import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import type { MoreSelectDataItem, MoreSelectGroupDataItem } from '@gm-pc/react'
import type {
  ListSkuResponse_SkuInfo,
  SsuInfo,
  Sku,
  CategoryTreeCache_CategoryInfo,
} from 'gm_api/src/merchandise'
import { getCategoryName } from '@/common/util/sku'
import { Task } from './interface'
import { parseSsu } from '@/common/util'
import _ from 'lodash'

const combineSSu = (ssuInfos: SsuInfo[]) => {
  return ssuInfos!.map((v) => {
    return {
      ...v.ssu,
      ...parseSsu(v.ssu!),
      text: `${v.ssu?.unit?.rate!}${globalStore.getUnitName(
        v.ssu?.unit?.parent_id!,
      )}/${v.ssu?.unit?.name}`,
      value: v.ssu?.unit_id!,
    }
  })
}

const combineSku = (
  skuInfos: ListSkuResponse_SkuInfo[],
  cb?: (d: ListSkuResponse_SkuInfo, i: number) => any,
) => {
  const list: MoreSelectDataItem<string>[] = []
  skuInfos
    .filter((v) => v.ssu_infos?.length !== 0)
    .forEach((v, i) => {
      const ssuInfos: MoreSelectDataItem<string>[] = combineSSu(v.ssu_infos!)
      list.push({
        ...v.sku,
        value: v.sku!.sku_id,
        text: v.sku!.name || '未知',
        category_name:
          v?.category_infos?.map((v) => v.category_name)?.join('/') || '未知',
        ssuInfos: ssuInfos,
        ...(cb ? cb(v, i) : null),
      })
    })
  return list
}

const dealWithSku = (
  sku: Sku[],
  category_map: Record<string, CategoryTreeCache_CategoryInfo>,
) => {
  const list: MoreSelectDataItem<string>[] = []
  sku.forEach((v) => {
    const index = _.findIndex(
      v?.units?.units,
      (item) => item.unit_id === v.purchase_unit_id,
    )
    list.push({
      ...v,
      value: v?.sku_id,
      text: v?.name || '未知',
      purchase_unit_name:
        index === -1
          ? _.find(
              globalStore?.unitList as any[],
              (item) => item?.value === v?.purchase_unit_id,
            )?.name
          : v?.units?.units[index].name || '-',

      category_name: getCategoryName(category_map, v?.category_id!) || '未知',
    })
  })
  return list
}
const purchaserGroupBy = (
  purchasers: MoreSelectDataItem<string>[],
  supplier: MoreSelectDataItem<string>,
) => {
  const list: MoreSelectGroupDataItem<string>[] = [
    {
      label: t('当前供应商'),
      children: [],
    },
    {
      label: t('非当前供应商'),
      children: [],
    },
  ]
  purchasers.forEach((v) => {
    if (
      ((v.attrs?.bounded_customer_ids as string[]) || []).includes(
        supplier?.value || supplier?.supplier_id,
      )
    ) {
      list[0].children.push({
        ...v,
        value: v.group_user_id,
        text: v.name,
      })
    } else {
      list[1].children.push({
        ...v,
        value: v.group_user_id,
        text: v.name,
      })
    }
  })

  return list
}
const supplierGroupBy = (
  suppliers: MoreSelectDataItem<string>[],
  purchaser: MoreSelectDataItem<string>,
) => {
  const list: MoreSelectGroupDataItem<string>[] = [
    {
      label: t('当前采购员'),
      children: [],
    },
    {
      label: t('非当前采购员'),
      children: [],
    },
  ]
  suppliers.forEach((supplier) => {
    if (!supplier.supplier_id) return supplier
    if (
      purchaser &&
      ((purchaser.attrs?.bounded_customer_ids as string[]) || []).includes(
        supplier?.value || supplier?.supplier_id,
      )
    ) {
      list[0].children.push({
        ...supplier,
        value: supplier.supplier_id,
        text: supplier.name,
      })
    } else {
      list[1].children.push({
        ...supplier,
        value: supplier.supplier_id,
        text: supplier.name,
      })
    }
  })
  return list
}

const list2Map = (list: any[], keyFiled: string) => {
  const map: { [key: string]: any } = {}
  list.forEach((v) => {
    if (!map[v[keyFiled]]) {
      map[v[keyFiled]] = v
    }
  })
  return map
}

const getTaskParams = (task: Task) => {
  const { sku, supplier, purchaser, batch, isEditing, ...rest } = task
  return {
    ...rest,
    supplier_id: supplier?.supplier_id || undefined,
    purchaser_id: purchaser?.group_user_id || undefined,
  }
}

const getBaseUnitName = (id: string) => {
  return globalStore.getUnitName(id)
}

export {
  combineSSu,
  combineSku,
  dealWithSku,
  purchaserGroupBy,
  supplierGroupBy,
  list2Map,
  getTaskParams,
  getBaseUnitName,
}
