import {
  Button,
  Card,
  PaginationProps,
  Space,
  Table,
  TableColumnType,
} from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import React, { useState } from 'react'
import { DataType } from '../interface'
import store from '../store'
import BatchActionBar from './batch_action_bar'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import { formatParamsForPagination } from '@/common/util'
import { observer } from 'mobx-react'
import { gmHistory as history } from '@gm-common/router'

import '../style.less'
import {
  AllSelect_Types,
  businessTypeMap,
  dataSource,
  Is_Batch,
} from '@/pages/financial_manage/settlement_manage/customer_settlement/constant'
import {
  BillOrderInfo,
  BillOrder_PayAndAfterState,
  BillOrder_Type,
  map_BillOrder_PayAndAfterState,
} from 'gm_api/src/finance'
import moment from 'moment'
import { map_PayOrder_PayState } from 'gm_api/src/paysys'
import { orderPayState, orderPayStateMap } from '@/pages/order/enum'
import { TableRowSelection } from 'antd/lib/table/interface'
import { toJS } from 'mobx'

export default observer(() => {
  /** 选中的公司 */
  const [selectedCompany, setSelectedCompany] = useState<string>('')

  const rowSelection: TableRowSelection<BillOrderInfo> = {
    hideSelectAll: true,
    onSelect: (
      record: BillOrderInfo,
      selected,
      selectedRows: BillOrderInfo[],
    ) => {
      // 这里控制父级多选子级
      if (
        record.type === BillOrder_Type.TYPE_SALE_ORDER &&
        record.relation_bill_orders?.length! > 0
      ) {
        if (selected) {
          selectedRows.push(
            ...(_.find(
              store.dataSource,
              (s) => s.bill_order_id === record.bill_order_id,
            )!.relation_bill_orders as BillOrderInfo[]),
          )
        } else {
          selectedRows = _.filter(
            selectedRows,
            (s) =>
              !_.map(
                record.relation_bill_orders,
                (child) => child.bill_order_id,
              ).includes(s.bill_order_id),
          )
        }
      }
      selectedRows = _.uniqBy(selectedRows, (item) => item.bill_order_id)
      setSelectedCompany(selectedRows[0]?.company_id! || '')
      store.updateSelectedRowKeys(
        _.map(selectedRows, (s) => s.bill_order_id || ''),
      )
      store.updateSelected(selectedRows)
    },
    checkStrictly: true,
    selectedRowKeys: store.selectedRowKeys,
    /** 跨页用 */
    getCheckboxProps(row) {
      const { pay_after_state, company_id } = row
      return {
        // 一些选择限制
        disabled:
          [
            BillOrder_PayAndAfterState.PAYSTATE_PAID,
            BillOrder_PayAndAfterState.PAYSTATE_REFUND,
            BillOrder_PayAndAfterState.STATUS_REFUNDED,
          ].includes(pay_after_state || -1) ||
          (selectedCompany ? company_id !== selectedCompany : false),
      }
    },
  }

  /**
   * 页码器相关
   */
  const pagination: PaginationProps = {
    current: store.paging.current,
    pageSize: store.paging.pageSize,
    total: store.count,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    onChange: (page, pageSize) => {
      store.setPaging({ current: page, pageSize })
      store.updateSelectedRowKeys([])
      store.updateSelected([])
      setSelectedCompany('')

      const isResetCurrent = pageSize !== store.paging.pageSize

      const pageInfo = formatParamsForPagination(page, pageSize)
      store.setPagination({
        ...pageInfo,
        offset: isResetCurrent ? 0 : pageInfo.offset,
      })
      store.fetchList(isResetCurrent)
    },
    showTotal: (total) => `共${total}条记录`,
  }

  /** 切换全选所有/选择当前页面 */
  const handleToggleSelectAll = (allSelectType?: AllSelect_Types) => {
    store.setAllSelectType(allSelectType!)

    switch (allSelectType) {
      // 全选同公司
      case AllSelect_Types.ALL_COMPANY: {
        let needSelecting: BillOrderInfo[] = []
        store.dataSource.forEach((item) => {
          if (item.company_id === selectedCompany) {
            needSelecting.push(item)
            if (item.relation_bill_orders?.length! > 0) {
              needSelecting.push(...item.relation_bill_orders!)
            }
          }
        })
        needSelecting = needSelecting.filter(
          ({ pay_after_state }) =>
            ![
              BillOrder_PayAndAfterState.PAYSTATE_PAID,
              BillOrder_PayAndAfterState.PAYSTATE_REFUND,
              BillOrder_PayAndAfterState.STATUS_REFUNDED,
            ].includes(pay_after_state || -1),
        )
        store.updateSelected(needSelecting)
        store.updateSelectedRowKeys(
          needSelecting.map((item) => item.bill_order_id!),
        )
        break
      }
      // 全选同客户
      case AllSelect_Types.ALL_CUSTOMER: {
        const selectedCustomers = [
          ...new Set(store.selected.map((item) => item.customer_id)),
        ]
        let needSelecting: BillOrderInfo[] = []
        store.dataSource.forEach((item) => {
          if (selectedCustomers.includes(item.customer_id)) {
            needSelecting.push(item)
            if (item.relation_bill_orders?.length! > 0) {
              needSelecting.push(...item.relation_bill_orders!)
            }
          }
        })
        needSelecting = needSelecting.filter(
          ({ pay_after_state }) =>
            ![
              BillOrder_PayAndAfterState.PAYSTATE_PAID,
              BillOrder_PayAndAfterState.PAYSTATE_REFUND,
              BillOrder_PayAndAfterState.STATUS_REFUNDED,
            ].includes(pay_after_state || -1),
        )
        store.updateSelected(needSelecting)
        store.updateSelectedRowKeys(
          needSelecting.map((item) => item.bill_order_id!),
        )
        break
      }
      default:
        break
    }
  }

  /** BatchActionBar 取消操作 */
  const handleClose = () => {
    setSelectedCompany('')
    store.setAllSelectType(undefined)
    store.updateSelected([])
    // setIsAll(false)
    store.updateSelectedRowKeys([])
  }

  const startSettle = (isBatch: Is_Batch, bill_order_id?: string[]) => {
    history.push(
      `/financial_manage/settlement_manage/customer_settlement/settlement_details?bill_order_id=${bill_order_id}&isBatch=${isBatch}`,
    )
  }

  const columns: TableColumnType<BillOrderInfo>[] = [
    {
      title: t('订单号'),
      width: 200,
      dataIndex: 'order_no',
      key: 'order_no',
      className: 'gm-order-unit-columns',
      render: (value, record) =>
        record.type === BillOrder_Type.TYPE_AFTER_ORDER
          ? record.after_sale_no
          : record.order_no,
    },
    {
      title: t('客户名'),
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: t('公司名称'),
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: t('下单时间'),
      dataIndex: 'order_time',
      key: 'order_time',
      render: (value, record) =>
        moment(
          +(
            record.type === BillOrder_Type.TYPE_AFTER_ORDER
              ? record.after_sale_create_time
              : record.order_time
          )!,
        ).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('业务类型'),
      dataIndex: 'type',
      key: 'type',
      render: (value) => businessTypeMap[value],
    },
    {
      title: t('支付状态/售后状态'),
      dataIndex: 'pay_after_state',
      key: 'pay_after_state',
      render: (value) => map_BillOrder_PayAndAfterState[value],
    },
    {
      title: t('应付金额（元）'),
      dataIndex: 'outstock_price',
      key: 'outstock_price',
    },
    {
      title: t('已付金额（元）'),
      dataIndex: 'paid_amount',
      key: 'paid_amount',
    },
    {
      title: t('未付金额（元）'),
      dataIndex: 'non_pay_amount',
      key: 'non_pay_amount',
    },
    {
      title: t('售后金额（元）'),
      dataIndex: 'order_after_sale_price',
      key: 'order_after_sale_price',
    },
    {
      title: t('操作'),
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => {
        return (
          ![
            BillOrder_PayAndAfterState.PAYSTATE_PAID,
            BillOrder_PayAndAfterState.PAYSTATE_REFUND,
            BillOrder_PayAndAfterState.STATUS_REFUNDED,
          ].includes(record.pay_after_state || -1) && (
            <a
              onClick={startSettle.bind(null, Is_Batch.UnBatch, [
                record.bill_order_id!,
              ])}
            >
              {t('结款')}
            </a>
          )
        )
      },
    },
  ]

  return (
    <div className='ant-card-self'>
      <Card bordered>
        <BatchActionBar
          onClose={handleClose}
          selected={store.selected}
          //   isSelectAll={isAll}
          allSelectType={store.allSelectType}
          changeAllSelectType={handleToggleSelectAll}
          ButtonNode={
            <Space size='middle'>
              <Button
                className=''
                disabled={store.selectedRowKeys.length === 0}
                onClick={startSettle.bind(
                  null,
                  Is_Batch.Batch,
                  store.selected.map((item) => item.bill_order_id!),
                )}
              >
                {t('批量结款')}
              </Button>
            </Space>
          }
        />
        <Table<BillOrderInfo>
          id='customer_settlement'
          className='gm-padding-top-20'
          size='small'
          rowKey='bill_order_id'
          columns={columns}
          dataSource={store.dataSource}
          pagination={pagination}
          expandable={{
            childrenColumnName: 'relation_bill_orders',
            defaultExpandAllRows: true,
          }}
          rowSelection={rowSelection}
        />
      </Card>
    </div>
  )
})
