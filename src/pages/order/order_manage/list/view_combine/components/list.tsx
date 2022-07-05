import React from 'react'
import { t } from 'gm-i18n'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  Price,
  Confirm,
  Popover,
  BoxTableProps,
} from '@gm-pc/react'
import { Table, TableXUtil, BatchActionDefault } from '@gm-pc/table-x'
import { gmHistory as history } from '@gm-common/router'
import { observer, Observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import Operation from './operation'
import store from '../store'

import { SkuDetail } from '../../../../interface'

import { toFixedOrder } from '@/common/util'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { BatchSyncCombineSsuToOrder } from 'gm_api/src/orderlogic'
import {
  getFeeUnitName,
  getOrderDetailUrl,
  getOrderUnitName,
} from '../../../../util'
import SVGAnomaly from '@/svg/triangle-warning.svg'
import globalStore from '@/stores/global'
import LineText from '@/pages/order/components/line_text'

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  function handleCreateOrder() {
    window.open('#/order/order_manage/create')
  }

  function handleCreateOrderByMenu() {
    history.push('/order/order_manage/menu_create')
  }

  const { list } = store
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
        isBatchSelect
        isDiy
        id='viewSkus'
        data={list.slice()}
        keyField='order_detail_id'
        fixedSelect
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
            Header: t('报价单/菜谱'),
            accessor: 'quotationName',
            minWidth: 150,
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
            Header: t('餐次'),
            accessor: (d) => d.menu_period_group?.name || '-',
            minWidth: 100,
          },
          {
            Header: t('订单号'),
            id: 'order.serial_no',
            minWidth: 120,
            accessor: (d) => {
              return (
                <a
                  href={getOrderDetailUrl(d.order!)}
                  className='gm-text-primary'
                  style={{ textDecoration: 'underline' }}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {d.order?.serial_no}
                </a>
              )
            },
          },
          {
            Header: t('下单单位'),
            id: 'unit_id',
            minWidth: 120,
            // hide: !globalStore.isLite,
            diyEnable: false,
            accessor: (d) => {
              // 如果下单单位是自定义单位，还要找一下对应的换算单位来展示
              const { parentUnit, unit } = d
              return getOrderUnitName(parentUnit, unit!)
            },
          },
          {
            Header: t('下单数'),
            id: 'order_unit_value_v2.quantity.val',
            minWidth: 120,
            accessor: (d) => {
              const { order_unit_value_v2 } = d
              return toFixedOrder(+order_unit_value_v2?.quantity?.val! || 0)
            },
          },
          {
            Header: t('单价'),
            id: 'order_unit_value_v2.price.val',
            minWidth: 120,
            accessor: (d) => {
              const { order_unit_value_v2 } = d
              return (
                toFixedOrder(+order_unit_value_v2?.price?.val! || 0) +
                Price.getUnit() +
                '/' +
                getFeeUnitName(d as any)
              )
            },
          },
          {
            Header: t('下单金额'),
            id: 'order_price',
            minWidth: 80,
            accessor: (d) => toFixedOrder(+d.order_price!) + Price.getUnit(),
          },
          {
            Header: t('线路'),
            id: 'route',
            diyGroupName: t('线路信息'),
            minWidth: 100,
            accessor: (d) => d.route?.name,
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
        batchActions={[
          {
            children: (
              <BatchActionDefault>{t('批量替换组合商品')}</BatchActionDefault>
            ),
            onAction: (selected: string[], isSelectedAll: boolean) => {
              history.push(
                `/order/order_manage/list/replace_sku?type=combine&all=${!!isSelectedAll}&filter=${JSON.stringify(
                  {
                    ...store.getParams(),
                    detail_ids: !isSelectedAll ? selected : undefined,
                  },
                )}`,
              )
            },
          },
          {
            children: (
              <BatchActionDefault>
                {t('批量同步组合商品信息')}
              </BatchActionDefault>
            ),
            onAction: (selected: string[], isSelectedAll: boolean) => {
              Confirm({
                children: (
                  <div className='gm-padding-lr-15'>
                    <div className='gm-margin-bottom-5'>
                      {t('确定要同步订单商品价格吗？')}
                    </div>
                    <p>{t('注意：')}</p>
                    <div>
                      <p>{t('1. 订单组合商品将同步最新的配比信息；')}</p>
                      <p>
                        {t(
                          '2. 订单组合商品价格会将与组合商品所属报价单的最新定价进行更新；',
                        )}
                      </p>
                      <p>
                        {t(
                          '3. 已经加入对账单、存在售后的订单不能进行价格同步操作；',
                        )}
                      </p>
                      <p>
                        {t(
                          '4. 如组合商品从所属报价单中删除，或所属报价单被删除，不产生更新效果。',
                        )}
                      </p>
                    </div>
                  </div>
                ),
                size: 'md',
                title: t('批量更新组合商品信息'),
              })
                .then(() => {
                  BatchSyncCombineSsuToOrder({
                    order_filter: {
                      ...store.getParams(),
                      paging: { limit: 100 },
                      detail_ids: !isSelectedAll ? selected : undefined,
                    },
                    all: !!isSelectedAll,
                    filter_type: 1,
                  })
                  return null
                })
                .then(() => {
                  globalStore.showTaskPanel('1')
                  return null
                })
            },
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(List)
