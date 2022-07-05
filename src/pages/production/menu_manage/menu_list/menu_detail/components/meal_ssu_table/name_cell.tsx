import { t } from 'gm-i18n'
import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import _ from 'lodash'
import memoComponentWithDataHoc from './memo_hoc'
import { ListSsu, Sku_SkuType } from 'gm_api/src/merchandise'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { TableXUtil } from '@gm-pc/table-x'
import { keyboardTableCellOptions } from '../../interface'
import { initSsu } from '../../init_data'
import Big from 'big.js'

const { TABLE_X } = TableXUtil

const MealSsuNameCell: FC<keyboardTableCellOptions> = observer(
  ({ mealIndex, ssuIndex, editStatus }) => {
    const ssu =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]
    const { unit_id, name, sku_id } = ssu

    const [ssuList, setSsuList] = useState([])

    const handleSelect = (selected) => {
      if (!selected) {
        store.changeMealItemName(mealIndex, ssuIndex, initSsu)
      } else {
        store.changeMealItemName(mealIndex, ssuIndex, {
          sku_id: selected.sku_id,
          unit_id: selected.unit_id,
          name: selected.name,
          shipping_fee_unit: selected.shipping_fee_unit,
          unit: selected.unit,
          base_price: selected.basic_prices.length
            ? {
                ...selected.basic_prices[0],
                price:
                  selected.shipping_fee_unit === 1
                    ? Big(selected.basic_prices[0]?.price || 0)
                        .times(selected.unit?.rate)
                        .toString()
                    : selected.basic_prices[0]?.price,
              }
            : {
                current_price: false,
                price: '',
                sku_id: selected.sku_id,
                unit_id: selected.unit_id,
              },
        })
      }
    }

    const handleSearch = (value) => {
      if (_.trim(value)) {
        const req = {
          q: value,
          paging: { limit: 999 },
          sku_type: Sku_SkuType.NOT_PACKAGE,
        }
        ListSsu(req).then((json) => {
          setSsuList(
            _.map(json.response.ssu_infos, (ssu) => {
              return {
                ...ssu.ssu,
                basic_prices: ssu.basic_prices,
                value: ssu.ssu.sku_id + ssu.ssu.unit_id,
                text: ssu.ssu.name,
              }
            }),
          )
        })
      }
    }

    let selected = null

    if (sku_id && unit_id && name) {
      selected = {
        value: sku_id + unit_id,
        text: name,
      }
    }

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
        placeholder={t('请输入商品名称搜索')}
      />
    )
  },
)

export default memoComponentWithDataHoc(MealSsuNameCell)
