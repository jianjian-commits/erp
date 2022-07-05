import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Column, Table } from '@gm-pc/table-x'
import { Flex } from '@gm-pc/react'
import store from './store'
import { List } from '../../interface'

interface PlanDetailProps {
  purchase_task_id: string
  product_name: string
  quantity: string
  purchase_task_serial_no: string
}

const PlanDetail: FC<PlanDetailProps> = observer(
  ({ purchase_task_id, product_name, quantity, purchase_task_serial_no }) => {
    useEffect(() => {
      store.getPurchaseTask(purchase_task_id)
      return () => store.resetData()
    }, [])

    const columns: Column<List>[] = [
      {
        Header: t('商户名'),
        accessor: 'customer_name',
      },
      {
        Header: t('订单号'),
        accessor: 'request_sheet_serial_no',
        Cell: (cellProps) => (
          <a
            href={`#/order/order_manage/list/detail?id=${cellProps.original.request_sheet_serial_no}`}
            className='gm-text-primary'
            rel='noopener noreferrer'
            target='_blank'
          >
            {cellProps.original.request_sheet_serial_no}
          </a>
        ),
      },
      {
        Header: t('采购单位'),
        accessor: 'unit_name',
      },
      {
        Header: t('商品等级'),
        accessor: 'level_name',
        Cell: (cellProps) => {
          return <>{cellProps.original.levelName}</>
        },
      },
      {
        Header: t('需求数'),
        accessor: 'need',
        Cell: (cellProps) =>
          cellProps.original.need + cellProps.original.unit_name,
      },
      {
        Header: t('备注'),
        accessor: 'remark',
      },
    ]

    return (
      <>
        <div className='tw-m-4 tw-font-black gm-text-16'>{product_name}</div>
        <Flex className='tw-mx-4 tw-mb-4'>
          <div>
            {t('采购数：')}
            {quantity}
          </div>
          <div className='tw-ml-8'>
            {t('采购计划：')}
            {purchase_task_serial_no}
          </div>
        </Flex>
        <Table<List>
          id='purchase_plan_table'
          data={store.list}
          columns={columns}
        />
      </>
    )
  },
)

export default PlanDetail
