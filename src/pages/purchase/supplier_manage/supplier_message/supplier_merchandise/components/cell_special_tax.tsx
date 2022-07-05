import React, { useState, FC } from 'react'
import { observer, Observer } from 'mobx-react'
import { Flex, InputNumber, Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../store/store'
const data = [
  {
    value: 0,
    text: '设置',
  },
  { value: 1, text: '未设置' },
]
interface CellSpecialTaxProps {
  index: number
  supplier_id: string
}
const CellSpecialTax: FC<CellSpecialTaxProps> = observer(
  ({ supplier_id, index }) => {
    const { list, setSupplierTax } = store
    const [value, setValue] = useState<number>(0)
    const [tax, setTax] = useState<string | null>(
      list[index].supplier_input_taxs?.supplier_input_tax?.[supplier_id] ??
        null,
    )
    const handleChange = (value: number) => {
      if (value === 1) {
        const taxMap = { [supplier_id]: '' }
        setSupplierTax(taxMap)
      }
      setValue(value)
    }

    const handelTaxInput = (value: number | null) => {
      setTax(value === null ? null : '' + value)
      const taxMap = {
        [supplier_id]: '' + value,
      }
      setSupplierTax(taxMap)
    }

    return (
      <Flex alignCenter>
        <Select
          className='tw-w-20 tw-mr-1'
          data={data}
          value={value}
          onChange={(value) => {
            handleChange(value)
          }}
        />
        {value === 0 && (
          <Observer>
            {() => {
              return (
                <InputNumber
                  precision={0}
                  value={tax === null ? null : +tax}
                  min={0}
                  max={100}
                  placeholder={t('请输入税率')}
                  onChange={(value) => {
                    handelTaxInput(value)
                  }}
                />
              )
            }}
          </Observer>
        )}
      </Flex>
    )
  },
)
export default CellSpecialTax
