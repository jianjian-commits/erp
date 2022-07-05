import React, { FC, useEffect, useState } from 'react'
import { Select } from 'antd'
import { t } from 'gm-i18n'
import { ListProductionLine, ProductionLine } from 'gm_api/src/production'

export interface SelectProductionLineProps {
  onChange: (value: ProductionLine) => void
  defaultValue?: string
}

const { Option } = Select

const SelectProductionLine: FC<SelectProductionLineProps> = (props) => {
  const { onChange, defaultValue } = props
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([])

  const fetchProductionLines = () => {
    return ListProductionLine().then((res) => {
      const lines = res.response.production_lines
      setProductionLines(lines)
    })
  }

  useEffect(() => {
    fetchProductionLines()
  }, [])

  const handleChange = (value: string) => {
    const line = productionLines.find((f) => f.production_line_id === value)
    if (onChange) onChange(line as ProductionLine)
  }

  return (
    <Select
      // showSearch
      allowClear
      style={{ width: 200 }}
      placeholder={t('请选择产线')}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      value={defaultValue}
      onChange={handleChange}
      onDropdownVisibleChange={(open) => open && fetchProductionLines()}
    >
      {productionLines.map((item) => (
        <Option key={item.production_line_id} value={item.production_line_id}>
          {item.name}
        </Option>
      ))}
    </Select>
  )
}

export default SelectProductionLine
