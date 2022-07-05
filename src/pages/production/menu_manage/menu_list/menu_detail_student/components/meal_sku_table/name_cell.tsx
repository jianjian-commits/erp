import { t } from 'gm-i18n'
import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import _ from 'lodash'
import memoComponentWithDataHoc from './memo_hoc'
import { Sku_SkuType, ListSkuV2 } from 'gm_api/src/merchandise'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { TableXUtil } from '@gm-pc/table-x'
import { KeyboardTableCellOptions } from './interface'

const { TABLE_X } = TableXUtil

const MealSkuNameCell: FC<KeyboardTableCellOptions> = observer(
  ({ mealIndex, skuIndex }) => {
    const sku = _.get(
      store.editMenu,
      `periodInfos[${mealIndex}].detail_skus[${skuIndex}]`,
    )
    const { sku_id } = sku
    const { name } = sku?.sku

    const [skuList, setSkuList] = useState<any[]>([])

    let selected

    if (sku_id && name) {
      selected = {
        value: sku_id,
        text: name,
        sku: sku.sku,
      }
    }

    const handleSelect = (selected: any) => {
      const sku = {
        sku_id: _.get(selected, 'value', ''),
        unit_id: _.get(selected, 'sku.base_unit_id', ''),
        sku: _.get(selected, 'sku', {}),
        count: 1,
      }
      store.changeMealItemName(mealIndex, skuIndex, sku)
    }

    const handleSearch = (value: string) => {
      if (_.trim(value)) {
        ListSkuV2({
          filter_params: {
            q: value,
            sku_type: Sku_SkuType.NOT_PACKAGE,
          },
          paging: {
            offset: 0,
            limit: 999,
          },
        }).then((res) => {
          const skus = (res.response.skus || []).map((sku) => {
            return {
              text: sku.name,
              value: sku.sku_id,
              sku,
            }
          })
          setSkuList(skus)
        })
      }
    }

    return (
      <KCMoreSelect
        style={{
          width: TABLE_X.WIDTH_SEARCH,
        }}
        data={skuList}
        // disabled={!editStatus?.canEditSsu}
        selected={selected}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder={t('请输入商品名称搜索')}
      />
    )
  },
)

export default memoComponentWithDataHoc(MealSkuNameCell)
