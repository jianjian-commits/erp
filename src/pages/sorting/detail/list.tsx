import PermissionJudge from '@/common/components/permission_judge'
import { toFixedOrder } from '@/common/util'
import globalStore from '@/stores/global'
import { BoxTable, BoxTableProps, Button, Flex, Tip } from '@gm-pc/react'
import { Table, TableXUtil, TableX } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import {
  map_Order_State,
  map_SortingStatus,
  Order_State,
} from 'gm_api/src/order'
import { toJS } from 'mobx'
import { Observer, observer } from 'mobx-react'
import React, { FC } from 'react'
import InputNumberEditor from '../components/input_numbe_editor'
import { List } from './interface'
import sortingDetailStore from './store'

interface SortingOrderExpandTableProps
  extends Pick<BoxTableProps, 'pagination'> {
  onSearch?: () => void
}

const SortingOrderExpandTable: FC<SortingOrderExpandTableProps> = ({
  onSearch,
  pagination,
}) => {
  const handleExport = () => {
    sortingDetailStore.exportSortingPerformance().then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  const handleUpdateList = (data: List) => {
    sortingDetailStore
      .updateWeight(data.order_detail_id, String(data.weightQuantity))
      .then(() => {
        Tip.success(t('更新成功'))
        onSearch && onSearch()
        return null
      })
      .catch((res) => {
        if (res.response.sorting_conflict) {
          Tip.danger(
            t(
              `更新失败，版本冲突 res.response.sorting_conflict=${res.response.sorting_conflict}`,
            ),
          )
        }
        return null
      })
  }

  const { list } = sortingDetailStore
  console.log('list:', toJS(list))

  return (
    <BoxTable
      pagination={pagination}
      action={
        <div>
          <PermissionJudge
            permission={
              Permission.PERMISSION_SORTING_EXPORT_SORTING_PERFORMANCE
            }
          >
            <Button
              type='primary'
              onClick={handleExport.bind(this, 1)}
              className='gm-margin-right-10'
            >
              {t('绩效导出')}
            </Button>
          </PermissionJudge>
        </div>
      }
    >
      {/* Table组件存在输入框失效的问题，无更好的方法，先用TableX */}
      <TableX<List>
        data={list}
        columns={[
          {
            Header: t('商品名'),
            minWidth: 80,
            id: 'name',
            accessor: (d: List) => d.sku.name,
          },
          {
            Header: t('商品编码'),
            minWidth: 80,
            id: 'customize_code',
            accessor: (d: List) => d.sku.customize_code,
          },
          {
            Header: t('商户编码'),
            minWidth: 80,
            id: 'receive_customer_id',
            accessor: (d: List) => d.receive_customer_id,
          },
          {
            Header: t('商户名'),
            minWidth: 80,
            id: 'customer_name',
            accessor: (d: List) => d.customer.name,
          },
          {
            Header: t('分类'),
            minWidth: 80,
            accessor: 'categoryName',
          },
          {
            Header: t('报价单'),
            minWidth: 80,
            accessor: 'quotationName',
          },
          {
            Header: t('线路'),
            minWidth: 80,
            accessor: '_route',
          },
          {
            Header: t('分拣序号'),
            minWidth: 80,
            accessor: (d: List) => d.sorting_num || '-',
          },
          {
            Header: t('订单号'),
            minWidth: 80,
            accessor: 'serial_no',
          },
          {
            Header: t('订单状态'),
            minWidth: 80,
            accessor: 'state',
            Cell: (props) => {
              const order = props.original
              return (
                <div>
                  {map_Order_State[order.state! as Order_State] ||
                    t('未知') + `(${order.sorting_num || '-'})`}
                </div>
              )
            },
          },
          {
            Header: t('分拣状态'),
            minWidth: 80,
            id: 'sorting_status',
            accessor: (d: List) => map_SortingStatus[d.sorting_status!] || '-',
          },
          {
            Header: t('订单打印状态'),
            id: '_order_print_status',
            minWidth: 80,
            accessor: (order: List) => {
              const print = order._order_print_status & (1 << 9)
              return print ? t('已打印') : t('未打印')
            },
          },
          {
            Header: (
              <div>
                {t('下单数')}
                <br />
                {`（${t('下单单位')}）`}
              </div>
            ),
            minWidth: 80,
            accessor: 'orderQuantity',
            Cell: (props) => {
              const data = props.original
              return (
                toFixedOrder(data.orderQuantity || 0) +
                  data.orderQuantityUnit || '-'
              )
            },
          },
          {
            Header: t('称重数（下单单位）'),
            minWidth: 80,
            accessor: 'weightQuantity',
            Cell: (props) => (
              <Observer>
                {() => {
                  const index = props.index
                  const data = props.original
                  const value = toFixedOrder(data.weightQuantity || 0)
                  return (
                    <Flex alignCenter>
                      <InputNumberEditor
                        defaultValue={+value}
                        editing={data.editing}
                        onChange={(value) => {
                          sortingDetailStore.updateListItem(
                            index,
                            'weightQuantity',
                            value,
                          )
                        }}
                      />
                      <div className='gm-flex-flex'>
                        {data.weightQuantityUnit}
                      </div>
                    </Flex>
                  )
                }}
              </Observer>
            ),
          },
          {
            Header: t('分拣备注'),
            minWidth: 80,
            id: 'sorting_remark',
            accessor: (d: List) => d.sorting_remark || '-',
          },
          {
            Header: TableXUtil.OperationHeader,
            minWidth: 80,
            id: 'action',
            Cell: (props) => (
              <Observer>
                {() => {
                  const data = props.original
                  return (
                    <TableXUtil.OperationCell>
                      <TableXUtil.OperationCellRowEdit
                        disabled={
                          !globalStore.hasPermission(
                            Permission.PERMISSION_SORTING_EDIT_SORTING_TASK,
                          )
                        }
                        isEditing={data.editing}
                        onClick={() => {
                          sortingDetailStore.updateEditing(data, true)
                        }}
                        onCancel={() => {
                          sortingDetailStore.updateEditing(data, false)
                        }}
                        onSave={() => {
                          handleUpdateList(data)
                        }}
                      />
                    </TableXUtil.OperationCell>
                  )
                }}
              </Observer>
            ),
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(SortingOrderExpandTable)
