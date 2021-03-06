import React, { useState } from 'react'
import { t } from 'gm-i18n'
import {
  BoxTable,
  BoxTableInfo,
  Price,
  Button,
  FunctionSet,
  Modal,
  Popover,
  BoxTableProps,
  Confirm,
} from '@gm-pc/react'
import {
  Table,
  TableXUtil,
  BatchActionEdit,
  BatchActionDefault,
  Column,
} from '@gm-pc/table-x'
import { Drawer } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import { gmHistory as history } from '@gm-common/router'
import TableTotalText, {
  TotalTextOptions,
} from '@/common/components/table_total_text'
import {
  ProcessedProductPlan,
  NotProcessedProductPlan,
} from '../../components/product_plan'
import Operation from './operation'
import EditState from './edit_state'
import OrderState from './order_state'
import BatchImport from '../../../components/batch/import'
import store from '../store'
import orderTaskStore from '@/pages/delivery/delivery_task/order_task/store'
import { map_App_Type, App_Type } from 'gm_api/src/common'
import {
  BatchUpdateOrderState,
  BatchSyncSaleOutStockSheetFromOrder,
  BatchSyncPriceToOrder,
  BatchSyncOrderPriceToBasic,
} from 'gm_api/src/orderlogic'
import { OrderInfoViewOrder } from '../interface'
import { Order_State, map_Order_PayState } from 'gm_api/src/order'
import { toFixedOrder, getReceiptStatusText } from '@/common/util'
import { appTypeMap } from '../../../../enum'

import globalStore from '@/stores/global'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { getOrderDetailUrl } from '../../../../util'

import SVGAnomaly from '@/svg/triangle-warning.svg'
import HeaderTip from '@/common/components/header_tip'

import OrderPrintModalNew from '@/pages/delivery/components/order_print_modal_new/order_print_modal_new'

import DrawerTitle from '../../components/product_plan/components/process_drawer_title'
import { BatchActionBarItem } from '@gm-pc/table-x/src/components'
import { openModal } from '@/pages/delivery/delivery_task/order_task/componetns/list'
import syncConfirm, { syncConfirmStore } from '../../components/sync_confirm'
import LineText from '@/pages/order/components/line_text'
const bodyStyle = { marginBottom: '42px' }

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const [processdVisible, setProcessdVisible] = useState(false)
  const [notProcessdVisible, setNotProcessdVisible] = useState(false)
  // isSelectAll???selected????????????????????????????????????????????????????????????
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const isOrderDisabled = () => false

  function handleCreateOrder(): void {
    window.open('#/order/order_manage/create')
  }

  function handleCreateOrderByMenu(): void {
    history.push('/order/order_manage/menu_create')
  }

  function handlePrint() {
    Modal.render({
      onHide: Modal.hide,
      size: 'lg',
      noContentPadding: true,
      children: <OrderPrintModalNew onHide={Modal.hide} isConfig />,
    })
  }

  // ??????????????????
  const handleBatchSyncPrice = async (params: {
    selected: string[]
    isSelectAll: boolean
  }) => {
    syncConfirm().then(async () => {
      const { isSelectAll, selected } = params
      const options = {
        filter: {
          common_list_order: {
            ...store.getParams(),
            order_ids: !isSelectAll ? selected : undefined,
          },
          paging: { limit: 999 },
        },
        all: !!isSelectAll,
        available_periodic_child_quotation: true,
      }
      if (syncConfirmStore.order_price_to_basic) {
        await BatchSyncOrderPriceToBasic(options)
      } else {
        await BatchSyncPriceToOrder(options)
      }
      globalStore.showTaskPanel('1')
      return null
    })
  }

  const columns: Column<OrderInfoViewOrder>[] = [
    {
      Header: t('?????????'),
      diyGroupName: t('????????????'),
      id: 'serial_no',
      width: 150,
      diyEnable: false,
      fixed: 'left' as any,
      accessor: (d) => (
        <div className='gm-inline'>
          <a
            href={getOrderDetailUrl(d)}
            className='gm-text-primary'
            style={{ textDecoration: 'underline' }}
            rel='noopener noreferrer'
            target='_blank'
          >
            {d.serial_no}
          </a>
          {(+d.status! & (1 << 14) && (
            <Popover
              showArrow
              center
              type='hover'
              popup={
                <div className='gm-padding-10' style={{ width: '140px' }}>
                  {t('???????????????????????????')}
                </div>
              }
            >
              <span className='gm-text-red gm-margin-left-5'>
                <SVGAnomaly />
              </span>
            </Popover>
          )) ||
            ''}
        </div>
      ),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'order_time',
      accessor: (d) => {
        return moment(new Date(+d.order_time!)).format('YYYY-MM-DD HH:mm')
      },
      minWidth: 150,
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'receive_time',
      accessor: (d) => {
        return moment(new Date(+d.receive_time!)).format('YYYY-MM-DD HH:mm')
      },
      minWidth: 150,
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'outstock_time',
      accessor: (d) => {
        if (!d.outstock_time || d.outstock_time === '0') return '-'

        return moment(new Date(+d.outstock_time!)).format('YYYY-MM-DD HH:mm')
      },
      minWidth: 150,
    },
    {
      Header: t('?????????'),
      diyGroupName: t('????????????'),
      id: 'customer',
      accessor: (d) => {
        return `${d?.customer?.name}(${d.customer?.customized_code})`
      },
      minWidth: 180,
    },
    {
      Header: t('?????????/??????'),
      diyGroupName: t('????????????'),
      minWidth: 150,
      hide: globalStore.isLite,
      accessor: (d) => {
        return `${
          d?.app_type === App_Type.TYPE_ESHOP
            ? d?.menu?.inner_name || '-'
            : d.quotationName || '-'
        }`
      },
      Cell: ({ value }) => {
        return (
          <Popover
            type='hover'
            showArrow
            popup={
              <div className='gm-padding-10' style={{ width: '300px' }}>
                {value || '-'}
              </div>
            }
          >
            <LineText>{value || '-'}</LineText>
          </Popover>
        )
      },
    },
    {
      Header: t('??????'),
      diyGroupName: t('????????????'),
      accessor: (d) => d.menu_period_group?.name || '-',
      minWidth: 100,
      hide: globalStore.isLite,
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      accessor: (d) => d.dining_count || '-',
      minWidth: 100,
      hide: globalStore.isLite,
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      accessor: 'state',
      minWidth: 100,
      Cell: (props) => (
        <OrderState order={props.original} index={props.index} />
      ),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'pay_state',
      minWidth: 80,
      accessor: (d) => map_Order_PayState[d.pay_state!] || t('??????'),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'order_price',
      minWidth: 80,
      accessor: (d) => toFixedOrder(+d.order_price!) + Price.getUnit(),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'order_details',
      minWidth: 80,
      accessor: (d) => toFixedOrder(+d.orderQuantity!),
    },
    {
      Header: t('???????????????'),
      diyGroupName: t('????????????'),
      id: 'order_details1',
      minWidth: 80,
      accessor: (d) => d.catagorySum,
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'freight_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.freight_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'aftersale_price',
      minWidth: 80,
      accessor: (d) => toFixedOrder(+d.aftersale_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'outstock_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.outstock_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'coupon_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.coupon_price! || 0) + Price.getUnit(),
    },
    {
      Header: (
        <HeaderTip
          header={t('????????????')}
          tip={t(
            '????????? = ??????????????????????????? + ????????????' +
              `${globalStore.isLite ? '' : '???????????? + ??????'}`,
          )}
        />
      ),
      diyItemText: '????????????',
      diyGroupName: t('????????????'),
      id: 'sale_price',
      minWidth: 100,
      accessor: (d) => toFixedOrder(+d.sale_price! || 0) + Price.getUnit(),
    },
    {
      Header: (
        <HeaderTip
          header={t('???????????????')}
          tip={t(
            '??????????????? = ??????????????????????????? + ????????????' +
              `${globalStore.isLite ? '' : '????????????'}`,
          )}
        />
      ),
      diyItemText: '???????????????',
      diyGroupName: t('????????????'),
      id: 'detail_sum_sale_price',
      minWidth: 100,
      accessor: (d) =>
        toFixedOrder(+d.detail_sum_sale_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('????????????????????????'),
      diyGroupName: t('????????????'),
      id: 'detail_sum_sale_price_no_tax',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) =>
        toFixedOrder(+d.detail_sum_sale_price_no_tax! || 0) + Price.getUnit(),
    },
    {
      Header: t('??????'),
      diyGroupName: t('????????????'),
      id: 'detail_sum_tax_price',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) =>
        toFixedOrder(+d.detail_sum_tax_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'paid_amount',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.paid_amount! || 0) + Price.getUnit(),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'refund_amount',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.refund_amount! || 0) + Price.getUnit(),
    },
    {
      Header: t('??????????????????'),
      diyGroupName: t('????????????'),
      id: 'actual_amount',
      minWidth: 90,
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.actual_amount! || 0) + Price.getUnit(),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'app_type',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) =>
        appTypeMap[`${d.app_type!}_${d.order_op}`] || map_App_Type[d.app_type!],
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'sorting_remark',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => d.sorting_remark || '-',
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'sorting_num',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => d.sorting_num || '-',
    },
    {
      Header: t('??????'),
      id: 'route',
      diyGroupName: t('????????????'),
      minWidth: 100,
      accessor: (d) => d.route?.name,
    },
    {
      Header: t('??????'),
      diyGroupName: t('????????????'),
      id: 'driver',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => d.driver?.name || '-',
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'remark',
      minWidth: 100,
      hide: globalStore.isLite,
      accessor: (d) => (
        <Popover
          showArrow
          center
          type='hover'
          popup={
            <div className='gm-padding-10' style={{ width: '300px' }}>
              {d.remark || '-'}
            </div>
          }
        >
          <span className='b-ellipsis-order-remark'>{d.remark || '-'}</span>
        </Popover>
      ),
    },
    {
      Header: t('?????????'),
      diyGroupName: t('????????????'),
      id: 'creator_id',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => d.creator?.name || '-',
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'status',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => getReceiptStatusText(d.status!),
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'print_state',
      minWidth: 80,
      hide: globalStore.isLite,
      accessor: (d) => {
        const print = +d.status! & (1 << 9)
        return print ? t('?????????') : t('?????????')
      },
    },
    {
      Header: t('????????????'),
      diyGroupName: t('????????????'),
      id: 'total_add_order_value',
      show: false,
      diyEnable: true,
      minWidth: 80,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ),
      accessor: (d) => toFixedOrder(+d.total_add_order_value?.quantity?.val!),
    },
    {
      Header: t('???????????????'),
      diyGroupName: t('????????????'),
      id: 'total_add_order_price',
      show: false,
      diyEnable: true,
      minWidth: 90,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ),
      accessor: (d) =>
        toFixedOrder(+d.total_add_order_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('??????????????????'),
      diyGroupName: t('????????????'),
      id: 'fake_order_price',
      show: false,
      diyEnable: true,
      minWidth: 90,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ),
      accessor: (d) =>
        toFixedOrder(+d.fake_order_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('??????????????????'),
      diyGroupName: t('????????????'),
      id: 'fake_outstock_price',
      show: false,
      diyEnable: true,
      minWidth: 90,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
        ),
      accessor: (d) =>
        toFixedOrder(+d.fake_outstock_price! || 0) + Price.getUnit(),
    },
    {
      Header: t('??????????????????'),
      diyGroupName: t('????????????'),
      id: 'update_time',
      minWidth: 130,
      hide: globalStore.isLite,
      accessor: (d) =>
        moment(new Date(+d.update_time!)).format('YYYY-MM-DD HH:mm'),
    },
    {
      width: TableXUtil.TABLE_X.WIDTH_OPERATION,
      Header: TableXUtil.OperationHeader,
      diyGroupName: t('????????????'),
      diyEnable: false,
      id: 'action',
      fixed: 'right' as any,
      diyItemText: '??????',
      Cell: (props) => <Operation index={props.index} />,
    },
  ]

  const { list } = store
  return (
    <>
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <Observer>
              {() => (
                <TableTotalText
                  data={
                    _.without(
                      [
                        {
                          label: t('????????????'),
                          content: store.summary.orderCount,
                        },
                        {
                          label: t('????????????'),
                          content: (
                            <Price
                              value={+store.summary.totalOrderPrice}
                              precision={globalStore.dpOrder}
                            />
                          ),
                        },
                        {
                          label: t('????????????'),
                          content: (
                            <Price
                              value={+store.summary.totalOutStockPrice}
                              precision={globalStore.dpOrder}
                            />
                          ),
                          hide: globalStore.isLite,
                        },
                      ],
                      false,
                    ) as TotalTextOptions[]
                  }
                />
              )}
            </Observer>
          </BoxTableInfo>
        }
        action={
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_ORDER_CREATE_ORDER}
            >
              <Button
                type='primary'
                onClick={handleCreateOrder}
                className='gm-margin-right-10'
              >
                {t('????????????')}
              </Button>
            </PermissionJudge>
            {!globalStore.isLite && (
              <>
                <PermissionJudge
                  permission={Permission.PERMISSION_ORDER_CREATE_ORDER_BY_MENU}
                >
                  <Button
                    type='primary'
                    onClick={handleCreateOrderByMenu}
                    className='gm-margin-right-10'
                  >
                    {t('???????????????')}
                  </Button>
                </PermissionJudge>
                <PermissionJudge
                  permission={Permission.PERMISSION_ORDER_AMEND_ORDER}
                >
                  <FunctionSet
                    right
                    data={[
                      {
                        text: t('????????????'),
                        onClick: () =>
                          history.push('/order/order_manage/repair'),
                      },
                      {
                        text: t('????????????'),
                        onClick: () => {
                          Modal.render({
                            size: 'md',
                            title: t('??????????????????'),
                            children: <BatchImport />,
                          })
                        },
                      },
                      {
                        text: t('????????????'),
                        onClick: handlePrint,
                      },
                    ]}
                  />
                </PermissionJudge>
              </>
            )}
          </>
        }
      >
        <Table<OrderInfoViewOrder>
          isDiy
          isBatchSelect
          id='viewOrder'
          data={list}
          keyField='order_id'
          isSelectorDisable={isOrderDisabled}
          fixedSelect
          columns={columns}
          batchActions={
            _.without(
              [
                globalStore.hasPermission(
                  Permission.PERMISSION_ORDER_UPDATE_ORDER,
                ) && {
                  children: (
                    <BatchActionEdit>{t('????????????????????????')}</BatchActionEdit>
                  ),
                  onAction: (selected: string[], isSelectAll: boolean) => {
                    function handleCancel() {
                      Modal.hide()
                    }
                    function handleSave(status: Order_State, remark: string) {
                      BatchUpdateOrderState({
                        filter: {
                          common_list_order: isSelectAll
                            ? store.getParams()
                            : { order_ids: selected },
                          paging: { limit: 100 },
                        },
                        to_set_state: status,
                        sorting_remark: remark,
                        all: isSelectAll,
                      }).then(() => {
                        handleCancel()
                        globalStore.showTaskPanel('1')
                        return null
                      })
                    }

                    Modal.render({
                      children: (
                        <EditState
                          selected={selected}
                          isSelectAll={isSelectAll}
                          onCancel={handleCancel}
                          onOk={handleSave}
                        />
                      ),
                      size: 'md',
                      title: t('??????????????????'),
                      onHide: Modal.hide,
                    })
                  },
                },
                ...(globalStore.isLite
                  ? [
                      globalStore.hasPermission(
                        Permission.PERMISSION_DELIVERY_PRINT_TASK,
                      ) && {
                        children: (
                          <BatchActionDefault>
                            {t('????????????')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectedAll: boolean,
                        ) => {
                          orderTaskStore.handleChangeSelect(
                            'selectedRecord',
                            selected,
                          )
                          orderTaskStore.handleChangeSelect(
                            'isSelectedAll',
                            isSelectedAll,
                          )
                          openModal()
                          orderTaskStore.paramsInit()
                        },
                      },
                    ]
                  : [
                      {
                        children: (
                          <BatchActionDefault>
                            {t('??????????????????')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          setIsSelectAll(isSelectAll)
                          setSelected(selected)
                          handleBatchSyncPrice({ selected, isSelectAll })
                        },
                      },
                      globalStore.hasPermission(
                        Permission.PERMISSION_ORDER_RELEASE_NONPROCESS_PLAN,
                      ) && {
                        children: (
                          <BatchActionDefault>
                            {t('????????????????????????')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          setIsSelectAll(isSelectAll)
                          setSelected(selected)
                          setNotProcessdVisible(true)
                        },
                      },
                      globalStore.hasPermission(
                        Permission.PERMISSION_ORDER_RELEASE_PROCESS_PLAN,
                      ) && {
                        children: (
                          <BatchActionDefault>
                            {t('????????????????????????')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          setIsSelectAll(isSelectAll)
                          setSelected(selected)
                          setProcessdVisible(true)
                        },
                      },
                      {
                        children: (
                          <BatchActionDefault>
                            {t('???????????????????????????')}
                          </BatchActionDefault>
                        ),
                        onAction: (
                          selected: string[],
                          isSelectAll: boolean,
                        ) => {
                          BatchSyncSaleOutStockSheetFromOrder({
                            order_filter: {
                              common_list_order: isSelectAll
                                ? store.getParams()
                                : { order_ids: selected },
                              paging: { limit: 100 },
                            },
                            all_order: isSelectAll,
                          }).then(() => {
                            globalStore.showTaskPanel('1')
                            return null
                          })
                        },
                      },
                    ]),
              ],
              false,
            ) as BatchActionBarItem[]
          }
        />
      </BoxTable>
      <Drawer
        title={
          <DrawerTitle
            title={t('??????????????????')}
            count={selected.length}
            isSelectAll={isSelectAll}
          />
        }
        visible={notProcessdVisible}
        width='800px'
        destroyOnClose
        bodyStyle={bodyStyle}
        onClose={() => setNotProcessdVisible(false)}
      >
        <NotProcessedProductPlan
          onClose={() => setNotProcessdVisible(false)}
          isSelectAll={isSelectAll}
          selected={selected}
          isOrder
        />
      </Drawer>

      <Drawer
        title={
          <DrawerTitle
            title={t('??????????????????')}
            count={selected.length}
            isSelectAll={isSelectAll}
          />
        }
        visible={processdVisible}
        width='800px'
        destroyOnClose
        bodyStyle={bodyStyle}
        onClose={() => setProcessdVisible(false)}
      >
        <ProcessedProductPlan
          onClose={() => setProcessdVisible(false)}
          isSelectAll={isSelectAll}
          selected={selected}
          isOrder
        />
      </Drawer>
    </>
  )
}

export default observer(List)
