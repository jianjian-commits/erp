import { t } from 'gm-i18n'
import React, { FC, useRef, useState } from 'react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { observer } from 'mobx-react'
import {
  ListSkuV2Request,
  ListSkuV2Request_RequestData,
} from 'gm_api/src/merchandise'
import { Bom, ListBomSku } from 'gm_api/src/production'
import _ from 'lodash'

import store, { initProductDetail } from '../store'
import globalStore from '@/stores/global'

interface Props {
  index: number
}

interface Sku extends MoreSelectDataItem<string> {
  sku_id?: string
  sku_name?: string
  category_name?: string
  unit_id?: string
}

interface SkuGroup {
  label: string
  children: Sku[]
}

const CellSkuSelector: FC<Props> = observer(({ index }) => {
  const original = store.taskInfo.product_details![index]
  const [skuList, setSkuList] = useState<SkuGroup[]>([])
  const bomsData = useRef<{ [key: string]: Bom }>()

  const targetCustomerId =
    store.taskInfo.target_customer?.value === ''
      ? ''
      : store.taskInfo.target_customer?.value

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

    // 新建生产计划 -- 拉取开启加工的商品sku
    const params: ListSkuV2Request = {
      filter_params: {
        // sku_type: Sku_SkuType.NOT_PACKAGE,
        q: value,
      },
      request_data: ListSkuV2Request_RequestData.CATEGORY,
      paging: { limit: 999 },
    }

    ListBomSku({
      list_sku_v2_request: params,
      target_customer_id: targetCustomerId,
    }).then((json) => {
      const { list_sku_v2_response, boms } = json.response

      if (list_sku_v2_response) {
        const { skus, category_map } = list_sku_v2_response
        const list = _.map(skus, (sku) => {
          const categoryInfo = []
          for (let i = 1; i < 5; i++) {
            categoryInfo.push(sku[`category${i}_id`])
            if (sku[`category${i}_id`] === sku.category_id) {
              break
            }
          }

          return {
            ...sku,
            value: sku?.sku_id || '',
            text: sku?.name || '',
            sku_id: sku?.sku_id,
            category_name:
              _.map(categoryInfo, (category) => {
                return category_map?.[category]?.name || '未知分类'
              }).join('/') || '未知',
            // unit_id: sku?.base_unit_id,
            customized_code: sku?.customize_code,
          }
        })

        bomsData.current = boms

        // 更新sku_list
        setSkuList(
          _.map(
            _.groupBy(list, (c) => (c as any).category_name),
            (value) => ({
              label: value[0].category_name,
              children: value,
            }),
          ),
        )
      }

      return json
    })
  }

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    // 在已选择商品杭重新选择商品，需要清除信息
    if (!selected) {
      // 说明是清除
      store.updateListItem(index, { ...initProductDetail })
      return
    }

    let skuInfo: any = {}
    skuList.map((listArr) => {
      skuInfo = listArr.children.find((item) => item.sku_id === selected.value)
    })
    const { base_unit_id, production_unit_id, second_base_unit_id, units } =
      skuInfo || {}

    const unit_ids = store.getAllUnits({
      base_unit_id,
      production_unit_id,
      second_base_unit_id,
      units,
    })

    store.updateListItem(index, {
      ...original,
      ...selected,
      sku_name: selected.text,
      unit_name: globalStore.getUnitName(selected.unit_id!) || '-',
      unit_ids: unit_ids,
      bomInfo: bomsData.current?.[selected.value],
    })
  }

  return (
    <MoreSelect
      isGroupList
      data={skuList}
      selected={selected}
      onSelect={handleSelect}
      onSearch={handleSearch}
      placeholder={t('请输入商品名或商品编码搜索')}
      renderListFilter={(data) => {
        return data
      }}
    />
  )
})

export default CellSkuSelector
