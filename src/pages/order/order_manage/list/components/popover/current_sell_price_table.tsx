import React, { FC, HTMLAttributes } from 'react'
import { observer } from 'mobx-react'
import { Table } from 'antd'
import referenceStore from '@/pages/order/order_manage/store/reference'
import { GetSalePriceDataResponse_SaleReferencePrice } from 'gm_api/src/order'
import moment from 'moment'
import Big from 'big.js'
import { convertUnit } from '@/common/util'
import globalStore from '@/stores/global'
import { SkuDetail } from '@/pages/order/interface'
import { Unit } from 'gm_api/src/merchandise'

export interface CurrentSellPriceTableProps
  extends HTMLAttributes<HTMLDivElement> {
  sale_reference_prices: GetSalePriceDataResponse_SaleReferencePrice[]
  skuUnit: Unit
}

const CurrentSellPriceTable: FC<CurrentSellPriceTableProps> = observer(
  ({ className, sale_reference_prices = [], skuUnit, onClick }) => {
    const columns = [
      {
        title: '下单日期',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: '下单数',
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: '单价',
        dataIndex: 'price',
        key: 'price',
      },
    ]
    const dataSource = sale_reference_prices.map((item, i) => {
      const _unitVal = item.prices?.price
      let unitVal
      let unit
      if (_unitVal?.unit_id === skuUnit?.unit_id) {
        unitVal = _unitVal
        unit = skuUnit
      } else {
        unitVal =
          _unitVal &&
          convertUnit(_unitVal, skuUnit?.unit_id || _unitVal.unit_id)
        unit = globalStore.getUnit(unitVal?.unit_id!)
      }
      return {
        key: i,
        date: moment(+item.time!).format('YYYY-MM-DD'),
        quantity: item.prices?.quantity?.val || '-',
        price: `${unitVal?.val}元/${unit?.name}`,
      }
    })
    return (
      <div className='tw-text-center'>
        <div className='tw-font-bold tw-text-base tw-text-left tw-mb-2'>
          最近销售价数据
        </div>
        <Table
          style={{ minWidth: 600 }}
          pagination={false}
          dataSource={dataSource}
          columns={columns}
        />
        <div className='tw-mt-2'>
          <a onClick={() => onClick && onClick()}>
            查看更多数据 {'>'}
            {'>'}
          </a>
        </div>
      </div>
    )
  },
)
export default CurrentSellPriceTable
