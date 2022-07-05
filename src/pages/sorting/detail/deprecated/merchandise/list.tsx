import { t } from 'gm-i18n'
import React from 'react'
import {
  BoxTableInfo,
  BoxTable,
  Button,
  ProgressCircle,
  Flex,
  InputNumber,
  BoxTableProps,
} from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'

import merchandiseStore from './merchandise_store'
import TableTotalText from '@/common/components/table_total_text'
import { List_OrderDetail } from './interface'
import { toFixedOrder } from '@/common/util'
import { Observer } from 'mobx-react'
import { map_Order_State, Order_State } from 'gm_api/src/order'

const SortingMerchandiseExpandTable = ({
  pagination,
}: Pick<BoxTableProps, 'pagination'>) => {
  const handleExport = () => {}

  const { list } = merchandiseStore

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('全部商品'),
                content: 0,
              },
              {
                label: t('完成商品数'),
                content: 0,
              },
              {
                label: t('未完成商品数'),
                content: 0,
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
      <Table<List_OrderDetail>
        isExpand
        data={list}
        columns={[
          {
            Header: t('商品名'),
            accessor: 'name',
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
            Header: t('分拣进度'),
            accessor: '_process',
            Cell: (props) => {
              return (
                <ProgressCircle
                  percentage={props.original._process}
                  size={20}
                />
              )
            },
          },
        ]}
        SubComponent={({ index }) => (
          <Table<List_OrderDetail>
            isSub
            data={list[index].sub_list}
            columns={[
              {
                Header: t('商户名'),
                accessor: 'customerName',
              },
              {
                Header: t('线络'),
                accessor: 'route',
              },
              {
                Header: t('分拣序号'),
                accessor: 'sorting_num',
              },
              {
                Header: t('订单号'),
                accessor: 'serial_no',
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
                Header: t('订单类型'),
                accessor: 'order_process_name',
                Cell: () => '',
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
                accessor: (d: List_OrderDetail) => d.remark || '-',
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
                              merchandiseStore.updateEditing(data, true)
                            }}
                            onCancel={() => {
                              merchandiseStore.updateEditing(data, false)
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

export default SortingMerchandiseExpandTable
