import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'
import { BoxTable, BoxTableInfo, Flex } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'

import ToSheet from '../components/toSheet'
import { EXPECT_TYPE_NAME } from '@/pages/sales_invoicing/enum'
import { toFixedSalesInvoicing } from '@/common/util'
import { formatSecond } from '@/pages/sales_invoicing/util'
import store from '../stores/inventory_store'

const columns: Column[] = [
  {
    Header: t('预期库存类型'),
    Cell: (cellProps) => {
      const { pending_type } = cellProps.original
      return EXPECT_TYPE_NAME[pending_type]
    },
  },
  {
    Header: t('来源'),
    Cell: (cellProps) => {
      const { batch_serial_no, pending_type, sheet_id } = cellProps.original
      return (
        <ToSheet
          pending_type={pending_type}
          serial_no={batch_serial_no}
          sheet_id={sheet_id}
        />
      )
    },
  },
  {
    Header: t('下达时间'),
    Cell: (cellProps) => {
      const { time } = cellProps.original
      return formatSecond(time)
    },
  },
  {
    Header: t('预期库存(基本单位)'),
    Cell: (cellProps) => {
      const {
        quantity: { base_unit },
      } = cellProps.original
      return toFixedSalesInvoicing(Big(base_unit.quantity))
    },
  },
  /** 商品改造弃掉包装单位 */
  // {
  //   Header: t('预期库存(包装单位(废弃))'),
  //   Cell: (cellProps) => {
  //     const {
  //       quantity: { base_unit },
  //     } = cellProps.original
  //     return toFixedSalesInvoicing(Big(base_unit.quantity))
  //   },
  // },
]
const List = observer(() => {
  const { list, sku_info, unitList, showUnitId, inventory } = store
  const data = [
    {
      label: t('可用库存'),
      content: toFixedSalesInvoicing(
        Big(inventory.available_stock?.base_unit?.quantity || 0),
      ),
    },
    {
      label: t('在途库存'),
      content: toFixedSalesInvoicing(
        Big(inventory.in_transit_stock?.base_unit?.quantity || 0),
      ),
    },
    {
      label: t('冻结库存'),
      content: toFixedSalesInvoicing(
        Big(inventory.frozen_stock?.base_unit?.quantity || 0),
      ),
    },
  ]
  return (
    <BoxTable
      info={
        <Flex alignCenter>
          <BoxTableInfo>{sku_info?.name}</BoxTableInfo>
          <div className='gm-padding-right-10' />
          <div>
            {_.find(unitList, { value: showUnitId })?.text || '全部规格'}
          </div>
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
