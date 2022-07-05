import React, { FC, HTMLAttributes, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  GetSkuReferencePricesRequest_Filter,
  GetSkuReferencePricesResponse_ReferencePrices,
  UnitValue,
} from 'gm_api/src/merchandise'
import classNames from 'classnames'
import globalStore from '@/stores/global'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { ChildrenType } from '@/pages/merchandise/price_manage/customer_quotation/data'
import { convertUnit } from '@/common/util'
import { Popover } from 'antd'
import { createPortal } from 'react-dom'
import BasicPriceTable from '@/pages/merchandise/components/edit_product_modal/popover/basic_price_table'
import PurchasePriceTable from '@/pages/merchandise/components/edit_product_modal/popover/purchase_price_table'
import StockInPriceTable from '@/pages/merchandise/components/edit_product_modal/popover/stock_in_table'
import SvgPriceReference from '@/svg/price-reference.svg'
import SvgFall from '@/svg/trend_down.svg'
import orderReferencePriceMapStore from './store'
import { openProductPriceChartModal } from '@/pages/merchandise/components/edit_product_modal/chart'

export interface OrderReferencePriceMapProps
  extends HTMLAttributes<HTMLDivElement> {
  type: keyof GetSkuReferencePricesResponse_ReferencePrices
  record: {
    parentId: string
    fee_unit_price: {
      val: string
      unit_id: string
    }
    order_unit_id: string
    skuName: string
  }
  arrowSelector?: string
}

const OrderReferencePriceMap: FC<OrderReferencePriceMapProps> = observer(
  ({ className, type, record, arrowSelector }) => {
    const placeholder = <div className='tw-pl-5'>-</div>

    useEffect(() => {
      orderReferencePriceMapStore.fetch({
        record,
      })
    }, [record])

    useEffect(() => {
      const update = () =>
        orderReferencePriceMapStore.fetch({
          record,
        })
      addEventListener(
        'force_update|order/order_manage/components/order_reference_price_map/index.tsx',
        update,
      )
      return () => {
        removeEventListener(
          'force_update|order/order_manage/components/order_reference_price_map/index.tsx',
          update,
        )
      }
    }, [])

    const prices: GetSkuReferencePricesResponse_ReferencePrices =
      orderReferencePriceMapStore.reference_price_map[
        `0-${record.parentId}-${record.order_unit_id}-${record.order_unit_id}`
      ]
    if (!prices) return placeholder
    let unitVal: UnitValue | undefined
    // unitVal = prices[type]?.[0]?.prices
    // if (!unitVal?.val) return placeholder
    // unitVal = unitVal && convertUnit(unitVal, record.order_unit_id)
    unitVal = prices[type]?.[0]?.to_fee_unit_price
    if (!unitVal?.val) return placeholder
    const unit =
      globalStore.getUnit(unitVal.unit_id) ||
      globalStore.getCustomUnit(record.parentId, unitVal.unit_id)

    const onClick = () => {
      switch (type) {
        case 'in_stock_reference_prices':
          openProductPriceChartModal({
            title: record.skuName + '-历史入库价',
            type,
            sku_unit_filter: {
              sku_id: record.parentId,
              order_unit_id: record.order_unit_id,
              unit_id: record.order_unit_id,
            },
          })
          break
        case 'purchase_reference_prices':
          openProductPriceChartModal({
            title: record.skuName + '-历史采购价',
            type,
            sku_unit_filter: {
              sku_id: record.parentId,
              order_unit_id: record.order_unit_id,
              unit_id: record.order_unit_id,
            },
          })
          break
        case 'quotation_reference_prices':
          openProductPriceChartModal({
            title: record.skuName + '-历史报价',
            type,
            sku_unit_filter: {
              sku_id: record.parentId,
              order_unit_id: record.order_unit_id,
              unit_id: record.order_unit_id,
            },
          })
          break
        default:
      }
    }

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
              ) && <SvgFall className='hover:tw-bg-blue-50' />}
            </span>
          </Popover>,
          document.querySelector(arrowSelector || 'INVALID VALUE') ||
            document.createElement('div'),
        )}

        <span>{unitVal?.val ? Big(unitVal.val).toString() : '-'}</span>
        <span>{t('元')}/</span>
        <span>{unit.name || '-'}</span>

        <Popover
          placement='bottomLeft'
          zIndex={1044}
          content={(() => {
            switch (type) {
              // case 'quotation_reference_prices':
              //   return (
              //     <BasicPriceTable
              //       quotation={quotation}
              //       reference_price={prices.quotation_reference_prices || []}
              //       targetUnitId={record.fee_unit_price.unit_id}
              //       onClick={onClick}
              //     />
              //   )
              case 'purchase_reference_prices':
                return (
                  <PurchasePriceTable
                    skuId={record.parentId}
                    reference_price={prices.purchase_reference_prices || []}
                    targetUnitId={record.fee_unit_price.unit_id}
                    onClick={onClick}
                  />
                )
              case 'in_stock_reference_prices':
                return (
                  <StockInPriceTable
                    skuId={record.parentId}
                    reference_price={prices.in_stock_reference_prices || []}
                    targetUnitId={record.fee_unit_price.unit_id}
                    onClick={onClick}
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
            // onClick={onClick}
          />
        </Popover>
      </div>
    )
  },
)
export default OrderReferencePriceMap
