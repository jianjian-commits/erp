import React, { FC, useMemo } from 'react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import moment from 'moment'
import { observer } from 'mobx-react'
import { Modal, Price } from '@gm-pc/react'
import { history } from '@/common/service'
import store from '../store/select_order_store'
import { toFixedOrder } from '@/common/util'
import globalStore from '@/stores/global'

const { OperationHeader, OperationCell, OperationIcon } = TableXUtil

const List: FC = observer(() => {
  const { list } = store

  const handleToDetail = (serial_no: string) => {
    Modal.hide()
    history.push(
      `/order/after_sales/after_sales_list/create?order_id=${serial_no}&type=create`,
    )
  }
  const _columns: Column[] = useMemo(() => {
    return [
      {
        Header: t('订单号'),
        accessor: 'serial_no',
        minWidth: 140,
      },
      {
        Header: t('商户名'),
        accessor: 'customer_name',
        minWidth: 100,
      },
      {
        Header: globalStore.isLite ? t('下单金额') : t('销售金额'),
        id: 'sale_price',
        minWidth: 100,
        accessor: (d) =>
          toFixedOrder(
            (globalStore.isLite ? d.order_price! : d.sale_price!) || 0,
          ) + Price.getUnit(),
      },
      {
        Header: t('下单时间'),
        id: 'order_time',
        accessor: (d) => {
          return moment(new Date(+d.order_time!)).format('YYYY-MM-DD HH:mm')
        },
        minWidth: 150,
      },
      {
        Header: t('收货时间'),
        id: 'receive_time',
        accessor: (d) => {
          return moment(new Date(+d.receive_time!)).format('YYYY-MM-DD HH:mm')
        },
        minWidth: 150,
      },
      {
        Header: OperationHeader,
        id: 'op',
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        Cell: (cellProps) => (
          <OperationCell>
            <OperationIcon
              tip={t('选择该订单做售后')}
              onClick={() => handleToDetail(cellProps.original.serial_no)}
            >
              <span className='gm-text-primary gm-cursor'>{t('选择')}</span>
            </OperationIcon>
          </OperationCell>
        ),
      },
    ]
  }, [])
  return (
    <Table data={list} columns={_columns} className='gm-margin-bottom-20' />
  )
})

export default List
