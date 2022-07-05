import React, { useState, FC } from 'react'
import { Select, Flex } from '@gm-pc/react'
import ProductionSelectName from './production_select_name'
import { t } from 'gm-i18n'
import { List_Drop_Type, Select_BOM_Type } from './enum'
import { Input } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'

interface Props {
  value: {
    serial_no: string
    skuSelect: DefaultOptionType[]
  }
  bomType: Select_BOM_Type
  onChange: (key: any, v: any) => void
}

const ProductionDropFilter: FC<Props> = ({
  value: { serial_no, skuSelect },
  bomType,
  onChange,
}) => {
  const [selected, setSelected] = useState(1)

  const handleSelect = (value: number) => {
    setSelected(value)
    onChange('selected', value)
  }
  const handleChange = (value: string | DefaultOptionType[]) => {
    onChange(selected === 2 ? 'serial_no' : 'skuSelect', value)
  }

  return (
    <Flex>
      <div className='gm-padding-right-5'>
        <Select
          clean
          style={{ minWidth: 100 }}
          className='gm-inline-block'
          data={List_Drop_Type(bomType === Select_BOM_Type.pack)}
          value={selected}
          onChange={handleSelect}
        />
      </div>
      <Flex flex>
        {selected === 2 ? (
          <Input
            className='gm-inline-block form-control'
            value={serial_no}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t('输入需求编号搜索')}
          />
        ) : (
          <ProductionSelectName
            onChange={handleChange}
            bomType={bomType}
            selectData={skuSelect}
          />
        )}
      </Flex>
    </Flex>
  )
}

export default ProductionDropFilter
