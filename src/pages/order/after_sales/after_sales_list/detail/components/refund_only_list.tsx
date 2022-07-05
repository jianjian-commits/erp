import React, { FC, useRef } from 'react'
import { BoxPanel, Flex, Price, Select } from '@gm-pc/react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import store from '../../store/detail_store'
import { observer } from 'mobx-react'
import { TextAreaCell } from '../../components/after_sales_cell'
import type { RefundOnlyList as RefundOnlyList_ } from '../../interface'
import {
  AfterSaleOrderDetail_Type,
  AfterSaleOrder_Status,
  map_AfterSaleOrderDetail_Type,
} from 'gm_api/src/aftersale'
import { toFixedOrder } from '@/common/util'
import { toBasicUnit } from '@/pages/order/util'
import Big from 'big.js'
const { TABLE_X } = TableXUtil

const RefundOnlyList: FC = observer(() => {
  const { refundDetailOnly } = store

  const ref = useRef<any>(null)

  const column = React.useMemo(() => {
    return [
      {
        Header: t('序号'),
        accessor: 'num',
        fixed: 'left',
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          const { index } = cellProps
          return index + 1
        },
      },
      {
        Header: t('商品名'),
        isKeyboard: true,
        accessor: 'sku_name',
        minWidth: 190,
        Cell: (cellProps) => (
          <TextAreaCell field='sku_name' data={cellProps.original} />
        ),
      },
      {
        Header: t('下单单位'),
        isKeyboard: true,
        accessor: 'fee_unit_name',
        hide: store.withOrder,
        minWidth: 190,
        Cell: (cellProps) => <div>{cellProps.original.fee_unit_name}</div>,
      },
      {
        Header: t('商品分类'),
        accessor: 'category_name',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='category_name' data={cellProps.original} />
          )
        },
      },
      {
        Header: t('售后类型'),
        accessor: 'type',
        minWidth: 190,
        Cell: (cellProps) => (
          <div>{t(map_AfterSaleOrderDetail_Type[cellProps.original.type])}</div>
        ),
      },
      {
        Header: t('出库数'),
        accessor: 'amount',
        minWidth: 190,
        Cell: (cellProps) => {
          return store.withOrder ? (
            <TextAreaCell field='amount' data={cellProps.original} />
          ) : (
            '-'
          )
        },
      },
      {
        Header: t('销售单价'),
        accessor: 'sales_price',
        minWidth: 190,
        Cell: (cellProps) => {
          return store.withOrder ? (
            <TextAreaCell field='sales_price' data={cellProps.original} />
          ) : (
            <div>
              {cellProps.original.sales_price}/
              {cellProps.original.fee_unit_name}
            </div>
          )
        },
      },
      {
        Header: t('可退数量'),
        accessor: 'can_return_value',
        minWidth: 190,
        Cell: (cellProps) => (
          <div>{cellProps.original.can_return_value || '-'}</div>
        ),
      },
      {
        Header: t('申请退款数'),
        isKeyboard: true,
        accessor: 'apply_return_value',
        minWidth: 190,
        Cell: (cellProps) => {
          const {
            original: { apply_return_value, outstock_unit_name },
          } = cellProps
          const { quantity } = apply_return_value?.calculate!
          return (
            <Flex justifyStart alignCenter>
              <div>{Number(quantity).toFixed(2)}</div>
              <Flex className='gm-margin-left-5'>{outstock_unit_name}</Flex>
            </Flex>
          )
        },
      },
      {
        Header: t('退款单价'),
        isKeyboard: true,
        accessor: 'apply_return_value',
        minWidth: 190,
        Cell: (cellProps) => {
          const {
            original: { apply_return_value, fee_unit_name },
          } = cellProps
          const { price } = apply_return_value?.calculate!
          return (
            <Flex justifyStart alignCenter>
              <div>{Number(price).toFixed(2)}</div>
              <Flex className='gm-margin-left-5'>{`${Price.getUnit()}/${
                fee_unit_name || '-'
              }`}</Flex>
            </Flex>
          )
        },
      },
      {
        Header: t('申请退款金额'),
        accessor: 'apply_return_amount',
        minWidth: 190,
        Cell: (cellProps) => {
          const {
            original: { apply_return_value, order_id, apply_return_amount },
          } = cellProps
          const { input } = apply_return_value
          const order_price = toFixedOrder(
            Big(
              toBasicUnit(
                input?.quantity || '0',
                cellProps.original,
                'quantity',
              ),
            ).times(
              toBasicUnit(input?.price || '0', cellProps.original, 'price'),
            ),
          )
          if (order_id && order_id !== '0') {
            return <div>{order_price + Price.getUnit()}</div>
          } else {
            return <div>{apply_return_amount + Price.getUnit()}</div>
          }
        },
      },
      {
        Header: t('处理方式'),
        accessor: 'task_method',
        minWidth: 190,
        Cell: (cellProps) => {
          return <TextAreaCell field='task_method' data={cellProps.original} />
        },
      },
      {
        Header: t('实退数'),
        accessor: 'real_return_value',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='real_return_value' data={cellProps.original} />
          )
        },
      },
      {
        Header: t('实退金额'),
        accessor: 'real_return_amount',
        minWidth: 190,
        Cell: (cellProps) => {
          const {
            original: { status },
          } = cellProps
          return (
            <>
              {(status && status === AfterSaleOrder_Status.STATUS_REFUNDED && (
                <TextAreaCell
                  field='real_return_amount'
                  data={cellProps.original}
                />
              )) ||
                '-'}
            </>
          )
        },
      },
      {
        Header: t('供应商'),
        accessor: 'supplier_id',
        minWidth: 190,
        Cell: (cellProps) => (
          <TextAreaCell field='supplier_id' data={cellProps.original} />
        ),
      },
      {
        Header: t('责任部门'),
        isKeyboard: true,
        accessor: 'department_blame_name',
        minWidth: 190,
        Cell: (cellProps) => (
          <TextAreaCell
            field='department_blame_name'
            data={cellProps.original}
          />
        ),
      },
      {
        Header: t('跟进部门'),
        isKeyboard: true,
        accessor: 'department_to_name',
        minWidth: 190,
        Cell: (cellProps) => (
          <TextAreaCell field='department_to_name' data={cellProps.original} />
        ),
      },
      {
        Header: t('售后原因'),
        isKeyboard: true,
        accessor: 'reason',
        minWidth: 190,
        Cell: (cellProps) => (
          <TextAreaCell field='reason' data={cellProps.original} />
        ),
      },
      {
        Header: t('售后方式'),
        isKeyboard: true,
        accessor: 'method',
        minWidth: 190,
        Cell: (cellProps) => (
          <TextAreaCell field='method' data={cellProps.original} />
        ),
      },
      {
        Header: t('备注'),
        isKeyboard: true,
        accessor: 'remark',
        minWidth: 190,
        Cell: (cellProps) => (
          <TextAreaCell field='remark' data={cellProps.original} />
        ),
      },
      {
        Header: t('最后操作人'),
        accessor: 'last_operator_id',
        minWidth: 190,
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='last_operator_id' data={cellProps.original} />
          )
        },
      },
    ] as Column<RefundOnlyList_>[]
  }, [])

  return (
    <>
      <div className='after_sale_list_title'>{t('售后明细')}</div>
      <Table
        isVirtualized
        id='refund_detail_only_table'
        refVirtualized={ref}
        columns={column}
        data={refundDetailOnly.slice()}
      />
    </>
  )
})

export default RefundOnlyList
