import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import {
  BoxTable,
  LevelSelect,
  Price,
  BoxTableInfo,
  Modal,
  Flex,
  Button,
  Confirm,
  Popover,
  BoxTableProps,
} from '@gm-pc/react'
import {
  TableXUtil,
  BatchActionDefault,
  BatchActionEdit,
  Table,
  TableProps,
} from '@gm-pc/table-x'
import _ from 'lodash'
import moment from 'moment'
import { DataAddressName } from '@gm-pc/business'
import { map_Order_State, Order_State, Order } from 'gm_api/src/order'
import {
  ListOrderWithRelationRequest_PagingField,
  AutoUpdateOrderDriver,
} from 'gm_api/src/orderlogic'
import { toJS } from 'mobx'
import SVGPrint from '@/svg/print.svg'
import TableTotalText from '@/common/components/table_total_text'

import store from '../store'
import modalStore from '../../../components/order_print_modal_new/store'
import OrderPrintModalNew from '../../../components/order_print_modal_new/order_print_modal_new'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { checkDigit } from '@/common/util'
import { SortBy } from 'gm_api/src/common'

const getSort = (value: { [key: number]: string | null }): SortBy => {
  const key = +Object.keys(value)[0]
  return key
    ? {
        field: key,
        desc: value[key] === 'desc',
      }
    : {}
}
interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  refreshList: () => void
}

const FILTER_STORAGE = 'distribute_filterBox_V0.1'

export const openModal = (id?: string) => {
  const params = id ? { order_ids: [id] } : store.getParams()
  const sortBy = store.filter.sort_by
  const { needPopUp } = modalStore.printModalOptions
  // 需要弹窗提醒
  if (needPopUp) {
    modalStore.goToPrint(JSON.stringify(params), JSON.stringify(sortBy))
  } else {
    Modal.render({
      size: 'lg',
      onHide: Modal.hide,
      noContentPadding: true,
      children: (
        <OrderPrintModalNew
          onHide={Modal.hide}
          query={JSON.stringify(params)}
          sortBy={JSON.stringify(sortBy)}
        />
      ),
    })
  }
}

const handleAutoDriver = () => {
  Confirm({
    children: t('确认按最近一次的规划方式来快速规划司机吗？'),
    title: t('提示'),
  })
    .then(() => {
      return AutoUpdateOrderDriver({ filter: store.getParams() })
    })
    .then((json) => {
      globalStore.showTaskPanel('1')
      return null
    })
}

const handlePrintSetting = () => {
  modalStore.savePrintOptions('needPopUp', false)
  Modal.render({
    size: 'lg',
    onHide: Modal.hide,
    noContentPadding: true,
    children: <OrderPrintModalNew onHide={Modal.hide} isConfig />,
  })
}

const List: FC<ListProps> = ({ refreshList, pagination }) => {
  const {
    orderList,
    relation_info,
    loading,
    orderCount,
    ssuCategoryNumMap,
    ssuCategoryCheckedNumMap,
  } = store
  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <Observer>
            {() => (
              <TableTotalText
                data={[
                  {
                    label: t('订单总数'),
                    content: orderCount,
                  },
                ]}
              />
            )}
          </Observer>
        </BoxTableInfo>
      }
      action={
        <PermissionJudge
          permission={Permission.PERMISSION_DELIVERY_UPDATE_TASK}
        >
          <Button
            type='primary'
            onClick={() => handlePrintSetting()}
            className='gm-margin-right-10'
          >
            {t('打印设置')}
          </Button>
          <Button
            type='primary'
            onClick={handleAutoDriver}
            className='gm-margin-right-10'
          >
            {t('智能规划')}
          </Button>
        </PermissionJudge>
      }
    >
      <Table<Order>
        isBatchSelect
        isDiy
        data={orderList}
        id={FILTER_STORAGE}
        loading={loading}
        keyField='order_id'
        onHeadersSort={(des) => {
          store.changeFilter('sort_by', getSort(des))
          refreshList()
        }}
        batchActions={
          _.without(
            [
              globalStore.hasPermission(
                Permission.PERMISSION_DELIVERY_PRINT_TASK,
              ) && {
                children: (
                  <BatchActionDefault>{t('批量打印')}</BatchActionDefault>
                ),
                onAction: (selected: string[], isSelectedAll: boolean) => {
                  store.handleChangeSelect('selectedRecord', selected)
                  store.handleChangeSelect('isSelectedAll', isSelectedAll)
                  openModal()
                  store.paramsInit()
                },
              },
              globalStore.hasPermission(
                Permission.PERMISSION_DELIVERY_UPDATE_TASK,
              ) && {
                children: (
                  <BatchActionEdit>{t('批量修改司机')}</BatchActionEdit>
                ),
                onAction: (selected: string[], isSelectedAll: boolean) => {
                  store.handleChangeSelect('selectedRecord', selected)
                  store.handleChangeSelect('isSelectedAll', isSelectedAll)
                  Modal.render({
                    children: (
                      <Flex alignCenter>
                        <div>{t('选择司机：')}</div>
                        <LevelSelect
                          selected={[]}
                          data={toJS(store.driver_select_list)}
                          onSelect={(value) => {
                            store.batchUpdateOrderDriver(value[1]).then(() => {
                              globalStore.showTaskPanel('1')
                              store.paramsInit()
                              return null
                            })
                          }}
                          onlySelectLeaf
                        />
                      </Flex>
                    ),
                    title: t('批量修改司机'),
                    size: 'sm',
                    onHide: Modal.hide,
                  })
                },
              },
            ],
            false,
          ) as TableProps['batchActions']
        }
        columns={[
          {
            Header: t('订单号/分拣序号'),
            minWidth: 150,
            accessor: 'serial_no',
            diyEnable: false,
            id: ListOrderWithRelationRequest_PagingField?.SERIAL_NO,
            headerSort: true,
            Cell: (cellProps) => {
              return (
                <div style={{ width: '150px' }}>
                  {cellProps.original.serial_no}/
                  {cellProps.original.sorting_num || t('无')}
                </div>
              )
            },
          },
          {
            Header: t('线路'),
            id: 'route_id',
            diyEnable: false,
            minWidth: 100,
            accessor: (order) =>
              !_.isEmpty(relation_info) &&
              (relation_info.routes![
                relation_info.customer_routes![order.receive_customer_id!]
              ]?.route_name ||
                t('无')),
          },
          {
            Header: t('报价单'),
            accessor: 'quotation_id',
            hide: globalStore.isLite,
            minWidth: 80,
            Cell: (cellProps) => {
              return (
                relation_info.quotations?.[cellProps.original.quotation_id!]
                  ?.inner_name || t('无')
              )
            },
          },
          {
            Header: t('商户自定义编码'),
            accessor: 'res_custom_code',
            diyItemText: t('商户自定义编码'),
            diyEnable: true,
            minWidth: 120,
            Cell: (cellProps) => {
              return (
                relation_info.customers?.[cellProps.original.bill_customer_id!]
                  ?.customized_code || ''
              )
            },
          },
          {
            Header: t('商户名'),
            accessor: 'customer_name',
            diyItemText: t('商户名'),
            diyEnable: false,
            minWidth: 120,
            id: ListOrderWithRelationRequest_PagingField?.RECEIVE_CUSTOMER_NAME,
            headerSort: true,
            Cell: (cellProps) => {
              return (
                relation_info.customers?.[cellProps.original.bill_customer_id!]
                  ?.name || ''
              )
            },
          },
          // {
          //   Header: t('商户标签'),
          //   accessor: 'address_label',
          //   diyEnable: false,
          //   minWidth: 120,
          // },
          {
            Header: t('地理标签'),
            id: 'area',
            minWidth: 120,
            hide: globalStore.isLite,
            show: false,
            Cell: (cellProps) => {
              const address = {
                city_id: cellProps.original.city_id,
                district_id: cellProps.original.district_id,
                street_id: cellProps.original.street_id,
              }
              return <DataAddressName address={address} />
            },
          },
          {
            Header: t('配送地址'),
            minWidth: 150,
            diyEnable: false,
            accessor: 'receive_address',
            Cell: (cellProps) =>
              cellProps.original.addresses?.addresses?.length
                ? cellProps.original.addresses.addresses[0].address
                : t('无'),
          },
          {
            Header: t('承运商/司机'),
            accessor: 'driver',
            diyEnable: false,
            minWidth: 150,
            Cell: (cellProps) => {
              const { driver_id } = cellProps.original
              const distribution_contractor_id =
                _.find(
                  store.relation_info.group_users,
                  (item) => item.group_user_id === driver_id,
                )?.distribution_contractor_id || ''
              const driverSelect =
                driver_id && distribution_contractor_id
                  ? [distribution_contractor_id, driver_id]
                  : []
              return (
                <Observer>
                  {() => (
                    <LevelSelect
                      disabled={
                        !globalStore.hasPermission(
                          Permission.PERMISSION_DELIVERY_UPDATE_TASK,
                        )
                      }
                      selected={driverSelect}
                      data={toJS(store.driver_select_list)}
                      onSelect={(value) => {
                        store.handleChangeOrder(
                          cellProps.index,
                          'driver_id',
                          value[1],
                        )
                        store
                          .updateOrder(cellProps.index)
                          .then(() => refreshList())
                      }}
                      onlySelectLeaf
                    />
                  )}
                </Observer>
              )
            },
          },
          {
            Header: t('收货时间'),
            // id: 'receive_time',
            minWidth: 150,
            id: ListOrderWithRelationRequest_PagingField?.RECEIVE_TIME,
            headerSort: true,
            accessor: (order: Order) =>
              moment(new Date(+order.receive_time!)).format('YYYY-MM-DD HH:mm'),
          },
          {
            Header: t('销售额'),
            accessor: 'sale_price',
            minWidth: 80,
            Cell: (cellProps) =>
              cellProps.original.sale_price + Price.getUnit(),
          },
          {
            Header: t('订单状态'),
            accessor: 'state',
            minWidth: 100,
            Cell: (cellProps) => {
              return (
                map_Order_State[cellProps.original.state! as Order_State] ||
                t('未知')
              )
            },
          },
          {
            Header: t('验货商品数'),
            accessor: 'checkGoodsNums',
            hide: globalStore.isLite,
            minWidth: 100,
            Cell: (cellProps) => {
              const orderId = cellProps.original.order_id
              return `${ssuCategoryCheckedNumMap[orderId] ?? 0} / ${
                ssuCategoryNumMap[orderId]
              }`
            },
          },
          {
            Header: t('装车状态'),
            accessor: 'isLoad',
            hide: globalStore.isLite,
            minWidth: 100,
            Cell: (cellProps) => {
              return t(
                checkDigit(cellProps.original.status, 16) ? '已装车' : '未装车',
              )
            },
          },
          {
            Header: t('打印状态'),
            id: 'status',
            diyItemText: t('打印状态'),
            minWidth: 80,
            show: false,
            accessor: (order) => {
              const print = +order.status! & (1 << 9)
              return print ? t('已打印') : t('未打印')
            },
          },
          {
            Header: t('订单备注'),
            accessor: 'remark',
            id: 'orderRemark',
            hide: globalStore.isLite,
            minWidth: 100,
            Cell: (order) => {
              const str = order.value
              return (
                <Popover
                  showArrow
                  center
                  type='hover'
                  popup={
                    <div className='gm-padding-10' style={{ width: '300px' }}>
                      {str || '-'}
                    </div>
                  }
                >
                  <span className='b-ellipsis-order-remark'>{str || '-'}</span>
                </Popover>
              )
            },
          },
          // canPrintDistribute &&
          {
            Header: t('单据打印'),
            id: 'print_actions',
            diyEnable: false,
            fixed: 'right',
            width: TableXUtil.TABLE_X.WIDTH_OPERATION,
            accessor: (order) => {
              return (
                <TableXUtil.OperationCell>
                  <PermissionJudge
                    permission={Permission.PERMISSION_DELIVERY_PRINT_TASK}
                  >
                    <span
                      className='gm-text-14 gm-text-hover-primary'
                      onClick={() => openModal(order.order_id)}
                    >
                      <SVGPrint />
                    </span>
                  </PermissionJudge>
                  {/* </OrderPrePrintBtn> */}
                </TableXUtil.OperationCell>
              )
            },
          },
        ]}
      />
    </BoxTable>
  )
}
export default observer(List)
