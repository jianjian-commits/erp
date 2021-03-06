import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import React, { FC, useContext, useMemo } from 'react'
import { Flex, Price } from '@gm-pc/react'

import SelectedTableAdd from '@/common/components/icon/selected_table_add'
import { BatchData } from './util'
import { Batch_BatchType } from 'gm_api/src/inventory'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import {
  getEndlessPrice,
  getFormatTimeForTable,
  toFixedSalesInvoicing,
} from '@/common/util'
import { BatchSelectContext } from './batch_select'
import Big from 'big.js'
import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'

const { OperationHeader } = TableXUtil

interface SelectedTableProps {
  data: BatchData[]
  onInputChange: (
    id: string,
    name:
      | 'sku_base_quantity'
      | 'ssu_quantity'
      | 'sku_base_quantity_show'
      | 'ssu_quantity_show',
    value: number | null,
  ) => void
  onAdd: (data: BatchData) => void
}

interface BaseQuantityProps extends Pick<SelectedTableProps, 'onInputChange'> {
  data: BatchData
}

const BaseQuantityNumber: FC<BaseQuantityProps> = ({ data, onInputChange }) => {
  const { selectKey, needInputLimit, type } = useContext(BatchSelectContext)
  const {
    sku_base_quantity_show,
    sku_base_unit_name,
    [selectKey]: id,
    sku_stock_base_quantity,
    sku_base_material_out,
  } = data

  let max: number
  if (needInputLimit) {
    max =
      type === 'refund_stock_in'
        ? sku_base_material_out!
        : +sku_stock_base_quantity
  }
  return (
    <Flex alignCenter>
      <PrecisionInputNumber
        precisionType='salesInvoicing'
        value={sku_base_quantity_show!}
        onChange={(value) => {
          onInputChange(id as any, 'sku_base_quantity', value)
          onInputChange(id as any, 'sku_base_quantity_show', value)
        }}
        min={0}
        max={needInputLimit ? max! : undefined}
      />
      {sku_base_unit_name}
    </Flex>
  )
}

const UnSelectedTable: FC<SelectedTableProps> = (props) => {
  const { data, onInputChange, onAdd } = props

  const { selectKey, type, hasSkuUnit, hasCustomer } =
    useContext(BatchSelectContext)
  const isRefundStockIn = type === 'refund_stock_in'
  const isInventory = type === 'inventory'
  const isVirtual = type === 'virtual'

  let baseText = ''
  // let ssuText = ''
  if (isRefundStockIn) {
    baseText = t('???????????????????????????')
    // ssuText = t('????????????????????????(??????)???')
  } else if (isInventory) {
    baseText = t(globalStore.isLite ? '????????????' : '??????????????????????????????')
    // ssuText = t('???????????????????????????(??????)???')
  } else if (isVirtual) {
    baseText = t('???????????????????????????')
    // ssuText = t('????????????????????????(??????)???')
  } else {
    baseText = t(globalStore.isLite ? '?????????' : '???????????????????????????')
    // ssuText = t('????????????????????????(??????)???')
  }

  const _columns: Column[] = useMemo(
    () => [
      {
        Header: t('????????????'),
        accessor: 'in_stock_time',
        Cell: (cellProps) => {
          return getFormatTimeForTable(
            'YYYY-MM-DD HH:mm',
            cellProps.original.in_stock_time,
          )
        },
      },
      // { Header: t('??????'), accessor: 'ssu_display_name', hide: !hasSkuUnit },
      {
        ...COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
        hide: !hasSkuUnit,
        minWidth: undefined,
      },
      {
        Header: t('????????????'),
        accessor: 'production_time',
        hide: globalStore.isLite,
        show: !isInventory,
        Cell: (cellProps) => {
          return getFormatTimeForTable(
            'YYYY-MM-DD',
            cellProps.original.production_time,
          )
        },
      },
      {
        Header: t('????????????'),
        accessor: 'sku_level_filed_id',
        show: !isRefundStockIn,
        width: 100,
        Cell: (cellProps) => {
          const { sku_level_filed_id } = cellProps.original
          return <span>{sku_level_filed_id?.name || '-'}</span>
        },
      },
      {
        Header: t('?????????'),
        accessor: 'supplier_id',
        show: !isRefundStockIn,
        width: 80,
        Cell: (cellProps) => {
          return cellProps.original.supplier_name
        },
      },
      {
        Header: t('?????????'),
        accessor: 'purchaser_id',
        show: !isRefundStockIn,
        width: 100,
        Cell: (cellProps) => {
          return cellProps.original.purchaser_name
        },
      },
      {
        Header: t('?????????'),
        accessor: 'batch_serial_no',
        width: 100,
        Cell: (cellProps) => {
          const { type, batch_serial_no } = cellProps.original
          return type === Batch_BatchType.BATCH_TYPE_TMP
            ? t('???????????????')
            : batch_serial_no
        },
      },
      {
        Header: t('????????????'),
        accessor: 'batch_average_price',
        show: !isInventory,
        Cell: (cellProps) => {
          return (
            getEndlessPrice(Big(cellProps.original.batch_average_price) || 0) +
            Price.getUnit()
          )
        },
      },
      {
        Header: t('??????'),
        accessor: 'shelf_name',
        hide: globalStore.isLite,
        Cell: (cellProps) => {
          return cellProps.original.shelf_name
            ? cellProps.original.shelf_name
            : '?????????'
        },
      },
      {
        Header: t(globalStore.isLite ? '????????????' : '????????????(????????????)'),
        accessor: 'sku_stock_base_quantity',
        show: isInventory,
        Cell: (cellProps) => {
          const { sku_base_unit_name, sku_stock_base_quantity } =
            cellProps.original
          return (
            toFixedSalesInvoicing(sku_stock_base_quantity) + sku_base_unit_name
          )
        },
      },
      {
        Header: t(
          globalStore.isLite ? '??????????????????' : '??????????????????(????????????)',
        ),
        accessor: 'sku_stock_base_quantity',
        width: 100,
        show: !isInventory && !isRefundStockIn,
        Cell: (cellProps) => {
          const { sku_base_unit_name, sku_stock_base_quantity } =
            cellProps.original
          return (
            toFixedSalesInvoicing(sku_stock_base_quantity) + sku_base_unit_name
          )
        },
      },
      {
        Header: t('?????????(????????????)'),
        accessor: 'sku_base_material_out',
        show: isRefundStockIn,
        Cell: (cellProps) => {
          const { sku_base_unit_name, sku_base_material_out } =
            cellProps.original
          return (
            toFixedSalesInvoicing(sku_base_material_out) + sku_base_unit_name
          )
        },
      },
      {
        Header: baseText,
        accessor: 'sku_base_quantity_show',
        width: 100,
        Cell: (cellProps) => {
          return (
            <BaseQuantityNumber
              data={cellProps.original}
              onInputChange={onInputChange}
            />
          )
        },
      },
      {
        Header: t('????????????'),
        accessor: 'target_customer_name',
        hide: !hasCustomer || globalStore.isLite,
        Cell: (cellProps) => {
          return cellProps.original.target_customer_name
            ? cellProps.original.target_customer_name
            : '-'
        },
      },
      {
        Header: t('????????????'),
        accessor: 'target_customer_name',
        hide: !hasCustomer || globalStore.isLite,
        Cell: (cellProps) => {
          return cellProps.original.target_route_name
            ? cellProps.original.target_route_name
            : '-'
        },
      },
      {
        Header: OperationHeader,
        accessor: 'operator',
        Cell: (cellProps) => {
          return (
            <div onClick={() => onAdd(cellProps.original)}>
              <SelectedTableAdd />
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectKey, baseText, isInventory, hasSkuUnit, hasCustomer], // onDel,onChangeValue???????????????????????????????????????????????????
  )

  return <Table isVirtualized data={data} columns={_columns} limit={6} />
}

export default UnSelectedTable
