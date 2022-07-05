import React, { FC, useState, CSSProperties } from 'react'
import { BomType, ListBomSku } from 'gm_api/src/production'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '../store'
import { Select } from 'antd'
import { MoreSelectDataItem } from '@/pages/production/plan_management/plan/task/interface'
import { observer } from 'mobx-react'

interface Props {
  isProduce: boolean
  onSearch?: () => void
  width?: CSSProperties['minWidth']
}
const SelectName: FC<Props> = ({ isProduce, onSearch, width }) => {
  const [skuList, setSkuList] = useState<MoreSelectDataItem[]>([])
  const _width = width || '200px'
  const handleSearch = (value: string) => {
    if (!value) {
      return
    }
    ListBomSku({
      list_sku_v2_request: {
        filter_params: { q: value },
        paging: { limit: 999 },
      },
      bom_types: isProduce
        ? [BomType.BOM_TYPE_CLEANFOOD, BomType.BOM_TYPE_PRODUCE]
        : [BomType.BOM_TYPE_PACK],
    }).then((json) => {
      setSkuList(
        _.map(json.response.list_sku_v2_response?.skus, ({ sku_id, name }) => ({
          value: sku_id,
          label: name,
        })),
      )
      return null
    })
  }

  return (
    <Select
      className='tw-mr-3'
      style={{ minWidth: _width }}
      placeholder={
        isProduce ? t('输入生产成品名称搜索') : t('输入包装成品名称搜索')
      }
      mode='multiple'
      showSearch
      maxTagCount={2}
      maxTagTextLength={5}
      value={store.sku}
      options={skuList}
      filterOption={false}
      onSearch={_.debounce((q: string) => handleSearch(q), 500)}
      onChange={(select: string[], option) => {
        store.setSku(option)
        store.updateFilter('sku_ids', select)
        onSearch && onSearch()
      }}
    />
  )
}

export default observer(SelectName)
