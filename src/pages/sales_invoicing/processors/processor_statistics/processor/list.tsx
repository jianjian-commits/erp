import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableProps } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import store from '../processor_store'
import { toFixed, toFixedByType } from '@/common/util'
import moment from 'moment'
import Big from 'big.js'

const List = observer(({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { begin_time, end_time } = store.filter
  const { processor, list } = store

  const columns: Column[] = [
    {
      Header: t('盘点周期'),
      accessor: 'begin_time',
      diyEnable: true,
      diyItemText: t('盘点周期'),
      Cell: () => {
        return (
          moment(begin_time).format('YYYY-MM-DD hh:mm') +
            '~' +
            moment(end_time).format('YYYY-MM-DD hh:mm') || '-'
        )
      },
    },
    {
      Header: t('商品编码'),
      accessor: 'customize_code',
      diyEnable: true,
      diyItemText: t('商品编码'),
      Cell: (cellProps) => {
        const { customize_code } = cellProps.original
        return customize_code || '-'
      },
    },
    {
      Header: t('商品名'),
      accessor: 'sku_name',
      diyEnable: true,
      diyItemText: t('商品名'),
      Cell: (cellProps) => {
        const { sku_name } = cellProps.original
        return sku_name || '-'
      },
    },
    {
      Header: t('用料数量'),
      accessor: 'quantity',
      diyEnable: true,
      diyItemText: t('用料数量'),
      Cell: (cellProps) => {
        const { quantity, base_unit_name } = cellProps.original
        return toFixed(Big(Number(quantity))) + base_unit_name || '-'
      },
    },
    {
      Header: t('用料金额（不含税）'),
      accessor: 'amount',
      diyEnable: true,
      diyItemText: t('用料金额（不含税）'),
      Cell: (cellProps) => {
        const { amount } = cellProps.original
        return toFixedByType(amount, 'dpInventoryAmount') + '元' || '-'
      },
    },
    {
      Header: t('车间信息'),
      accessor: 'processorDetail_name',
      diyEnable: true,
      diyItemText: t('车间信息'),
      Cell: (cellProps) => {
        const { processor_id } = cellProps.original
        const processorDetail = _.filter(processor, (item) => {
          return item?.processor_id === processor_id
        })
        return processorDetail[0]?.name || '-'
      },
    },
  ]

  return (
    <>
      <BoxTable pagination={pagination}>
        <Table
          isDiy
          id='processor_statistics_id'
          data={list.slice()}
          columns={columns}
          keyField='processor_statistics_id'
        />
      </BoxTable>
    </>
  )
})

export default List
