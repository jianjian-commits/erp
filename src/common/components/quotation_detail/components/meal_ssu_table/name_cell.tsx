import { t } from 'gm-i18n'
import React, { useState, FC, useCallback, useMemo } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import _ from 'lodash'
import { ListSkuV2, Sku_SkuType } from 'gm_api/src/merchandise'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { TableXUtil } from '@gm-pc/table-x'
import {
  KeyboardTableCellOptions,
  MenuDetailItem,
  Ingredient,
} from '../../interface'
import { createInitialData } from '../../init_data'
import { getUnitGroupList } from '@/pages/merchandise/util'

const { TABLE_X } = TableXUtil

const MealSsuNameCell: FC<KeyboardTableCellOptions> = observer(
  ({ mealIndex, ssuIndex, editStatus }) => {
    const ssu =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]
    const { name, sku_id } = ssu

    const [ssuList, setSsuList] = useState<MenuDetailItem[]>([])

    const handleSelect = (selected: MenuDetailItem) => {
      if (!selected) {
        store.changeMealSsuName(mealIndex, ssuIndex, createInitialData())
      } else {
        store.changeMealSsuName(mealIndex, ssuIndex, selected)
      }
    }

    const handleSearch = (keyword: string) => {
      if (_.trim(keyword)) {
        ListSkuV2({
          filter_params: {
            q: keyword,
            sku_types: [Sku_SkuType.NOT_PACKAGE, Sku_SkuType.COMBINE],
            on_sale: 1,
            on_shelf: 1,
          },
          paging: { limit: 999 },
        }).then((json) => {
          const ingredients = json.response.ingredient_map || {}
          const result = _.map(json.response.skus, (item): MenuDetailItem => {
            let ingredientsInfo: Ingredient[] = []
            const isCombine = item.sku_type === Sku_SkuType.COMBINE
            if (isCombine) {
              ingredientsInfo = _.map(
                item.ingredients?.ingredients,
                (childSku): Ingredient | undefined => {
                  if (!childSku.sku_id) {
                    return undefined
                  }
                  const target = ingredients[childSku.sku_id]
                  if (!target) {
                    return undefined
                  }
                  const units = getUnitGroupList(target).map((item) => ({
                    ...item,
                    text: item.label,
                  }))
                  const unit = _.find(
                    units,
                    (item) => `${item.value}` === `${childSku.order_unit_id}`,
                  )
                  return {
                    ...createInitialData(),
                    rawBasicPrice: undefined,
                    sku_id: target.sku_id,
                    sku_type: target.sku_type,
                    name: target.name,
                    unit_id: childSku.order_unit_id,
                    fee_unit_id: unit?.value,
                    unit,
                    units,
                    ratio: childSku.ratio,
                    skuIndex: ssuIndex,
                    value: target.sku_id,
                    text: target.name,
                  }
                },
              ).filter((childSku): childSku is Ingredient => !_.isNil(childSku))
            }
            const units = getUnitGroupList(item).map((item) => ({
              ...item,
              text: item.label,
            }))
            return {
              ...createInitialData(),
              sku_id: item.sku_id,
              sku_type: item.sku_type,
              name: item.name,
              fee_unit_id: isCombine ? units[0]?.value : undefined,
              unit_id: item.base_unit_id,
              // ???????????????????????????????????????????????????????????????
              unit: isCombine ? units[0] : undefined,
              units,
              ingredientsInfo,
              ingredient: item.ingredients?.ingredients,
              value: item.sku_id,
              text: item.name,
            }
          })
          setSsuList(result)
        })
      }
    }

    let selected

    if (sku_id && name) {
      selected = {
        value: sku_id,
        text: name,
      }
    }

    const filterList = useCallback(
      (list: MenuDetailItem[]) => {
        // ???????????? sku_id
        // ???????????? useMemo ??????????????????????????????
        // ????????? mobx ????????????????????????????????????????????????????????????????????????????????????????????????
        const selecedSkuIdList = _.map(
          store.editMenu?.details?.service_period_infos[mealIndex]?.details,
          (item) => item.sku_id!,
        )
        // ???????????????????????????
        return _.filter(list, (item) => {
          return !selecedSkuIdList.includes(item.sku_id!)
        })
      },
      [mealIndex],
    )

    return (
      <KCMoreSelect
        style={{
          width: TABLE_X.WIDTH_SEARCH,
        }}
        data={ssuList}
        disabled={!editStatus?.canEditSsu}
        selected={selected}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder={t('???????????????????????????')}
        renderListFilter={filterList}
      />
    )
  },
)

export default MealSsuNameCell
