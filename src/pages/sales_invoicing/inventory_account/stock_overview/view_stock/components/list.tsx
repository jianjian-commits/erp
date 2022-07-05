import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Table } from '@gm-pc/table-x'
import { BoxTable, Price } from '@gm-pc/react'

import store from '../store'
import { SKU_TYPE_NAME } from '@/pages/sales_invoicing/enum'
import { getEndlessPrice, toFixed } from '@/common/util'

import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import moment from 'moment'
import Big from 'big.js'

const omissionMark = '-'

export interface TableData {
  isInit?: boolean
  isEditing?: boolean
  max_warning?: boolean
  min_warning?: boolean
  max_quantity?: null | number
  min_quantity?: null | number
}

const List: React.FC<{
  run: Function
  loading: boolean
  paging: { count?: number }
}> = observer((props) => {
  const { loading } = props
  const { list } = store
  const columns = [
    {
      Header: t('批次号'),
      accessor: 'batch_serial_no',
      Cell: (cellProps: any) => {
        const { batch_serial_no } = cellProps.row.original
        return batch_serial_no || '-'
      },
    },

    {
      Header: t('批次来源'),
      accessor: 'source_sheet_type',
      Cell: (cellProps: { row: { original: any } }) => {
        const { source_sheet_type } = cellProps.row.original

        return (
          <ToSheet
            source_type={source_sheet_type}
            serial_no=''
            sheet_id=''
            showName
          />
        )
      },
    },
    {
      Header: t('自定义编码'),
      accessor: 'customize_code',
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          skuInfo: {
            sku: { customize_code },
          },
        } = cellProps.row.original
        return customize_code || '-'
      },
    },
    {
      Header: t('商品名称'),
      accessor: 'sku_name',
      diyEnable: true,
      diyItemText: t('商品名称'),
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          skuInfo: {
            sku: { name },
          },
        } = cellProps.row.original
        return name || '-'
      },
    },
    {
      Header: t('是否包材'),
      accessor: 'sku_type',
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          skuInfo: {
            sku: { sku_type },
          },
        } = cellProps.row.original
        return SKU_TYPE_NAME[sku_type] || '-'
      },
    },
    {
      Header: t('商品分类'),
      accessor: 'category_infos',

      Cell: (cellProps: { row: { original: any } }) => {
        if (!cellProps.row.original?.skuInfo?.category_infos)
          return omissionMark
        const {
          skuInfo: { category_infos },
        } = cellProps.row.original

        return category_infos
          ?.map((item: { category_name: any }) => {
            return item.category_name
          })
          .filter(Boolean)
          .join('/')
      },
    },

    {
      Header: t('基础单位'),
      accessor: 'base_unit_name',
      Cell: (cellProps: { row: { original: any } }) => {
        const { base_unit_name } = cellProps.row.original

        return base_unit_name || '-'
      },
    },
    {
      Header: t('账面库存(基础单位)'),
      accessor: 'quantity',
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          base_unit_name,
          stock: {
            base_unit: { quantity },
          },
        } = cellProps.row.original

        return toFixed(quantity, 4) + base_unit_name || '-'
      },
    },
    {
      Header: t('账面库存(辅助单位)'),
      accessor: 'quantity',
      Cell: (cellProps: { row: { original: any } }) => {
        const { second_base_unit_quantity, second_base_unit_name } =
          cellProps.row.original

        return second_base_unit_quantity
          ? toFixed(second_base_unit_quantity, 4) + second_base_unit_name
          : '-'
      },
    },
    {
      Header: t('批次均价'),
      accessor: 'price',
      Cell: (cellProps: { row: { original: any } }) => {
        const { stock } = cellProps.row.original
        return (
          getEndlessPrice(Big(stock?.base_unit?.price)) + Price.getUnit() || '-'
        )
      },
    },
    {
      Header: t('生产日期'),
      accessor: 'production_time',
      Cell: (cellProps: { row: { original: any } }) => {
        const { production_time } = cellProps.row.original
        return production_time === '0'
          ? '-'
          : moment(+production_time).format('YYYY-MM-DD')
      },
    },
    // TODO:... 批次库存....
    {
      Header: t('商品等级'),
      accessor: 'sku_level_filed_id',
      Cell: (cellProps: { original: { sku_level_filed_id: any } }) => {
        const { sku_level_filed_id } = cellProps.original
        return <span>{sku_level_filed_id?.name || '-'}</span>
      },
    },
    {
      Header: t('供应商'),
      accessor: 'supplier_id',
      Cell: (cellProps: { original: { supplier_name: any } }) => {
        const { supplier_name } = cellProps.original
        return supplier_name
      },
    },
    {
      Header: t('采购员'),
      accessor: 'purchaser_id',
      Cell: (cellProps: { original: { purchaser_name: any } }) => {
        const { purchaser_name } = cellProps.original
        return purchaser_name
      },
    },
    {
      Header: t('过期日期'),
      accessor: 'expiry_time',
      Cell: (cellProps: { row: { original: any } }) => {
        const { expire_date } = cellProps.row.original

        return expire_date === '0'
          ? '-'
          : moment(+expire_date).format('YYYY-MM-DD')
      },
    },
  ]

  return (
    <BoxTable>
      <Table isDiy data={list.slice()} columns={columns} loading={loading} />
    </BoxTable>
  )
})

export default List
