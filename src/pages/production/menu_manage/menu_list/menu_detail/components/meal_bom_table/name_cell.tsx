import { t } from 'gm-i18n'
import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import _ from 'lodash'
import { ListSku } from 'gm_api/src/merchandise/index'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { TableXUtil } from '@gm-pc/table-x'
import { keyboardTableChildCellOptions } from '../../interface'

const { TABLE_X } = TableXUtil

const MealBomNameCell: FC<keyboardTableChildCellOptions> = observer(
  ({ mealIndex, ssuIndex, bomIndex, editStatus }) => {
    const sku =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]?.bom?.processes?.processes[0]?.inputs[bomIndex]?.material

    const [skuList, setSkuList] = useState([])

    const handleSelect = (selected) => {
      if (!selected) {
        store.changeMealBomItem(mealIndex, ssuIndex, bomIndex, {
          sku_id: '',
          unit_id: '',
          name: '',
          quantity: '',
          ssuIndex,
        })
      } else {
        store.changeMealBomItem(mealIndex, ssuIndex, bomIndex, {
          ...selected,
          quantity: '',
        })
      }
    }

    const handleSearch = (value) => {
      if (_.trim(value)) {
        const req = {
          q: value,
          paging: { limit: 999 },
        }
        (req).then((json) => {
          setSkuList(
            _.map(json.response.sku_infos, (sku) => {
              return {
                ...sku.sku,
                unit_id: sku.sku.base_unit_id,
                value: sku.sku.sku_id,
                text: sku.sku.name,
              }
            }),
          )
        })
      }
    }

    let selected = null

    if (sku?.sku_id && sku?.name) {
      selected = {
        value: sku?.sku_id,
        text: sku?.name,
      }
    }

    return (
      <KCMoreSelect
        style={{
          width: TABLE_X.WIDTH_SEARCH,
        }}
        data={skuList}
        disabled={!editStatus?.canEditBom}
        selected={selected}
        onSelect={handleSelect}
        onSearch={handleSearch}
        placeholder={t('请输入商品名称搜索')}
      />
    )
  },
)

export default MealBomNameCell
