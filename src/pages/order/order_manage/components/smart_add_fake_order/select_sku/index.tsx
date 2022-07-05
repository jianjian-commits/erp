import { Select, SelectProps, Spin } from 'antd'
import React, { useMemo, useState } from 'react'
import _ from 'lodash'
import searchSku from './search'
import { DetailListItem } from '@/pages/order/order_manage/components/interface'

interface SelectSkuProps extends Omit<SelectProps, 'value' | 'onChange'> {
  /** 报价单 id */
  quotationId: string
  /** 客户 id */
  customerId: string
  onChange?: (sku: DetailListItem) => void
}

const { Option } = Select

/** 搜索报价单中的商品 */
const SelectSku: React.VFC<SelectSkuProps> = (props) => {
  const { customerId, quotationId, onChange, ...rest } = props

  const [list, setList] = useState<DetailListItem[]>([])
  const [loading, setLoading] = useState(false)
  const onSearch = useMemo(() => {
    return _.debounce((keyword: string) => {
      if (!keyword) {
        return
      }
      setLoading(true)
      searchSku({ keyword, customerId, quotationId })
        .then((res) => {
          setList(res)
        })
        .finally(() => setLoading(false))
    }, 300)
  }, [customerId, quotationId])

  const handleChange = (e: string) => {
    const index = _.findIndex(list, (item) => `${item.sku_id}` === `${e}`)
    if (index >= 0) {
      onChange && onChange(list[index])
    }
  }

  return (
    <Select
      {...rest}
      filterOption={false}
      showSearch
      showArrow={false}
      onSearch={onSearch}
      notFoundContent={loading ? <Spin size='small' /> : null}
      onChange={handleChange}
    >
      {_.map(list, (item) => (
        <Option key={item.sku_id} value={item.sku_id}>
          {item.name}
        </Option>
      ))}
    </Select>
  )
}

export default SelectSku
