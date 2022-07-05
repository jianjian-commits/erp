import React from 'react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxPanel, Flex } from '@gm-pc/react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import TableRight from '@/common/components/key_board_tips'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import store from '../stores/detail_store'
import { getFormatTimeForTable, toFixedSalesInvoicing } from '@/common/util'
import { COMMON_COLUMNS } from '@/common/enum'

const { TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productFilterList } = store

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(
    () => [
      COMMON_COLUMNS.INDEX,
      {
        Header: t('商品名'),
        accessor: 'sku_name',
        diyEnable: false,
        minWidth: 200,
        Cell: (cellProps) => {
          return <TextAreaCell field='sku_name' data={cellProps.original} />
        },
      },
      // {
      //   Header: t('规格'),
      //   accessor: 'ssu_display_name',
      //   diyEnable: false,
      //   minWidth: 200,
      //   Cell: (cellProps) => {
      //     return (
      //       <TextAreaCell field='ssu_display_name' data={cellProps.original} />
      //     )
      //   },
      // },
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
      {
        Header: t('商品分类'),
        minWidth: 190,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell field='category' data={cellProps.original} />
        },
      },
      {
        Header: t('现存货位'),
        minWidth: 190,
        accessor: 'category',
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='exist_shelf_name' data={cellProps.original} />
          )
        },
      },
      {
        Header: t('移库批次'),
        accessor: 'batch_serial_no',
        minWidth: 190,
        Cell: (cellProps) => {
          const batch_serial_no =
            cellProps.original?.batch_selected_single?.batch_serial_no
          return <span>{batch_serial_no || '-'}</span>
        },
      },
      {
        Header: t('供应商'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'ssu_unit_id',
        minWidth: 190,
        Cell: (cellProps) => {
          const { supplier_info } = cellProps.original
          return `${supplier_info?.name || '-'}`
        },
      },
      {
        Header: t('入库日期'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          const in_stock_time =
            cellProps.original?.batch_selected_single?.in_stock_time
          return (
            <span>{getFormatTimeForTable('YYYY-MM-DD', in_stock_time)}</span>
          )
        },
      },
      {
        Header: t('生产日期'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          const production_time =
            cellProps.original.batch_selected_single?.production_time
          return (
            <span>{getFormatTimeForTable('YYYY-MM-DD', production_time)}</span>
          )
        },
      },
      {
        Header: t('保质期'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'base_unit_quantity',
        minWidth: 190,
        Cell: (cellProps) => {
          const expiry_time =
            cellProps.original.batch_selected_single?.expiry_time
          return <span>{getFormatTimeForTable('YYYY-MM-DD', expiry_time)}</span>
        },
      },
      {
        Header: t('账面库存（基本单位）'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'ssu_unit_id',
        minWidth: 190,
        Cell: (cellProps) => {
          const {
            ssu_base_unit_rate,
            old_stock,
            sku_base_unit_name,
            ssu_unit_name,
            batch_selected_single: { stock },
          } = cellProps.original
          if (!old_stock?.base_unit?.quantity) {
            return (
              <Flex>
                {Big(stock?.base_unit?.quantity ?? 0)
                  .div(1)
                  .toFixed(4)}
                {sku_base_unit_name}
              </Flex>
            )
          }
          return (
            <Flex>
              {Big(old_stock?.base_unit?.quantity ?? 0)
                .div(1)
                .toFixed(4)}
              {sku_base_unit_name}
            </Flex>
          )
        },
      },
      {
        Header: t('移库数 (基本单位)'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'ssu_unit_id',
        minWidth: 190,
        Cell: (cellProps) => {
          const { input_stock, sku_base_unit_name } = cellProps.original
          return (
            <Flex>
              {toFixedSalesInvoicing(Big(input_stock?.input?.quantity ?? 0))}
              {sku_base_unit_name}
            </Flex>
          )
        },
      },
      {
        Header: t('移入货位'),
        diyEnable: false,
        isKeyboard: true,
        accessor: 'ssu_unit_id',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              data={cellProps.original}
              field='transfer_shelf_name'
            />
          )
        },
      },
      {
        Header: t('操作人'),
        accessor: 'operator',
        minWidth: 90,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='operator_name' />
          )
        },
      },
    ],
    [],
  )
  // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isVirtualized
        id='in_stock_table'
        data={productFilterList}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default EditDetail
