import React, { FC, HTMLAttributes } from 'react'
import { observer } from 'mobx-react'
import { Table } from 'antd'
import {
  GetSkuReferencePricesResponse_QuotationReferencePrice,
  GetSkuReferencePricesResponse_ReferencePrices,
  GetSkuReferencePricesResponse_PurchaseReferencePrice,
  Quotation,
  UnitValue,
} from 'gm_api/src/merchandise'
import { convertUnit } from '@/common/util'
import globalStore from '@/stores/global'
import Big from 'big.js'
import { t } from 'gm-i18n'
import moment from 'moment'

export interface PurchasePriceTableProps
  extends HTMLAttributes<HTMLDivElement> {
  reference_price: GetSkuReferencePricesResponse_PurchaseReferencePrice[]
  targetUnitId: string
  skuId: string
}

const PurchasePriceTable: FC<PurchasePriceTableProps> = observer(
  ({ className, reference_price, skuId, targetUnitId, onClick }) => {
    const columns = [
      {
        title: '日期',
        dataIndex: 'time',
        key: 'time',
      },
      {
        title: '供应商',
        dataIndex: 'supplier_name',
        key: 'supplier_name',
      },
      {
        title: '商品单价',
        dataIndex: 'price',
        key: 'price',
      },
    ]
    const dataSource = reference_price.map((item, i) => {
      let unitVal: UnitValue | undefined
      unitVal = item.prices
      // unitVal =
      //   unitVal && convertUnit(unitVal, globalStore.getUnit(targetUnitId))
      // if (!unitVal?.val) return <span>-</span>
      unitVal = item.to_fee_unit_price
      if (!unitVal?.val) return <span>-</span>
      const unit =
        globalStore.getUnit(unitVal.unit_id) ||
        globalStore.getCustomUnit(skuId, unitVal.unit_id)
      return {
        key: i,
        time: (
          <div className='tw-flex tw-flex-col tw-justify-center'>
            {moment(+item.time!).format('YYYY-MM-DD')}
          </div>
        ),
        supplier_name: item.supplier_name,
        price: (
          <div>
            <span>{unitVal?.val ? Big(unitVal.val).toFixed(2) : '-'}</span>
            <span>{t('元')}/</span>
            <span>{unit?.name || '-'}</span>
          </div>
        ),
      }
    })
    return (
      <div className='tw-text-center'>
        <div className='tw-font-bold tw-text-base tw-text-left tw-mb-2'>
          最近采购价数据
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
export default PurchasePriceTable
