import React, { FC } from 'react'
import { t } from 'gm-i18n'
import {
  BoxTable,
  BoxTableInfo,
  Price,
  Tip,
  Flex,
  Input,
  Dialog,
  BoxTableProps,
} from '@gm-pc/react'
import {
  Table,
  TableXUtil,
  BatchActionEdit,
  Column,
  TableProps,
} from '@gm-pc/table-x'
import { Observer, observer } from 'mobx-react'
import store from '../store'
import TableTotalText from '@/common/components/table_total_text'
import { Customer_Type, Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { Order_State, Order } from 'gm_api/src/order'
import { FilterComProps } from '../../interface'
import _ from 'lodash'

const { OperationCell, OperationDelete, OperationHeader } = TableXUtil

const List: FC<FilterComProps & Pick<BoxTableProps, 'pagination'>> = observer(
  ({ onSearch, pagination }) => {
    const { list, summary, customer_type } = store

    const isStudent = customer_type === Customer_Type.TYPE_VIRTUAL_STUDENT

    let deletePermission: Permission = 0
    if (customer_type === Customer_Type.TYPE_VIRTUAL_STUDENT) {
      deletePermission = Permission.PERMISSION_ORDER_DELETE_ESHOP_STUDENT_ORDER
    } else if (customer_type === Customer_Type.TYPE_VIRTUAL_SCHOOL_STAFF) {
      deletePermission = Permission.PERMISSION_ORDER_DELETE_ESHOP_STUFF_ORDER
    }

    const handleCancelOrder = (index: number) => {
      store.cancelOrder(index).then((json) => {
        Tip.success(t('订单删除成功'))
        onSearch()
        return json
      })
    }

    const handleDetail = (serial_no: string) => {
      window.open(
        `#/order/group_meal/${
          isStudent ? 'student' : 'staff'
        }/detail?serial_no=${serial_no}`,
      )
    }

    const handleDelete = (selected: string[], isSelectAll: boolean) => {
      Dialog.render({
        title: t('批量删除订单'),
        buttons: [
          {
            text: t('取消'),
            onClick: () => {
              Dialog.hide()
              store.changeBatchRemark('')
            },
          },
          {
            text: t('确定'),
            onClick: () => {
              store.batchDeleteOrder(selected, isSelectAll).then((json) => {
                Dialog.hide()
                store.changeBatchRemark('')
                globalStore.showTaskPanel('1')
                return json
              })
            },
            btnType: 'primary',
          },
        ],
        children: (
          <Flex column>
            <span>{t('确定要删除该订单吗？')}</span>
            <br />
            <Observer>
              {() => {
                return (
                  <Input
                    value={store.remark}
                    onChange={(event) =>
                      store.changeBatchRemark(event.target.value)
                    }
                  />
                )
              }}
            </Observer>
          </Flex>
        ),
      })
    }

    const columns: Column<Order>[] = [
      {
        Header: t('订单号'),
        accessor: 'serial_no',
        width: 150,
        diyEnable: false,
        fixed: 'left',
        Cell: (cellProps) => {
          const { original } = cellProps
          return (
            <div style={{ width: '150px' }}>
              <a
                className='gm-text-primary gm-cursor'
                style={{ textDecoration: 'underline' }}
                rel='noopener noreferrer'
                target='_blank'
                onClick={() => handleDetail(original.serial_no!)}
              >
                {original.serial_no}
              </a>
            </div>
          )
        },
      },
      {
        Header: t('下单日期'),
        accessor: 'order_time_text',
        minWidth: 100,
      },
      {
        Header: t('收货日期'),
        accessor: 'receive_time_text',
        minWidth: 100,
      },
      {
        Header: t('餐次'),
        accessor: 'menu_period_group_id_text',
        minWidth: 100,
      },
      {
        Header: t('下单金额'),
        id: 'order_price',
        minWidth: 80,
        accessor: (d: Order) => d.order_price + Price.getUnit(),
      },
      {
        Header: isStudent ? t('学生姓名') : t('职工姓名'),
        accessor: 'student_name_text',
        minWidth: 100,
      },
      {
        Header: t('联系方式'),
        hide: isStudent,
        accessor: 'phone_text',
        minWidth: 100,
      },
      {
        Header: t('家长姓名'),
        hide: !isStudent,
        accessor: 'parents_name_text',
        minWidth: 100,
      },
      {
        Header: t('家长联系方式'),
        hide: !isStudent,
        accessor: 'parents_phone_text',
        minWidth: 100,
      },
      {
        Header: t('学校'),
        accessor: 'school_text',
        minWidth: 100,
      },
      {
        Header: t('班级'),
        accessor: 'class_text',
        minWidth: 100,
      },
      {
        Header: t('状态'),
        accessor: 'state_text',
        minWidth: 100,
      },
      {
        Header: t('下单人'),
        accessor: 'creator_id_text',
        minWidth: 80,
      },
      {
        Header: t('备注'),
        accessor: 'remark',
        minWidth: 100,
      },
      {
        Header: OperationHeader,
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        diyEnable: false,
        id: 'action',
        fixed: 'right',
        diyItemText: '操作',
        Cell: (cellProps) => {
          const {
            original: { state },
            index,
          } = cellProps
          // 未进入生产的订单才能删除
          if (state !== Order_State.STATE_NOT_PRODUCE) return '-'
          return (
            <OperationCell>
              <OperationDelete
                disabled={
                  deletePermission !== 0 &&
                  !globalStore.hasPermission(deletePermission)
                }
                onClick={() => handleCancelOrder(index)}
                title={t('删除订单')}
              >
                <Flex column>
                  <span>{t('确定要删除该订单吗？')}</span>
                  <br />
                  <Observer>
                    {() => {
                      const { remark } = store.list[index]
                      return (
                        <Input
                          value={remark}
                          onChange={(event) =>
                            store.changeRemark(index, event.target.value)
                          }
                        />
                      )
                    }}
                  </Observer>
                </Flex>
              </OperationDelete>
            </OperationCell>
          )
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
                  label: t('订单总数'),
                  content: summary?.count,
                },
                {
                  label: t('下单金额'),
                  content: (
                    <Price
                      value={+summary.total_order_price}
                      precision={globalStore.dpOrder}
                    />
                  ),
                },
              ]}
            />
          </BoxTableInfo>
        }
      >
        <Table
          isBatchSelect
          isDiy
          id='viewOrder'
          data={list.slice()}
          keyField='serial_no'
          fixedSelect
          columns={columns}
          isSelectorDisable={(item: Order) =>
            item?.state !== Order_State.STATE_NOT_PRODUCE
          }
          batchActions={
            _.without(
              [
                globalStore.hasPermission(deletePermission) && {
                  children: (
                    <BatchActionEdit>{t('批量删除订单')}</BatchActionEdit>
                  ),
                  onAction: handleDelete,
                },
              ],
              false,
            ) as TableProps['batchActions']
          }
        />
      </BoxTable>
    )
  },
)

export default List
