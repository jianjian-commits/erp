import React from 'react'
import { t } from 'gm-i18n'
import SaftyStockCell from '../safty_stock_cell'
import { Price } from '@gm-pc/react'
import { getEndlessPrice, toFixedSalesInvoicing } from '@/common/util'
import Big from 'big.js'
import { TableXUtil } from '@gm-pc/table-x'
import {
  OperationCellRowEdit,
  OperationHeader,
} from '@gm-pc/table-x/src/components/operation'
import { Observer } from 'mobx-react'
import globalStore from '@/stores/global'
import { changeLogNum } from '@/pages/sales_invoicing/util'
import { quoteCommonColumn } from '@/pages/sales_invoicing/common_column_enum'

const omissionMark = '-'

type LsProps = {
  hasEditing: boolean
  toggle: Function
  save: Function
  cancel: Function
  set: Function
}

const getBaseColumn = (ls: LsProps, getRow: Function) => {
  return [
    {
      Header: t('安全库存'),
      hide: globalStore.isLite,
      minWidth: ls.hasEditing ? 1.5 : 1,
      Cell: (cellProps) => {
        if (!cellProps.row.original.stock_remain_warning) return omissionMark
        const { sku_id } = cellProps.row.original
        const row = getRow(sku_id)
        return (
          <SaftyStockCell
            row={row}
            data={cellProps.row.original}
            set={ls.set}
          />
        )
      },
    },
    {
      Header: t('账面库存'),
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
    quoteCommonColumn(
      'MUTI_UNIT_DISPLAY',
      { type: 'overview' },
      {
        Header: t('多单位数量汇总'),
      },
    ),
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
      id: 'action',
      fixed: 'right',
      hide: globalStore.isLite,
      diyEnable: true,
      diyItemText: t('操作'),
      width: TableXUtil.TABLE_X.WIDTH_OPERATION,
      Header: OperationHeader,
      Cell: (cellProps) => {
        const { sku_id } = cellProps.original
        return (
          <Observer>
            {() => {
              const row = getRow(sku_id)
              return (
                <OperationCellRowEdit
                  isEditing={!!row?.isEditing}
                  onClick={() => {
                    ls.toggle(sku_id)
                  }}
                  onCancel={() => {
                    ls.cancel(sku_id)
                  }}
                  onSave={() => {
                    ls.save(sku_id)
                  }}
                />
              )
            }}
          </Observer>
        )
      },
    },
  ]
}

export default getBaseColumn
