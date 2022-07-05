import React, { FC, MouseEventHandler, memo } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { TableXUtil } from '@gm-pc/table-x'
import { Modal, Flex, Button, Price } from '@gm-pc/react'
import { history } from '@/common/service'
import {
  getUnNillText,
  toFixedSalesInvoicing,
  getEndlessPrice,
  toFixed,
} from '@/common/util'
import Descriptions from 'antd/lib/descriptions'
import type { SkuStock_WarehouseStock } from 'gm_api/src/inventory'
import { TableColumns, SkuStockExpand } from '@/pages/sales_invoicing/interface'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import globalStore from '@/stores/global'
import store from '../../stores/store'
import { changeLogNum } from '@/pages/sales_invoicing/util'
import { quoteCommonColumn } from '@/pages/sales_invoicing/common_column_enum'

const { OperationCell, OperationDetail } = TableXUtil
const omissionMark = '-'

interface DistributionProps {
  housewareStock: SkuStock_WarehouseStock[]
}

const Distribution: FC<DistributionProps> = memo(
  observer(({ housewareStock }) => {
    const showDetail: MouseEventHandler<HTMLAnchorElement> = (event) => {
      event.preventDefault()
      Modal.render({
        children: (
          <>
            <Descriptions bordered column={1} size='small'>
              {_.map(
                housewareStock,
                (warehouseStock: SkuStock_WarehouseStock) => {
                  const { stock, warehouse_id } = warehouseStock
                  const warehouse = store.getWarehouseById(warehouse_id!)
                  const quantity = stock?.base_unit?.quantity!
                  const unit_id = stock?.base_unit?.unit_id!
                  return (
                    <Descriptions.Item
                      label={warehouse.name}
                      key={warehouse_id}
                    >
                      {`${toFixedSalesInvoicing(
                        quantity,
                      )}${globalStore.getUnitName(unit_id)}`}
                    </Descriptions.Item>
                  )
                },
              )}
            </Descriptions>
            <Flex justifyCenter>
              <Button
                type='primary'
                className='gm-margin-top-15'
                onClick={() => Modal.hide()}
              >
                {t('确定')}
              </Button>
            </Flex>
          </>
        ),
        title: '查看详情',
      })
    }
    return (
      <>
        <div>
          {_.map(housewareStock.slice(0, 2), (warehouseStock) => {
            const { warehouse_id } = warehouseStock
            const warehouse = store.getWarehouseById(warehouse_id!)
            return getUnNillText(warehouse?.name)
          }).join(';')}
        </div>
        {housewareStock.length > 1 && (
          <a href='##' onClick={showDetail}>
            {t('查看详情')}
          </a>
        )}
      </>
    )
  }),
)

const SpDetails = [
  {
    Header: t('库存数量（基本单位）'),
    Cell: (cellProps: TableColumns<SkuStockExpand>) => {
      const { stock, base_unit_name } = cellProps.original
      return (
        toFixedSalesInvoicing(Big(stock?.base_unit?.quantity! || 0)) +
        `${base_unit_name}`
      )
    },
  },
  {
    Header: t('库存数量（辅助单位）'),
    Cell: (cellProps: TableColumns<SkuStockExpand>) => {
      const { second_base_unit_name, second_base_unit_quantity } =
        cellProps.original
      return second_base_unit_quantity
        ? toFixed(second_base_unit_quantity, 4) + second_base_unit_name
        : '-'
    },
  },
  quoteCommonColumn(
    'MUTI_UNIT_DISPLAY',
    { type: 'overview' },
    {
      Header: t('多单位数量汇总'),
    },
  ),
  {
    Header: t('库存分布'),
    // 是选择全部时
    show: !(store.filter?.warehouse_ids && store.filter?.warehouse_ids[0]),
    Cell: (cellProps: TableColumns<SkuStockExpand>) => {
      const { warehouse_stock } = cellProps.original
      return <Distribution housewareStock={warehouse_stock} />
    },
  },
  {
    Header: t('账面货值'),
    Cell: (cellProps: TableColumns<SkuStockExpand>) => {
      const { stock } = cellProps.original
      const base_unit = stock?.base_unit
      return (
        changeLogNum({
          unit: base_unit,
          type: 'goodsValue',
        }) + Price.getUnit()
      )
    },
  },
  {
    Header: t('本期成本价'),
    Cell: (cellProps: TableColumns<SkuStockExpand>) => {
      const { stock } = cellProps.original
      const price = +stock?.base_unit?.price!
      return getEndlessPrice(Big(price), true) + Price.getUnit()
    },
  },
  {
    Header: t('查看台账'),
    Cell: (cellProps: TableColumns<SkuStockExpand>) => {
      if (!cellProps.original.stock_remain_warning) return omissionMark
      const { sku_id } = cellProps.original
      return (
        <OperationCell>
          <OperationDetail
            onClick={() =>
              history.push(
                `/sales_invoicing/inventory_account/commodity_ledger?sku_id=${sku_id}`,
              )
            }
          />
        </OperationCell>
      )
    },
  },
]

export default SpDetails
