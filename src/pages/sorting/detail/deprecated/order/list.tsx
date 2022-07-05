import { t } from 'gm-i18n'
import React from 'react'
import { Observer, observer } from 'mobx-react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import TableTotalText from '@/common/components/table_total_text'

import orderStore from './order_store'
import {
  InputNumber,
  Flex,
  BoxTable,
  Button,
  BoxTableInfo,
  Progress,
  BoxTableProps,
} from '@gm-pc/react'

import { SortingList, OrderList_OrderDetail } from './interface'
import moment from 'moment'
import { map_Order_State, Order_State } from 'gm_api/src/order'
import { toFixedOrder } from '@/common/util'
import { map_App_Type } from 'gm_api/src/common'
import { appTypeMap } from './enum'

const SortingOrderExpandTable = ({
  pagination,
}: Pick<BoxTableProps, 'pagination'>) => {
  const handleExport = () => {}

  const { list, listMeta } = orderStore

  const tableXColumn: Column<SortingList>[] = [
    {
      Header: t('下单日期'),
      id: 'order_time',
      accessor: (d) => {
        return moment(new Date(+d.order_time!)).format('YYYY-MM-DD HH:mm')
      },
    },
    {
      Header: t('收货日期'),
      id: 'receive_time',
      accessor: (d) => {
        return moment(new Date(+d.receive_time!)).format('YYYY-MM-DD HH:mm')
      },
    },
    {
      Header: t('订单号'),
      accessor: 'serial_no',
    },
    {
      Header: t('商户名'),
      id: 'customer',
      accessor: (d) => {
        return `${d?.customer?.name}(${d.customer?.customized_code})`
      },
    },
    {
      Header: t('线路'),
      accessor: '_route',
    },
    {
      Header: t('分拣序号'),
      accessor: (d) => d.sorting_num || '-',
    },
    {
      Header: t('订单状态'),
      accessor: 'state',
      Cell: (props) => {
        const order = props.original
        return (
          <div>
            {map_Order_State[order.state! as Order_State] ||
              t('未知') + `(${order.sorting_num || '-'})`}{' '}
          </div>
        )
      },
    },
    {
      Header: t('订单来源'),
      accessor: 'app_type',
      Cell: (props) => {
        const order = props.original
        return (
          <div>
            {appTypeMap[`${order.app_type!}_${order.order_op}`] ||
              map_App_Type[order.app_type!]}
          </div>
        )
      },
    },
    {
      Header: t('司机'),
      id: 'driver',
      accessor: (d) => d.driver?.name || '-',
    },
    {
      Header: t('分拣进度'),
      accessor: 'finished',
      Cell: (props) => (
        <Progress percentage={parseFloat(props.original._process)} />
      ),
    },
    {
      Header: t('打印状态'),
      id: 'print_state',
      accessor: (d) => (d.print_state ? '已打印' : '未打印'),
    },
    {
      Header: t('单据打印'),
      accessor: 'driver_name',
      Cell: (props) => {
        return <div>todo</div>
      },
    },
  ]

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('全部订单数'),
                content: listMeta.total,
              },
              {
                label: t('完成订单数'),
                content: listMeta.finish,
              },
              {
                label: t('未完成订单数'),
                content: listMeta.unFinish,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <div>
          <Button
            type='primary'
            onClick={handleExport.bind(this, 1)}
            className='gm-margin-right-10'
          >
            {t('绩效导出')}
          </Button>
          <Button type='primary' plain onClick={handleExport.bind(this, 2)}>
            {t('缺货导出')}
          </Button>
        </div>
      }
    >
      <Table
        isExpand
        data={list}
        keyField='order_id'
        columns={tableXColumn}
        SubComponent={({ index }: { index: number }) => (
          <Table<OrderList_OrderDetail>
            isSub
            data={list[index].order_details}
            columns={[
              {
                Header: t('商品名'),
                id: 'name',
                accessor: (d) => d.ssu.name,
              },
              {
                Header: t('分类'),
                accessor: 'categoryName',
              },
              {
                Header: t('报价单'),
                accessor: 'quotationName',
              },
              {
                Header: (
                  <div>
                    {t('下单数')}
                    <br />
                    {`（${t('包装单位')}）`}
                  </div>
                ),
                accessor: 'quantity',
                Cell: (props) => {
                  const ssu = props.original
                  return (
                    toFixedOrder(ssu.quantity || 0) + ssu.ssu_unit_name || '-'
                  )
                },
              },
              {
                Header: (
                  <div>
                    {t('下单数')}
                    <br />
                    {`（${t('基本单位')}）`}
                  </div>
                ),
                accessor: 'baseQuantity',
                Cell: (props) => {
                  const ssu = props.original
                  return (
                    toFixedOrder(ssu.baseQuantity || 0) +
                      ssu.ssu_base_unit_name || '-'
                  )
                },
              },
              {
                Header: t('称重数（基本单位）'),
                accessor: 'baseRealQuantity',
                Cell: (props) => (
                  <Observer>
                    {() => {
                      const ssu = props.original
                      const value = toFixedOrder(ssu.baseRealQuantity || 0)
                      return (
                        <Flex>
                          <div>
                            {ssu.editing ? (
                              <InputNumber
                                style={{ width: '65%' }}
                                value={+value}
                                onChange={(value) => {}}
                              />
                            ) : (
                              <div>{value}</div>
                            )}
                          </div>
                          <div>{ssu.ssu_base_unit_name}</div>
                        </Flex>
                      )
                    }}
                  </Observer>
                ),
              },
              {
                Header: t('称重数（包装单位）'),
                accessor: 'realQuantity',
                Cell: (props) => {
                  const ssu = props.original
                  return (
                    toFixedOrder(ssu.realQuantity || 0) + ssu.ssu_unit_name ||
                    '-'
                  )
                },
              },
              {
                Header: t('分拣备注'),
                id: 'remark',
                accessor: (d) => d.remark || '-',
              },
              {
                Header: TableXUtil.OperationHeader,
                id: 'action',
                Cell: (props) => (
                  <Observer>
                    {() => {
                      const data = props.original
                      return (
                        <TableXUtil.OperationCell>
                          <TableXUtil.OperationCellRowEdit
                            isEditing={data.editing}
                            onClick={() => {
                              orderStore.updateEditing(data, true)
                            }}
                            onCancel={() => {
                              orderStore.updateEditing(data, false)
                            }}
                            onSave={() => {}}
                          />
                        </TableXUtil.OperationCell>
                      )
                    }}
                  </Observer>
                ),
              },
            ]}
          />
        )}
      />
    </BoxTable>
  )
}

export default observer(SortingOrderExpandTable)
