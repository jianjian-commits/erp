import { t } from 'gm-i18n'
import React from 'react'
import { Box } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from './store'
import type { ExpendedMap } from './interface'

const List = () => {
  const _columns: Column[] = [
    {
      Header: t('商品ID'),
      accessor: 'id',
      minWidth: 80,
    },
    {
      Header: t('商品名'),
      accessor: 'name',
      minWidth: 80,
    },
    {
      Header: t('下单数'),
      accessor: 'quantity',
      minWidth: 80,
    },
    {
      Header: t('单价（销售单位）'),
      accessor: 'sale_price',
      minWidth: 100,
    },
    {
      Header: t('单价（基本单位）'),
      accessor: 'std_sale_price_forsale',
      minWidth: 100,
    },
    {
      Header: t('下单金额'),
      accessor: 'real_item_price',
      minWidth: 100,
    },
    {
      Header: t('出库数（基本单位）'),
      accessor: 'std_real_quantity',
      minWidth: 120,
    },
    {
      Header: t('售后类型'),
      accessor: 'after_sales_type',
      minWidth: 100,
    },
    {
      Header: t('记账数'),
      accessor: 'total_billing_number',
      minWidth: 115,
    },
    {
      Header: t('总异常数'),
      accessor: 'total_abnormal_count',
      minWidth: 120,
    },
    {
      Header: t('总退货数'),
      accessor: 'total_refund_count',
      minWidth: 120,
    },
  ]

  function handleExpand(expanded: ExpendedMap) {
    store.setExpanded(expanded)
  }

  const { list, expanded } = store
  return (
    <Box>
      <Table
        isExpand
        isEdit
        data={list.slice()}
        columns={_columns}
        expanded={expanded}
        onExpand={handleExpand}
        SubComponent={() => {
          return <div>some</div>
        }}
      />
    </Box>
  )
}
export default observer(List)
