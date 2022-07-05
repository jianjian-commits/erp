import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'
import { BoxTable, BoxTableInfo, Flex, BoxTableProps } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { toFixedSalesInvoicing } from '@/common/util'

import { formatSecond } from '@/pages/sales_invoicing/util'
import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import store from '../stores/batch_store'
import globalStore from '@/stores/global'

const List = observer(({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { list, headDetail } = store

  const columns: Column[] = [
    {
      Header: t('出/入库时间'),
      Cell: (cellProps) => {
        const { submit_time } = cellProps.original
        return formatSecond(submit_time)
      },
    },
    {
      Header: t('操作时间'),
      Cell: (cellProps) => {
        const { create_time } = cellProps.original
        return formatSecond(create_time)
      },
    },
    {
      Header: t('变动明细'),
      Cell: (cellProps) => {
        const {
          stock_sheet_type,
          operate_type,
          stock_sheet_id,
          stock_sheet_serial_no,
        } = cellProps.original
        return (
          <ToSheet
            source_type={stock_sheet_type}
            operate_type={operate_type}
            serial_no={stock_sheet_serial_no}
            sheet_id={stock_sheet_id}
            showName
          />
        )
      },
    },
    {
      Header: t(globalStore.isLite ? '变动数量' : '变动数量(基本单位)'),
      Cell: (cellProps) => {
        const {
          update_stock: {
            stock: { base_unit },
          },
          base_unit_name,
        } = cellProps.original
        return (
          toFixedSalesInvoicing(Big(base_unit?.quantity)) + `${base_unit_name}`
        )
      },
    },
    // {
    //   Header: t('变动数量(包装单位(废弃))'),
    //   Cell: (cellProps) => {
    //     const {
    //       update_stock: {
    //         stock: { sku_unit },
    //       },
    //       ssu_info,
    //     } = cellProps.original
    //     let unit_name = '-'
    //     if (ssu_info) unit_name = ssu_info?.ssu?.unit?.name
    //     return ssu_info
    //       ? toFixedSalesInvoicing(Big(sku_unit.quantity)) + `${unit_name}`
    //       : unit_name
    //   },
    // },
    {
      Header: t(globalStore.isLite ? '变动前库存' : '变动前库存(基本单位)'),
      Cell: (cellProps) => {
        const {
          old_stock: { base_unit },
          base_unit_name,
        } = cellProps.original
        return (
          toFixedSalesInvoicing(Big(base_unit?.quantity)) + `${base_unit_name}`
        )
      },
    },
    // {
    //   Header: t('变动前库存(包装单位(废弃))'),
    //   Cell: (cellProps) => {
    //     const {
    //       old_stock: { sku_unit },
    //       ssu_info,
    //     } = cellProps.original
    //     let unit_name = '-'
    //     if (ssu_info) unit_name = ssu_info?.ssu?.unit?.name
    //     return ssu_info
    //       ? toFixedSalesInvoicing(Big(sku_unit.quantity)) + `${unit_name}`
    //       : unit_name
    //   },
    // },
    {
      Header: t(globalStore.isLite ? '变动后库存' : '变动后库存(基本单位)'),
      Cell: (cellProps) => {
        const {
          new_stock: { base_unit },
          base_unit_name,
        } = cellProps.original
        return (
          toFixedSalesInvoicing(Big(base_unit?.quantity)) + `${base_unit_name}`
        )
      },
    },
    // {
    //   Header: t('变动后库存(包装单位(废弃))'),
    //   Cell: (cellProps) => {
    //     const {
    //       new_stock: { sku_unit },
    //       ssu_info,
    //     } = cellProps.original
    //     let unit_name = '-'
    //     if (ssu_info) unit_name = ssu_info?.ssu?.unit?.name
    //     return ssu_info
    //       ? toFixedSalesInvoicing(Big(sku_unit.quantity)) + `${unit_name}`
    //       : unit_name
    //   },
    // },
  ]
  const data = useMemo(
    () => [
      {
        label: t('批次号'),
        content: headDetail.batch_serial_no,
      },
    ],
    [headDetail.batch_serial_no],
  )
  return (
    <BoxTable
      pagination={pagination}
      info={
        <Flex alignCenter>
          <BoxTableInfo>{headDetail.sku_name}</BoxTableInfo>
          <div className='gm-padding-right-10' />
          <BoxTableInfo>
            <TableTotalText data={data} />
          </BoxTableInfo>
        </Flex>
      }
    >
      <Table isEdit data={list.slice()} columns={columns} />
    </BoxTable>
  )
})

export default List
