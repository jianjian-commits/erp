import React from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import { getEndlessPrice, toFixedSalesInvoicing } from '@/common/util'
import { getHeathlyTag } from '@/pages/sales_invoicing/inventory_account/stock_overview/inventory_overview/put_in_storage/list'
import { changeLogNum, showUnitText } from '@/pages/sales_invoicing/util'
import { TableXUtil } from '@gm-pc/table-x'

const omissionMark = '-'

const columnsSpuDetail = [
  {
    Header: t('规格'),
    Cell: (cellProps) => {
      const { ssu_info, sku_id, sku_unit_id, ssu_base_unit_name, expire_type } =
        cellProps.row.original
      const showText = showUnitText(ssu_info, ssu_base_unit_name)
      return (
        <Flex>
          <div>
            <a
              className='gm-text-primary gm-cursor'
              href={`#/sales_invoicing/inventory_account/stock_overview/inventory_overview/put_in_storage?sku_id=${sku_id}&sku_unit_id=${sku_unit_id}`}
            >
              {showText}
            </a>
          </div>
          {getHeathlyTag(expire_type)}
        </Flex>
      )
    },
  },
  {
    Header: t('账面库存(基本单位)'),
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        stock: { base_unit },
        base_unit_name,
      } = cellProps.row.original
      return (
        toFixedSalesInvoicing(Big(base_unit.quantity)) + `${base_unit_name}`
      )
    },
  },
  /** 商品改造弃掉包装单位 */
  // {
  //   Header: t('账面库存(包装单位(废弃))'),
  //   Cell: (cellProps: { row: { original: any } }) => {
  //     const {
  //       stock: { sku_unit },
  //       ssu_info,
  //     } = cellProps.row.original
  //     let unit_name = '-'
  //     if (ssu_info) unit_name = ssu_info?.ssu?.unit?.name
  //     return ssu_info
  //       ? toFixedSalesInvoicing(Big(sku_unit.quantity)) + `${unit_name}`
  //       : unit_name
  //   },
  // },
  {
    Header: t('库存均价'),
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        stock: {
          base_unit: { price },
        },
      } = cellProps.row.original
      return getEndlessPrice(Big(price), true) + Price.getUnit()
    },
  },
  {
    Header: t('账面货值'),
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        stock: { base_unit },
      } = cellProps.row.original
      return (
        changeLogNum({
          unit: base_unit,
          type: 'goodsValue',
        }) + Price.getUnit()
      )
    },
  },
  {
    Header: t('查看商品台账'),
    accessor: 'operation',
    Cell: (cellProps: { row: { original: any } }) => {
      const { sku_id, sku_unit_id } = cellProps.row.original
      return (
        <TableXUtil.OperationCell>
          <TableXUtil.OperationDetail
            href={`#/sales_invoicing/inventory_account/commodity_ledger?sku_id=${sku_id}&unit_id=${sku_unit_id}`}
          />
        </TableXUtil.OperationCell>
      )
    },
  },
]

export default columnsSpuDetail
