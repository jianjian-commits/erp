import {
  ListSkuType,
  OptionResponse,
} from '@/pages/merchandise/manage/interface'
import {
  costUnitConversion,
  fetchSkuMaterialCost,
  permissionsMaterialRateCost,
} from '@/pages/merchandise/manage/util'
import { handleUnits, getMaterialRateCostV2 } from '@/pages/production/util'
import { DeletedProduct } from '@/pages/sales_invoicing/components/index'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { Flex, MoreSelectDataItem } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import {
  ListSkuV2,
  ListSkuV2Request_RequestData,
  Sku_SkuType,
  Sku,
} from 'gm_api/src/merchandise'
import { BomType } from 'gm_api/src/production'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, ReactNode, useState } from 'react'
import { MaterialItem } from '../interface'
import store, { initMaterial } from '../store'

/**
 * 商品名单元格的属性
 */
interface CellSkuNameProps {
  /** 商品信息 */
  sku: MaterialItem
  /** 商品编号 */
  index: number
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 商品条目
 */
interface SkuItem extends MoreSelectDataItem<string> {
  /** 商品ID */
  sku_id?: string
  /** 商品名 */
  sku_name?: string
  /** 商品分类 */
  category_name?: string
  /** 单位ID */
  unit_id?: string
}

/**
 * 商品条目组
 */
interface SkuGroup {
  /** 标签 */
  label: string
  /** 所有商品条目 */
  children: SkuItem[]
}

const { TABLE_X } = TableXUtil

/**
 * 商品名单元格的组件函数
 */
const CellSkuName: FC<CellSkuNameProps> = observer(
  ({ sku, index, disabled }) => {
    const [skuList, setSkuList] = useState<SkuGroup[]>([])
    const { type, selectedSku: bomSelectSku } = store.bomDetail
    const isClean = type === BomType.BOM_TYPE_CLEANFOOD
    const isPack = type === BomType.BOM_TYPE_PACK

    // 拿到sku信息
    let selectedSku: MoreSelectDataItem<string> | undefined
    const { sku_id, sku_name, customize_code } = sku
    if (sku_id) {
      selectedSku = {
        sku_id,
        value: sku_id,
        text: `${sku_name || ''} ${customize_code || ''}`,
      }
    }

    /**
     * 渲染商品条目
     * @param  {MoreSelectDataItem<string>} item 商品条目信息
     * @return {ReactNode}                       渲染的商品条目
     */
    const renderSkuItem = (item: MoreSelectDataItem<string>): ReactNode => {
      return <div>{item.text}</div>
    }

    /**
     * 处理搜索的事件
     * 搜索并列出商品
     * @param {string} value 搜索的值
     */
    const handleSearch = (value: string) => {
      if (!value) {
        return
      }

      // bom为加工品的时候且type为包装时 拉取包材

      ListSkuV2({
        paging: { limit: 999 },
        filter_params: {
          q: value,
          sku_type: !isPack ? Sku_SkuType.NOT_PACKAGE : undefined,
        },
        request_data: ListSkuV2Request_RequestData.CATEGORY,
      }).then((json) => {
        const { skus, category_map } = json.response
        // 过滤掉本身
        const list = _.filter(
          _.map(skus, (sku) => {
            const categoryInfo = []
            for (let i = 1; i <= 5; i++) {
              const categoryId = `category${i}_id` as keyof Pick<
                Sku,
                | 'category1_id'
                | 'category2_id'
                | 'category3_id'
                | 'category4_id'
                | 'category5_id'
              >
              categoryInfo.push(sku[categoryId])
              if (sku[categoryId] === sku.category_id) {
                break
              }
            }
            return {
              ...sku,
              value: sku.sku_id || '',
              text: sku.name || '',
              sku_id: sku.sku_id,
              not_package_sub_sku_type: sku.not_package_sub_sku_type,
              category_id: categoryInfo.join('_'),
              category_name: _.map(categoryInfo, (category) => {
                return category_map?.[category!]?.name || '未知分类'
              }).join('/'),
            }
          }),
          (sku) => sku.sku_id !== bomSelectSku?.value,
        )

        setSkuList(
          _.map(
            _.groupBy(list, (sku) => sku.category_id),
            (value) => ({
              label: value[0].category_name,
              children: value.map((v) => {
                v.text = `${v.name || ''} ${v.customize_code || ''}`
                return v
              }),
            }),
          ),
        )
        return json
      })
    }

    /**
     * 处理选择商品的事件
     * 更新商品信息
     * @async
     * @param {ListSkuType} selected 选择的商品
     */
    const handleSelectSku = async (selected: ListSkuType) => {
      const process_yield = isClean ? sku.process_yield : undefined
      // 在已选择商品行重新选择商品，需要清除信息
      if (!selected) {
        // 说明是清除
        store.updateListItem(index, { ...initMaterial, process_yield })
        return
      }

      const { base_unit_id } = selected || {}

      const allUnits = handleUnits(selected, store.unitSomeArray)

      const {
        name,
        production_unit,
        value: skuId,
        not_package_sub_sku_type,
        ssu_infos,
      } = selected
      const selectUnitId = +production_unit!.unit_id
        ? production_unit!.unit_id
        : base_unit_id
      // 点击之后拉取sku的Unit单位组、出成率/bom信息、物料成本
      //! todo 若要使用arr下标请放在可选接口前
      Promise.all([
        store.fetchSkuCookYieldRate(skuId),
        permissionsMaterialRateCost(
          isClean ? undefined : not_package_sub_sku_type,
        )
          ? fetchSkuMaterialCost(
              { sku_ids: [skuId], unit_id: selectUnitId },
              true,
            )
          : Promise.resolve(null),
        // 可选接口
      ]).then((arr) => {
        const optionalObject: OptionResponse = _.reduce(
          arr,
          (all, value) => ({ ...all, ...value }),
          {},
        )
        const materialBom = arr[0]?.boms![0]
        const material_cost = costUnitConversion(
          optionalObject?.['materialCost']?.reference_price_map![skuId],
          ssu_infos,
        )
        // 此处一开始的设计不对 导致现在无法确定selected是否可删
        store.updateListItem(index, {
          ...selected,
          skuInfo: selected,
          sku_id: skuId,
          sku_name: name,
          unit_ids: allUnits,
          unit_id: selectUnitId,
          quantity: isClean ? '1' : '',
          property: 1,
          base_unit_id,
          process_yield,
          materialBom,
          cook_yield_rate: materialBom?.default_cook_yield_rate,
          material_cost,
          materialRateCost: getMaterialRateCostV2({
            material_cost,
            yieldNumber: process_yield,
            isClean,
          }), // 兼容生产单位
        })
      })
    }

    return (
      <Flex alignCenter>
        <KCMoreSelect
          isGroupList
          style={{
            width: TABLE_X.WIDTH_SEARCH,
          }}
          data={skuList}
          selected={selectedSku}
          onSearch={handleSearch}
          onSelect={handleSelectSku}
          placeholder={t('请输入商品名搜索')}
          renderListItem={renderSkuItem}
          disabled={disabled}
        />
        {sku?.skuInfo && sku.skuInfo.delete_time !== '0' && <DeletedProduct />}
      </Flex>
    )
  },
)

export default CellSkuName
