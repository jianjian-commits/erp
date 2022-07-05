import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'
import { toFixedByType } from '@/common/util'
import { Map_OperateType } from 'gm_api/src/inventory/pc'
import { BoxTable, BoxTableInfo, BoxTableProps } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { changeLogNum, formatSecond } from '@/pages/sales_invoicing/util'

import store from '../stores/customer_store'

const List = observer(({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { list, headDetail } = store
  const { sku_name, customer_name, customer_code } = headDetail
  const columns: Column[] = [
    {
      Header: t('操作时间'),
      Cell: (cellProps) => {
        const { submit_time } = cellProps.original
        return formatSecond(submit_time)
      },
    },
    {
      Header: t('关联单据'),
      Cell: (cellProps) => {
        const { related_sheet_serial_no } = cellProps.original
        return related_sheet_serial_no || '-'
      },
    },
    {
      Header: t('操作类型'),
      Cell: (cellProps) => {
        const { operate_type } = cellProps.original
        return <Map_OperateType value={operate_type} />
      },
    },
    {
      Header: t('变动数量'),
      Cell: (cellProps) => {
        const { old_stock, new_stock, base_unit_name } = cellProps.original
        return (
          changeLogNum({
            new_stock: new_stock.base_unit,
            old_stock: old_stock.base_unit,
            type: 'changeQuantity',
          }) + base_unit_name
        )
      },
    },
    {
      Header: t('变动货值'),
      Cell: (cellProps) => {
        const {
          ssu_price,
          old_stock: {
            base_unit: { quantity: new_quantity },
          },
          new_stock: {
            base_unit: { quantity: old_quantity },
          },
        } = cellProps.original
        const newMoney = Big(ssu_price).times(new_quantity)
        const oldMoney = Big(ssu_price).times(old_quantity)
        const num = toFixedByType(
          newMoney.minus(oldMoney).abs(),
          'dpInventoryAmount',
        )
        return num
      },
    },
    {
      Header: t('司机'),
      Cell: (cellProps) => {
        const { driverInfo } = cellProps.original
        return driverInfo?.name || '-'
      },
    },
  ]
  const data = useMemo(
    () => [
      {
        label: t('客户名称'),
        content: customer_name,
      },
      {
        label: t('客户编码'),
        content: customer_code,
      },
      {
        label: t('周转物'),
        content: sku_name,
      },
    ],
    [headDetail],
  )
  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText data={data} />
        </BoxTableInfo>
      }
    >
      <Table isEdit data={list.slice()} columns={columns} />
    </BoxTable>
  )
})

export default List
