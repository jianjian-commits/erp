import React, { FC, HTMLAttributes } from 'react'
import { observer } from 'mobx-react'
import { Table } from 'antd'
import {
  GetSkuReferencePricesResponse_QuotationReferencePrice,
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation,
  Quotation_Type,
  UnitValue,
} from 'gm_api/src/merchandise'
import { convertUnit } from '@/common/util'
import globalStore from '@/stores/global'
import Big from 'big.js'
import { t } from 'gm-i18n'
import moment from 'moment'

export interface BasicPriceTableProps extends HTMLAttributes<HTMLDivElement> {
  quotation: Quotation
  reference_price: GetSkuReferencePricesResponse_QuotationReferencePrice[]
  skuId: string
  targetUnitId: string
}

const BasicPriceTable: FC<BasicPriceTableProps> = observer(
  ({ className, reference_price, skuId, targetUnitId, quotation, onClick }) => {
    const columns = [
      {
        title: quotation.type === Quotation_Type.PERIODIC ? '周期' : '日期',
        dataIndex: 'quotation_name',
        key: 'quotation_name',
      },
      {
        title: '商品单价',
        dataIndex: 'price',
        key: 'price',
      },
    ]
    const dataSource = reference_price.map((item, i) => {
      let unitVal: UnitValue | undefined
      // unitVal = item.prices
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
        quotation_name: (
          <div className='tw-flex tw-flex-col tw-justify-center'>
            {quotation.type === Quotation_Type.PERIODIC
              ? item.quotation_name
              : moment(+item.time!).format('YYYY-MM-DD')}
          </div>
        ),
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
          最近报价数据
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
export default BasicPriceTable
