import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import React, { FC, useContext, useMemo } from 'react'
import { Batch_BatchType } from 'gm_api/src/inventory'
import { Flex, Price } from '@gm-pc/react'
import Big from 'big.js'

import SelectedTableDel from '@/common/components/icon/selected_table_del'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import {
  getEndlessPrice,
  getFormatTimeForTable,
  toFixedSalesInvoicing,
} from '@/common/util'
import { BatchData } from './util'
import WarningPopover from '@/common/components/icon/warning_popover'
import { BatchSelectContext } from './batch_select'
import { compareInDp } from '../../util'
import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'

const { OperationHeader } = TableXUtil

interface SelectedTableProps {
  data: BatchData[]
  onInputChange: (
    id: string,
    name:
      | 'sku_base_quantity_show'
      | 'ssu_quantity_show'
      | 'sku_base_quantity'
      | 'ssu_quantity',
    value: number | null,
  ) => void
  onDel: (id: string) => void
}

interface BaseQuantityProps extends Pick<SelectedTableProps, 'onInputChange'> {
  data: BatchData
}

const BaseQuantityNumber: FC<BaseQuantityProps> = ({ data, onInputChange }) => {
  const { selectKey, needInputLimit, unAssignedAmount, type } =
    useContext(BatchSelectContext)
  const {
    sku_base_quantity_show,
    sku_base_unit_name,
    [selectKey]: id,
    sku_stock_base_quantity,
    sku_base_material_out,
  } = data

  // 退料不依赖入库数
  const isRefundStockIn = type === 'refund_stock_in'

  let max: number
  if (needInputLimit) {
    const currentMax = +Big(unAssignedAmount ?? 0).plus(
      sku_base_quantity_show ?? 0,
    )

    const total = isRefundStockIn
      ? sku_base_material_out!
      : sku_stock_base_quantity
    max = +toFixedSalesInvoicing(
      isRefundStockIn
        ? +total
        : Big(currentMax).gt(total)
        ? +total
        : currentMax,
    )
  }
  return (
    <Flex alignCenter>
      <PrecisionInputNumber
        precisionType='salesInvoicing'
        value={sku_base_quantity_show!}
        onChange={(value) => {
          onInputChange(id as any, 'sku_base_quantity_show', value)
          onInputChange(id as any, 'sku_base_quantity', value)
        }}
        min={0}
        max={needInputLimit ? max! : undefined}
      />
      {sku_base_unit_name}
    </Flex>
  )
}

interface BatchNumberProps {
  data: BatchData
}

const BatchNumber: FC<BatchNumberProps> = ({ data }) => {
  const {
    type,
    batch_serial_no,
    batch_delete_time,
    sku_stock_base_quantity,
    sku_base_material_out,
    ssu_material_out,
    ssu_stock_quantity,
    ssu_quantity,
    sku_base_quantity,
  } = data
  const { type: comType } = useContext(BatchSelectContext)
  const isDelete = batch_delete_time !== '0'
  const isInventory = comType === 'inventory'
  const isRefundStockIn = comType === 'refund_stock_in'
  const compareNum =
    comType === 'refund_stock_in'
      ? sku_base_material_out
      : sku_stock_base_quantity
  const isOut = compareInDp('lt', compareNum, sku_base_quantity)
  // const ssuCompareNum =
  //   comType === 'refund_stock_in' ? ssu_material_out : ssu_stock_quantity
  // const isSsuOut = compareInDp('lt', ssuCompareNum, ssu_quantity)

  return (
    <Flex>
      {type === Batch_BatchType.BATCH_TYPE_TMP
        ? t('虚拟批次号')
        : batch_serial_no}
      {isDelete && (
        <>
          <div className='gm-gap-10' />
          <WarningPopover
            popup={
              <div className='gm-padding-tb-10 gm-padding-lr-15'>
                {t('批次已删除，请重新选择')}
              </div>
            }
          />
        </>
      )}
      {!isInventory && isOut && (
        <>
          <div className='gm-gap-10' />
          <WarningPopover
            popup={
              <div className='gm-padding-tb-10 gm-padding-lr-15'>
                {isRefundStockIn
                  ? t('领料数不足，请重新填写')
                  : t('库存不足，请重新填写')}
              </div>
            }
          />
        </>
      )}
    </Flex>
  )
}

const SelectedTable: FC<SelectedTableProps> = (props) => {
  const { data, onDel, onInputChange } = props
  const { selectKey, type, hasSkuUnit, hasCustomer } =
    useContext(BatchSelectContext)
  const isRefundStockIn = type === 'refund_stock_in'
  const isInventory = type === 'inventory'
  const isVirtual = type === 'virtual'

  let baseText = ''
  // let ssuText = ''
  if (isRefundStockIn) {
    baseText = t('入库数（基本单位）')
    // ssuText = t('入库数（包装单位(废弃)）')
  } else if (isInventory) {
    baseText = t(globalStore.isLite ? '实盘库存' : '实盘库存（基本单位）')
    // ssuText = t('实盘库存（包装单位(废弃)）')
  } else if (isVirtual) {
    baseText = t('替换数（基本单位）')
    // ssuText = t('替换数（包装单位(废弃)）')
  } else {
    baseText = t(globalStore.isLite ? '出库数' : '出库数（基本单位）')
    // ssuText = t('出库数（包装单位(废弃)）')
  }

  const _columns: Column[] = useMemo(
    () => [
      {
        Header: t('入库时间'),
        accessor: 'in_stock_time',
        Cell: (cellProps) => {
          return getFormatTimeForTable(
            'YYYY-MM-DD HH:mm',
            cellProps.original.in_stock_time,
          )
        },
      },
      // { Header: t('规格'), accessor: 'ssu_display_name', hide: !hasSkuUnit },
      {
        ...COMMON_COLUMNS.SKU_BASE_UNIT_NAME_NO_MINWIDTH,
        hide: !hasSkuUnit,
      },
      {
        Header: t('生产日期'),
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
        Header: t('商品等级'),
        accessor: 'sku_level_filed_id',
        show: !isRefundStockIn,
        width: 100,
        Cell: (cellProps) => {
          const { sku_level_filed_id } = cellProps.original
          return <span>{sku_level_filed_id?.name || '-'}</span>
        },
      },
      {
        Header: t('供应商'),
        accessor: 'supplier_id',
        show: !isRefundStockIn,
        width: 80,
        Cell: (cellProps) => {
          return cellProps.original.supplier_name
        },
      },
      {
        Header: t('采购员'),
        accessor: 'purchaser_id',
        show: !isRefundStockIn,
        width: 100,
        Cell: (cellProps) => {
          return cellProps.original.purchaser_name
        },
      },
      {
        Header: t('批次号'),
        accessor: 'batch_serial_no',
        width: 100,
        Cell: (cellProps) => {
          return <BatchNumber data={cellProps.original} />
        },
      },
      {
        Header: t('批次均价'),
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
        Header: t('货位'),
        accessor: 'shelf_name',
        hide: globalStore.isLite,
        Cell: (cellProps) => {
          return cellProps.original.shelf_name
            ? cellProps.original.shelf_name
            : '未分配'
        },
      },
      {
        Header: t(globalStore.isLite ? '账面库存' : '账面库存(基本单位)'),
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
          globalStore.isLite ? '剩余账面库存' : '剩余账面库存(基本库存)',
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
        Header: t(globalStore.isLite ? '领料数' : '领料数(基本单位)'),
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
        width: 130,
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
        Header: t('关联客户'),
        accessor: 'target_customer_name',
        hide: !hasCustomer || globalStore.isLite,
        Cell: (cellProps) => {
          return cellProps.original.target_customer_name
            ? cellProps.original.target_customer_name
            : '-'
        },
      },
      {
        Header: t('关联线路'),
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
          const id = cellProps.original[selectKey]
          return (
            <div onClick={() => onDel(id)}>
              <SelectedTableDel />
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectKey, hasSkuUnit, isInventory, baseText, hasCustomer], // onDel,onChangeValue内部有针对闭包问题做处理，无需关心
  )

  return <Table isVirtualized limit={1} data={data} columns={_columns} />
}

export default SelectedTable
