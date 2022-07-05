import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { MoreSelectDataItem } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { ListSsu, Sku_SkuType } from 'gm_api/src/merchandise'
import { Filters_Bool } from 'gm_api/src/common'
import _ from 'lodash'

import store, { initProductDetail } from '../store'
import globalStore from '@/stores/global'

interface Props {
  index: number
}

interface Ssu extends MoreSelectDataItem<string> {
  sku_id?: string
  sku_name?: string
  category_name?: string
  unit_id?: string
  unit_ids?: MoreSelectDataItem<string>[]
}

interface SsuGroup {
  label: string
  children: Ssu[]
}

const CellSsuSelector: FC<Props> = observer(({ index }) => {
  const original = store.taskInfo.product_details![index]
  const [ssuList, setSsuList] = useState<SsuGroup[]>([])

  let selected: MoreSelectDataItem<string> | undefined
  if (original.sku_id) {
    selected = {
      value: original.sku_id,
      text: original.sku_name || '',
    }
  }

  const handleSearch = (value: string) => {
    if (!value) {
      return
    }

    // 新建包装计划 -- 只有sku下开启了包装bom的ssu才可以添加
    ListSsu({
      sku_type: Sku_SkuType.NOT_PACKAGE,
      q: value.trim(),
      paging: { limit: 999 },
      need_package_work: Filters_Bool.TRUE,
    }).then((json) => {
      // 根据sku_id聚合数据，展示sku的信息，规格展示为该sku下的ssu
      const { ssu_infos } = json.response
      const data = _.map(ssu_infos, (ssu) => ({
        ...ssu,
        sku_id: ssu?.sku?.sku_id,
        sku_name: ssu?.sku?.name,
        customized_code: ssu.sku?.customize_code,
      }))
      const group = _.groupBy(data, 'sku_id')
      const new_list = _.map(group, (value, key) => {
        return {
          value: key || '',
          text: value[0].sku_name || '',
          category_name: _.map(
            value[0].category_infos,
            (c) => c.category_name,
          ).join('/'),
          category_id: _.map(
            value[0].category_infos,
            (c) => c.category_id,
          ).join('_'),
          // 需要过滤掉没有包装bom的ssu
          unit_ids: _.map(value, (u) => {
            // 规格需要对应展示sku下的ssu的不同规格
            const parent_unit_name: string = globalStore.getUnitName(
              u?.ssu?.unit?.parent_id || '',
            )
            const spec: string = `${u?.ssu?.unit.rate}${parent_unit_name}/${u?.ssu?.unit.name}`
            return {
              // 展示规格名称
              text: spec,
              value: u?.ssu?.unit?.unit_id || '',
              name: u?.ssu?.unit?.name || '',
            }
          }),
        }
      })
      setSsuList(
        _.map(
          _.groupBy(
            _.filter(new_list, (item) => item.unit_ids.length !== 0),
            (ssu) => ssu.category_id,
          ),
          (value) => ({
            label: value[0].category_name,
            children: value,
          }),
        ),
      )
      return json
    })
  }

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    // 在已选择商品杭重新选择商品，需要清除信息
    if (!selected) {
      // 说明是清除
      store.updateListItem(index, { ...initProductDetail })
    }

    store.updateListItem(index, {
      ...original,
      ...selected,
      sku_id: selected.value,
      sku_name: selected.text,
      unit_id: selected.unit_ids[0].value,
      unit_name: selected.unit_ids[0].name, // text为规格，这里只需要展示sku的基本单位
    })
  }

  return (
    <KCMoreSelect
      isGroupList
      data={ssuList}
      selected={selected}
      onSelect={handleSelect}
      onSearch={handleSearch}
      placeholder={t('请输入商品名或商品编码搜索')}
    />
  )
})

export default CellSsuSelector
