import React, { FC, useState } from 'react'
import { BomType, ListBomSku } from 'gm_api/src/production'
import { Sku_SkuType, ListSkuV2 } from 'gm_api/src/merchandise'
import _ from 'lodash'
import store from '../../store'
import { Select } from 'antd'
import { t } from 'gm-i18n'
import { MoreSelectDataItem } from '@/pages/production/plan_management/plan/task/interface'
import { taskCommandSearchType } from '@/pages/production/enum'
interface Props {
  isMaterial: boolean
  onChange: (value: string[]) => void
  isPack?: boolean
}

const SelectName: FC<Props> = ({ isPack, isMaterial, onChange }) => {
  const [skuList, setSkuList] = useState<MoreSelectDataItem[]>([])
  const {
    setInput_sku_ids_list,
    setOutput_sku_ids_list,
    input_sku_ids_list,
    output_sku_ids_list,
  } = store
  const handleSearch = (value: string) => {
    if (!value) {
      return
    }
    if (!isMaterial) {
      ListBomSku({
        list_sku_v2_request: {
          filter_params: {
            q: value,
          },
          paging: { limit: 999 },
        },
        bom_types: isPack
          ? [BomType.BOM_TYPE_PACK]
          : [BomType.BOM_TYPE_CLEANFOOD, BomType.BOM_TYPE_PRODUCE],
      }).then((json) => {
        setSkuList(
          _.map(
            json.response.list_sku_v2_response?.skus,
            ({ sku_id, name }) => ({
              value: sku_id,
              label: name,
            }),
          ),
        )
        return null
      })
      return
    }

    ListSkuV2({
      filter_params: {
        sku_type: isPack && isMaterial ? undefined : Sku_SkuType.NOT_PACKAGE,
        q: value.trim(),
      },
      paging: { limit: 999 },
    }).then((json) => {
      setSkuList(
        _.map(json.response.skus, ({ sku_id, name }) => ({
          value: sku_id,
          label: name,
        })),
      )
      return null
    })
  }

  return (
    <Select
      style={{ minWidth: '100%' }}
      mode='multiple'
      showSearch
      maxTagCount={2}
      maxTagTextLength={4}
      value={isMaterial ? input_sku_ids_list : output_sku_ids_list}
      options={skuList}
      filterOption={false}
      placeholder={
        isMaterial
          ? taskCommandSearchType[1].desc
          : isPack
          ? t('输入包装成品名称搜索')
          : t('输入生产成品名称搜索')
      }
      onSearch={_.debounce((q: string) => handleSearch(q), 500)}
      onChange={(value: string[], option) => {
        isMaterial
          ? setInput_sku_ids_list(option as MoreSelectDataItem[])
          : setOutput_sku_ids_list(option as MoreSelectDataItem[])
        onChange(value)
      }}
    />
  )
}

export default SelectName
