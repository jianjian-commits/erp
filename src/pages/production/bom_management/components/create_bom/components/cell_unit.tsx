import {
  costUnitConversion,
  fetchSkuMaterialCost,
  permissionsMaterialRateCost,
} from '@/pages/merchandise/manage/util'
import { KCSelect } from '@gm-pc/keyboard'
import { GetManyReferencePricesResponse } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { Tag } from 'antd'
import { MaterialItem } from '../interface'
import store from '../store'
import { Flex } from '@gm-pc/react'
import { getMaterialRateCostV2 } from '@/pages/production/util'

/**
 * 单位单元格的属性
 */
interface CellUnitProps {
  /** 商品的编号 */
  index: number
  /** 商品信息 */
  sku: MaterialItem
  /** 是否是净菜 */
  isClean?: boolean
}

/**
 * 单位单元格的组件函数
 */
const CellUnit: FC<CellUnitProps> = observer(({ sku, index, isClean }) => {
  const {
    unit_id,
    unit_ids,
    quantity,
    process_yield,
    sku_id,
    material_cost,
    isFinishedProduct,
    skuInfo,
  } = sku

  /**
   * 处理单元选择的事件
   * 更新商品信息
   * @async
   * @param {string} selected 选择的单位
   */
  const handleUnitSelect = async (selected: string) => {
    let materialCost = material_cost
    if (!isFinishedProduct) {
      permissionsMaterialRateCost(
        isClean ? undefined : skuInfo?.not_package_sub_sku_type,
      ) &&
        (await fetchSkuMaterialCost({
          sku_ids: [sku_id],
          unit_id: selected,
        }).then((res) => {
          const { reference_price_map } = res as GetManyReferencePricesResponse
          materialCost = costUnitConversion(reference_price_map![sku_id], [])
        }))
    }

    store.updateListItem(
      index,
      Object.assign(store.materialList[index], {
        unit_id: selected,
        material_cost: materialCost,
        quantity,
        materialRateCost: getMaterialRateCostV2({
          material_cost: materialCost,
          yieldNumber: isClean ? process_yield : quantity,
          isClean,
        }),
      }),
    )
    isFinishedProduct && store.updateBomDetail('base_unit_id', selected)
  }

  const selected = unit_id || (unit_ids && unit_ids[0]?.value) || ''
  return (
    <KCSelect
      data={unit_ids!.slice()}
      value={selected}
      onChange={handleUnitSelect}
      renderItem={(v) => {
        const { tag, text } = v
        return (
          <Flex alignCenter justifyBetween>
            {text}
            <Tag color='blue' style={{ marginLeft: 4 }}>
              {tag}
            </Tag>
          </Flex>
        )
      }}
    />
  )
})

export default CellUnit
