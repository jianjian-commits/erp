import React, { FC, HTMLAttributes, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import {
  GetSkuReferencePrices,
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation,
  UnitValue,
} from 'gm_api/src/merchandise'
import classNames from 'classnames'
import globalStore from '@/stores/global'
import Big from 'big.js'
import { t } from 'gm-i18n'
import {
  ChildrenType,
  UnitOptions,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import { convertUnit } from '@/common/util'
import { Popover } from 'antd'
import { createPortal } from 'react-dom'
import BasicPriceTable from '@/pages/merchandise/components/edit_product_modal/popover/basic_price_table'
import PurchasePriceTable from '@/pages/merchandise/components/edit_product_modal/popover/purchase_price_table'
import StockInPriceTable from '@/pages/merchandise/components/edit_product_modal/popover/stock_in_table'
import SvgPriceReference from '@/svg/price-reference.svg'
import TrendDown from '@/svg/trend_down.svg'
import referencePriceMapStore from './store'

export interface ReferencePriceMapProps extends HTMLAttributes<HTMLDivElement> {
  type: keyof GetSkuReferencePricesResponse_ReferencePrices
  record: Pick<ChildrenType, 'parentId' | 'fee_unit_price' | 'order_unit_id'>
  list: Array<{
    sku_id: string
    /** 商品单价单位 */
    unit_id: string
    /** 下单单位 */
    order_unit_id: string
  }>
  quotation: Quotation
  arrowSelector?: string
  onClickTrend?: () => void
}

const ReferencePriceMap: FC<ReferencePriceMapProps> = observer(
  ({
    className,
    type,
    record,
    list,
    quotation,
    arrowSelector,
    onClickTrend,
  }) => {
    const records = list
      .filter((item) => item.order_unit_id && item.sku_id)
      .map((item) => {
        return {
          ...item,
          quotation_id: quotation.quotation_id,
          quotation_type: quotation.type,
        }
      })
    const placeholder = <div className='tw-pl-5'>-</div>

    useEffect(() => {
      if (!records.length || !quotation?.quotation_id) {
        console.warn('list and quotation can not be invalid')
        return
      }
      referencePriceMapStore.fetch({
        records,
      })
    }, [
      records
        .map((item) => JSON.stringify(Object.values(item).filter(Boolean)))
        .join(''),
      quotation,
    ])

    useEffect(() => {
      const update = () =>
        referencePriceMapStore.fetch({
          records,
        })
      addEventListener(
        'force_update|merchandise/price_manage/customer_quotation/components/reference_price_map/index.tsx',
        update,
      )
      return () => {
        removeEventListener(
          'force_update|merchandise/price_manage/customer_quotation/components/reference_price_map/index.tsx',
          update,
        )
      }
    }, [])

    const prices: GetSkuReferencePricesResponse_ReferencePrices =
      referencePriceMapStore.reference_price_map[
        `${quotation.quotation_id}-${record.parentId}-${record.fee_unit_price.unit_id}-${record.order_unit_id}`
      ]
    if (!prices) return placeholder
    let unitVal: UnitValue | undefined
    // unitVal = prices[type]?.[0]?.prices
    // if (!unitVal?.val) return placeholder
    // unitVal = unitVal && convertUnit(unitVal, record.fee_unit_price.unit_id)
    unitVal = prices[type]?.[0]?.to_fee_unit_price
    if (!unitVal?.val) return placeholder
    if (records.length === 0) {
      return placeholder
    }

    const unit =
      globalStore.getUnit(unitVal.unit_id) ||
      globalStore.getCustomUnit(record.parentId, unitVal.unit_id)

    return (
      <div className={classNames('tw-inline-block tw-relative', className)}>
        {createPortal(
          <Popover
            content={
              Big(record.fee_unit_price.val || 0).lt(
                Big(unitVal?.val || '0'),
              ) &&
              `商品单价低于${(() => {
                switch (type) {
                  case 'quotation_reference_prices':
                    return '最近报价'
                  case 'in_stock_reference_prices':
                    return '最近采购价'
                  case 'purchase_reference_prices':
                    return '最近采购价'
                  default:
                    return 'unknown'
                }
              })()}`
            }
          >
            <span
              className={classNames('tw-ml-3', {
                'tw-hidden':
                  !record.fee_unit_price.val ||
                  Big(record.fee_unit_price.val || 0).eq(
                    Big(unitVal.val || 0),
                  ) ||
                  Big(record.fee_unit_price.val || 0).gt(Big(unitVal.val || 0)),
              })}
            >
              {Big(record.fee_unit_price.val || 0).lt(
                Big(unitVal?.val || '0'),
              ) && (
                <TrendDown className='hover:tw-bg-blue-50 tw-cursor-pointer' />
              )}
            </span>
          </Popover>,
          document.querySelector(arrowSelector || 'INVALID VALUE') ||
            document.createElement('div'),
        )}

        <span>{unitVal?.val ? Big(unitVal.val).toFixed(2) : '-'}</span>
        <span>{t('元')}/</span>
        <span>{unit?.name || '-'}</span>

        {onClickTrend && (
          <Popover
            placement='bottomLeft'
            content={(() => {
              switch (type) {
                case 'quotation_reference_prices':
                  return (
                    <BasicPriceTable
                      skuId={record.parentId}
                      quotation={quotation}
                      reference_price={prices.quotation_reference_prices || []}
                      targetUnitId={record.fee_unit_price.unit_id}
                      onClick={() => onClickTrend && onClickTrend()}
                    />
                  )
                case 'purchase_reference_prices':
                  return (
                    <PurchasePriceTable
                      skuId={record.parentId}
                      reference_price={prices.purchase_reference_prices || []}
                      targetUnitId={record.fee_unit_price.unit_id}
                      onClick={() => onClickTrend && onClickTrend()}
                    />
                  )
                case 'in_stock_reference_prices':
                  return (
                    <StockInPriceTable
                      skuId={record.parentId}
                      reference_price={prices.in_stock_reference_prices || []}
                      targetUnitId={record.fee_unit_price.unit_id}
                      onClick={() => onClickTrend && onClickTrend()}
                    />
                  )
                default:
                  return <></>
              }
            })()}
            trigger='hover'
            arrowPointAtCenter
          >
            <SvgPriceReference
              className='referenct_price_icon tw-text-blue-500 tw-ml-1 tw-cursor-pointer hover:tw-bg-blue-50'
              onClick={() => {
                // onClickTrend && onClickTrend()
              }}
            />
          </Popover>
        )}
      </div>
    )
  },
)
export default ReferencePriceMap
