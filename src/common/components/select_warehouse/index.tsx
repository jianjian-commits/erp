import React, { FC, useState } from 'react'
import { Warehouse, ListWarehouseResponse } from 'gm_api/src/inventory'
import { Select_Warehouse, MoreSelect_Warehouse } from 'gm_api/src/inventory/pc'
import type {
  SelectProps,
  MoreSelectProps,
  MoreSelectDataItem,
} from '@gm-pc/react'
import _ from 'lodash'

type SelectWarehouseProps = Omit<
  SelectProps<string | undefined>,
  'data' | 'renderItem' | 'renderSelected'
> & {
  getListData?: (list: Warehouse[]) => void
  all?: boolean
}

const Select_WareHouse_Default: FC<SelectWarehouseProps> = ({
  value,
  onChange,
  getListData,
  all = false,
  style,
  ...rest
}) => {
  const [defaultValue, setDefaultValue] = useState<string>('')

  const getResponseData = (response: ListWarehouseResponse) => {
    const warehouses: Warehouse[] = response?.warehouses
    const defaultId = warehouses.find((t) => t.warehouse_id)?.warehouse_id ?? ''
    setDefaultValue(defaultId)
    // 向上传递list, 避免列表多一次请求
    getListData && getListData(warehouses)

    // 默认展示全部则不传递默认值
    if (!all) {
      !value && onChange && onChange(defaultId)
    }

    return warehouses
  }

  const handleChange = (value: string) => {
    onChange && onChange(value)
    setDefaultValue(value)
  }
  // 默认为default
  const _value = all ? value : value || defaultValue

  return (
    <>
      <Select_Warehouse
        all={all}
        style={{
          maxWidth: '280px',
          ...style,
        }}
        value={_value as string}
        onChange={handleChange}
        getResponseData={getResponseData}
        {...rest}
      />
    </>
  )
}

export default Select_WareHouse_Default

type MoreSelectWarehouseSelectedProps = Omit<
  MoreSelectProps<string>,
  'data' | 'renderItem' | 'renderSelected' | 'renderListItem'
> & {
  getListData?: (list: Warehouse[]) => void
}

const MoreSelect_Warehouse_Selected: FC<MoreSelectWarehouseSelectedProps> = ({
  selected,
  onChange,
  getListData,
  ...rest
}) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const getResponseData = (response: ListWarehouseResponse) => {
    const warehouses: Warehouse[] = response?.warehouses
    setWarehouses(warehouses)
    // 向上传递list, 避免列表多一次请求
    getListData && getListData(warehouses)

    return warehouses
  }
  const handleChange = (value: string[]) => {
    onChange && onChange(value)
  }

  const getValueText = () => {
    const result: MoreSelectDataItem[] = []
    _.forEach(selected, (id) => {
      const target = warehouses.find((i) => i.warehouse_id === id)
      if (target) {
        result.push({
          value: `${id}`,
          text: target.name,
        })
      }
    })
    return result
  }

  return (
    <>
      <MoreSelect_Warehouse
        selected={getValueText()}
        onChange={handleChange}
        getResponseData={getResponseData}
        {...rest}
        multiple
      />
    </>
  )
}

export { MoreSelect_Warehouse_Selected }
