import React, { FC, useState } from 'react'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { BomType, ListBomSku } from 'gm_api/src/production'
import { Sku_SkuType, ListSkuV2 } from 'gm_api/src/merchandise'
import { taskCommandSearchType } from '../enum'
import _ from 'lodash'

interface Props {
  selectData: MoreSelectDataItem<string>
  isMaterial?: boolean
  onChange: (value: MoreSelectDataItem<string>) => void
  isPack?: boolean
}

const SelectName: FC<Props> = ({
  isPack,
  isMaterial,
  selectData,
  onChange,
}) => {
  const [skuList, setSkuList] = useState<MoreSelectDataItem<string>[]>([])

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
              text: name,
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
          text: name,
        })),
      )
      return null
    })
  }

  const handleSelect = (value: MoreSelectDataItem<string>) => {
    selectData = value
    onChange(value)
  }

  return (
    <MoreSelect
      style={{ width: '100%' }}
      data={skuList}
      selected={selectData}
      onSearch={handleSearch}
      onSelect={handleSelect}
      placeholder={
        isMaterial
          ? taskCommandSearchType[1].desc
          : taskCommandSearchType[0].desc
      }
    />
  )
}

export default SelectName
