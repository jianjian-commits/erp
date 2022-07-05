import React, { FC, useState } from 'react'
import { ListBomSku } from 'gm_api/src/production'
import _ from 'lodash'
import { Sku_Bom_Type, Select_BOM_Type } from './enum'
import { Select } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'

interface Props {
  bomType: Select_BOM_Type
  selectData: DefaultOptionType[]
  onChange: (value: DefaultOptionType[]) => void
}

const ProductionSelectName: FC<Props> = ({ bomType, selectData, onChange }) => {
  const [skuList, setSkuList] = useState<DefaultOptionType[]>([])
  const bomInfo = Sku_Bom_Type[bomType]

  const handleSearch = (value: string) => {
    if (!value) {
      return
    }

    ListBomSku({
      list_sku_v2_request: {
        filter_params: {
          q: value,
        },
        paging: { limit: 999 },
      },
      bom_types: bomInfo.value,
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
  const handleSelect = (
    value: DefaultOptionType[],
    Option: DefaultOptionType[] | DefaultOptionType,
  ) => {
    onChange(Option as DefaultOptionType[])
  }

  return (
    <Select
      showSearch
      mode='multiple'
      style={{ width: '100%' }}
      options={skuList}
      value={selectData}
      filterOption={false}
      onSearch={_.debounce((q: string) => handleSearch(q), 500)}
      onChange={handleSelect}
      placeholder={bomInfo.text}
      maxTagCount={2}
      maxTagTextLength={3}
    />
  )
}

export default ProductionSelectName
