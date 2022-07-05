import React, { FC, useMemo } from 'react'
import {
  Table,
  TableXUtil,
  BatchActionDefault,
  BatchActionEdit,
  Column,
} from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import { Modal } from '@gm-pc/react'
import Big from 'big.js'
import store from '../store'
import ListStatusTabs from './list_status_tabs'
import PickUpAmountCell from './list_cell/pick_up_amount_cell'
import TaskStatusCell from './list_cell/task_status_cell'
import DealWayCell from './list_cell/deal_way_cell'
import DriverCell from './list_cell/driver_cell'
import Action from './action'
import DealWay from './batch_operation/deal_way'
import Driver from './batch_operation/driver'
import Task from './batch_operation/task'
import { ReceiptStatusAllKey, ListOptions } from '../interface'
import { RECEIPT_TABS, RECEIPT_STATUS } from '../enum'

const ListTable = observer(() => {
  const { list } = store
  const _columns = useMemo(() => {
    return [
      {
        Header: t('商品名'),
        accessor: 'sku_name',
        minWidth: 100,
        fixed: 'left',
        Cell: (cellProps) => {
          const {
            original: { sku_name },
          } = cellProps
          return <span>{sku_name}</span>
        },
      },
      {
        Header: t('商品分类'),
        accessor: 'category_name',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { category_name },
          } = cellProps
          return <span>{category_name}</span>
        },
      },
      {
        Header: t('申请退货数'),
        accessor: 'apply_return_value',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { apply_return_value, ssu_base_unit_name },
          } = cellProps
          return (
            <span>
              {apply_return_value
                ? `${Big(
                    Number(apply_return_value?.calculate?.quantity!) || 0,
                  ).toFixed(2)} ${ssu_base_unit_name}`
                : '-'}
            </span>
          )
        },
      },
      {
        Header: t('售后单号'),
        accessor: 'after_sale_order_serial_no',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { after_sale_order_serial_no, after_sale_order_id },
          } = cellProps
          return (
            <a
              href={`#/order/after_sales/after_sales_list/detail?serial_no=${after_sale_order_id}&type=detail`}
              className='gm-text-primary gm-cursor'
              rel='noopener noreferrer'
              target='_blank'
              style={{ textDecoration: 'underline' }}
            >
              {after_sale_order_serial_no || ' '}
            </a>
          )
        },
      },
      {
        Header: t('订单号'),
        accessor: 'order_code',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { order_code },
          } = cellProps
          return order_code && order_code !== '0' ? (
            <a
              href={`#/order/order_manage/list/detail?id=${order_code}`}
              className='gm-text-primary gm-cursor'
              rel='noopener noreferrer'
              target='_blank'
              style={{ textDecoration: 'underline' }}
            >
              {order_code}
            </a>
          ) : (
            '-'
          )
        },
      },
      {
        Header: t('线路'),
        accessor: 'route_name',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { route_name },
          } = cellProps
          return <span>{route_name || '-'}</span>
        },
      },
      {
        Header: t('司机'),
        accessor: 'driver',
        minWidth: 100,
        Cell: (cellProps) => {
          const { index } = cellProps
          return <DriverCell index={index} />
        },
      },
      {
        Header: t('处理方式'),
        accessor: 'deal_way',
        minWidth: 100,
        Cell: (cellProps) => {
          const { index } = cellProps
          return <DealWayCell index={index} />
        },
      },
      {
        Header: t('取货数'),
        accessor: 'real_return_value',
        minWidth: 100,
        Cell: (cellProps) => {
          const { index } = cellProps
          return <PickUpAmountCell index={index} />
        },
      },
      {
        Header: t('任务状态'),
        accessor: 'task_status',
        minWidth: 100,
        Cell: (cellProps) => {
          const { index } = cellProps
          return <TaskStatusCell index={index} />
        },
      },
      {
        Header: t('公司'),
        accessor: 'company',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { company },
          } = cellProps
          return <span>{company || '-'}</span>
        },
      },
      {
        Header: t('客户'),
        accessor: 'customer',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { customer },
          } = cellProps
          return <span>{customer || '-'}</span>
        },
      },
      {
        Header: TableXUtil.OperationHeader,
        accessor: 'operation',
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        fixed: 'right',
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const {
                  index,
                  original: { operate_status },
                } = cellProps

                return <Action index={index} status={operate_status!} />
              }}
            </Observer>
          )
        },
      },
    ] as Column<ListOptions>[]
  }, [])

  const handleBatchActionSelect = (
    key: 'BATCH_DEAL_WAY' | 'BATCH_DRIVER' | 'BATCH_TASK',
    selected: string[],
    isSelectAll: boolean,
  ) => {
    // 校验，只有未完成的任务才可以修改

    if (key === 'BATCH_DEAL_WAY') {
      Modal.render({
        children: <DealWay selected={selected} isSelectAll={isSelectAll} />,
        size: 'md',
        title: t('批量修改处理方式'),
        onHide: Modal.hide,
      })
    } else if (key === 'BATCH_DRIVER') {
      Modal.render({
        children: <Driver selected={selected} isSelectAll={isSelectAll} />,
        size: 'md',
        title: t('批量修改司机'),
        onHide: Modal.hide,
      })
    } else {
      Modal.render({
        children: <Task selected={selected} isSelectAll={isSelectAll} />,
        size: 'md',
        title: t('批量完成任务'),
        onHide: Modal.hide,
      })
    }
  }

  return (
    <Table
      isBatchSelect
      id='pick_up_id'
      keyField='after_sale_order_detail_id'
      fixedSelect
      columns={_columns}
      data={list}
      batchActions={[
        {
          children: <BatchActionEdit>{t('批量修改处理方式')}</BatchActionEdit>,
          onAction: (selected: string[], isSelectAll: boolean) =>
            handleBatchActionSelect('BATCH_DEAL_WAY', selected, isSelectAll),
        },
        {
          children: <BatchActionEdit>{t('批量修改司机')}</BatchActionEdit>,
          onAction: (selected: string[], isSelectAll: boolean) =>
            handleBatchActionSelect('BATCH_DRIVER', selected, isSelectAll),
        },
        {
          children: (
            <BatchActionDefault>{t('批量完成任务')}</BatchActionDefault>
          ),
          onAction: (selected: string[], isSelectAll: boolean) =>
            handleBatchActionSelect('BATCH_TASK', selected, isSelectAll),
        },
      ]}
    />
  )
})

interface ListProps {
  onFetchList: () => any
}

const List: FC<ListProps> = observer((props) => {
  const { activeType } = store
  const { onFetchList } = props
  const handleChange = (type: ReceiptStatusAllKey) => {
    store.changeFilter('status', RECEIPT_STATUS[type])
    store.changeActiveType(type)
    onFetchList()
  }
  return (
    <ListStatusTabs
      active={activeType}
      onChange={handleChange}
      TabComponent={ListTable}
      tabData={RECEIPT_TABS}
    />
  )
})

export default List
