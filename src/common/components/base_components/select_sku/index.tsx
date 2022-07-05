import React, { FC, useState } from 'react'
import { Select } from 'antd'
import { SelectSkuProps } from '../data'
import { t } from 'gm-i18n'
import {
  ListSkuV2,
  Sku,
  Sku_SkuType,
  map_Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'

const { Option } = Select

const SelectSku: FC<SelectSkuProps> = (props) => {
  const { onChange } = props
  const [skuList, setSkuList] = useState<Sku[]>([])
  const [value, setValue] = useState('')

  const fetchSkuList = (value: string) => {
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
      const skus = res.response.skus || []
      setSkuList(skus)
    })
  }

  const handleSearch = (value: string) => {
    fetchSkuList(value)
  }

  const handleChange = (value: string) => {
    setValue(value)
    const sku = skuList.find((f) => f.sku_id === value)
    if (onChange) onChange(sku as Sku)
  }

  return (
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder={t('请选择商品')}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      value={value}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={null}
    >
      {skuList.map((item) => (
        <Option key={item.sku_id} value={item.sku_id}>
          {`${
            map_Sku_NotPackageSubSkuType[item.not_package_sub_sku_type || '']
          }-${item.name}`}
        </Option>
      ))}
    </Select>
  )
}

export default SelectSku
