import React from 'react'
import { t } from 'gm-i18n'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  Price,
  Popover,
  BoxTableProps,
} from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { gmHistory as history } from '@gm-common/router'
import { observer, Observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import Operation from './operation'
import PrintState from './print_state'
import store from '../store'

import { SkuDetail } from '../../../../interface'

import { toFixedOrder } from '@/common/util'
import PermissionJudge from '@/common/components/permission_judge'
import HeaderTip from '@/common/components/header_tip'
import EditOrder from './edit_order'
import { Permission } from 'gm_api/src/enterprise'
import {
  getFeeUnitName,
  getOrderDetailUrl,
  getOrderUnitName,
} from '../../../../util'
import SVGAnomaly from '@/svg/triangle-warning.svg'

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  function handleCreateOrder() {
    history.push('/order/order_manage/create')
  }

  function handleCreateOrderByMenu() {
    history.push('/order/order_manage/menu_create')
  }

  const { list, getTotalAddOrderValue } = store

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <Observer>
            {() => {
              return (
                <TableTotalText
                  data={[
                    {
                      label: t('商品总数'),
                      content: store.paging.count,
                    },
                  ]}
                />
              )
            }}
          </Observer>
        </BoxTableInfo>
      }
      action={
        <>
          <PermissionJudge
            permission={Permission.PERMISSION_ORDER_CREATE_ORDER}
          >
            <>
              <Button
                type='primary'
                onClick={handleCreateOrder}
                className='gm-margin-right-10'
              >
                {t('新建订单')}
              </Button>
            </>
          </PermissionJudge>
          <PermissionJudge
            permission={Permission.PERMISSION_ORDER_CREATE_ORDER_BY_MENU}
          >
            <>
              <Button
                type='primary'
                onClick={handleCreateOrderByMenu}
                className='gm-margin-right-10'
              >
                {t('按菜谱下单')}
              </Button>
            </>
          </PermissionJudge>
        </>
      }
    >
      <Table<SkuDetail>
        id='viewSkus'
        data={list.slice()}
        keyField='order_detail_id'
        columns={[
          {
            Header: t('商品名'),
            id: 'sku',
            minWidth: 150,
            accessor: (d) => (
              <div className='gm-inline'>
                {d?.sku_name}
                {(+d?.status! & (1 << 12) && (
                  <Popover
                    showArrow
                    center
                    type='hover'
                    popup={
                      <div className='gm-padding-10' style={{ width: '140px' }}>
                        {t('该商品存在售后异常')}
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
            Header: t('商户名'),
            id: 'customer',
            accessor: (d) => {
              return `${d?.customer?.name}(${d.customer?.customized_code})`
            },
            minWidth: 180,
          },
          {
            Header: t('订单号'),
            id: 'order.serial_no',
            minWidth: 120,
            accessor: (d) => (
              <a
                href={getOrderDetailUrl(d.order!)}
                className='gm-text-primary'
                style={{ textDecoration: 'underline' }}
                rel='noopener noreferrer'
                target='_blank'
              >
                {d.order?.serial_no}
              </a>
            ),
          },
          {
            Header: t('下单单位'),
            id: 'unit_id',
            minWidth: 120,
            diyEnable: false,
            accessor: (d) => {
              // 如果下单单位是自定义单位，还要找一下对应的换算单位来展示
              const { parentUnit, unit } = d
              return getOrderUnitName(parentUnit, unit!)
            },
          },
          {
            Header: t('单价'),
            id: 'order_unit_value_v2.price.val',
            minWidth: 120,
            accessor: (d) => {
              const { order_unit_value_v2, sku_unit_is_current_price } = d
              if (sku_unit_is_current_price) return <span>时价</span>
              const price = order_unit_value_v2?.price!.val
              return `${toFixedOrder(
                price || 0,
              )}${Price.getUnit()}/${getFeeUnitName(d as any)}`
            },
          },
          {
            Header: t('下单数'),
            id: 'order_unit_value_v2.quantity.val',
            minWidth: 120,
            accessor: (d) => {
              const orderValue = d?.order_unit_value_v2?.quantity?.val
              if (!orderValue) {
                return '-'
              }
              return `${orderValue || 0}${getOrderUnitName(
                d.parentUnit,
                d.unit!,
              )}`
            },
          },
          {
            Header: t('出库数'),
            id: 'outstock_unit_value_v2.quantity.val',
            minWidth: 120,
            accessor: (d) =>
              d.outstock_unit_value_v2?.quantity?.val +
              getOrderUnitName(d.parentUnit, d.unit!),
          },
          {
            Header: t('下单金额'),
            id: 'unitPrice',
            minWidth: 80,
            accessor: (d) =>
              toFixedOrder(+d.order_price! || 0) + Price.getUnit(),
          },
          {
            Header: t('出库金额'),
            id: 'outstock_price',
            minWidth: 120,
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {toFixedOrder(+original.outstock_price! || 0) +
                      Price.getUnit()}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            Header: t('加单数1'),
            id: 'add_order_value1',
            minWidth: 120,
            Cell: ({ index }) => (
              <EditOrder orderKey='add_order_value1' index={index} />
            ),
          },
          {
            Header: t('加单数2'),
            id: 'add_order_value2',
            minWidth: 120,
            Cell: ({ index }) => (
              <EditOrder orderKey='add_order_value2' index={index} />
            ),
          },
          {
            Header: t('加单数3'),
            id: 'add_order_value3',
            minWidth: 120,
            Cell: ({ index }) => (
              <EditOrder orderKey='add_order_value3' index={index} />
            ),
          },
          {
            Header: t('加单数4'),
            id: 'add_order_value4',
            minWidth: 120,
            Cell: ({ index }) => (
              <EditOrder orderKey='add_order_value4' index={index} />
            ),
          },
          {
            Header: t('总加单数'),
            id: 'total_add_order_value.quantity.val',
            minWidth: 80,
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {original?.total_add_order_value?.quantity?.val ||
                      getTotalAddOrderValue(original).addOrderValueTotal}
                    {getOrderUnitName(original.parentUnit, original.unit!)}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            Header: t('加单金额1'),
            id: 'add_order_price1',
            minWidth: 80,
            // 加单数 * 单价
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {toFixedOrder(original?.add_order_price1 || 0) +
                      Price.getUnit()}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            Header: t('加单金额2'),
            id: 'add_order_price2',
            minWidth: 80,
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {toFixedOrder(original?.add_order_price2 || 0) +
                      Price.getUnit()}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            Header: t('加单金额3'),
            id: 'add_order_price3',
            minWidth: 80,
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {toFixedOrder(original?.add_order_price3 || 0) +
                      Price.getUnit()}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            Header: t('加单金额4'),
            id: 'add4',
            minWidth: 80,
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {toFixedOrder(original?.add_order_price4 || 0) +
                      Price.getUnit()}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            Header: (
              <HeaderTip
                header={t('总加单金额')}
                tip={t(
                  '总加单金额 = 加单金额1 + 加单金额2 + 加单金额3 + 加单金额4',
                )}
              />
            ),
            id: 'total_add_order_price',
            minWidth: 150,
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {toFixedOrder(original?.total_add_order_price || 0) +
                      Price.getUnit()}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            Header: t('是否打印'),
            id: 'status_is_print',
            minWidth: 100,
            Cell: (props) => {
              return <PrintState index={props.index} />
            },
          },
          {
            Header: (
              <HeaderTip
                header={t('套账下单金额')}
                tip={t('套账下单金额 = 下单金额 + 总加单金额')}
              />
            ),
            id: 'fake_order_price',
            minWidth: 150,
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {toFixedOrder(original?.fake_order_price || 0) +
                      Price.getUnit()}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            Header: (
              <HeaderTip
                header={t('套账出库金额')}
                tip={t('套账下单金额 = 出库金额 + 总加单金额')}
              />
            ),
            id: 'fake_outstock_price',
            minWidth: 150,
            Cell: ({ original }) => (
              <Observer>
                {() => (
                  <div>
                    {toFixedOrder(original?.fake_outstock_price || 0) +
                      Price.getUnit()}
                  </div>
                )}
              </Observer>
            ),
          },
          {
            width: TableXUtil.TABLE_X.WIDTH_OPERATION,
            Header: TableXUtil.OperationHeader,
            diyEnable: false,
            id: 'action',
            fixed: 'right',
            diyItemText: '操作',
            Cell: (props) => <Operation index={props.index} />,
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(List)
