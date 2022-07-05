import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import { OrderTypeSummaryItem } from './interface'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'
import { SearchTimeParams } from '../interface'
import useOrderTypeData from './service/use_order_type_data'
import useOrderTypeList, { OrderTypeList } from './service/use_order_type_list'
import _ from 'lodash'
import './index.less'

export interface OrderTypeSummaryProps {
  /** 客户 id */
  customerId?: string
  /** 时间筛选参数 */
  timeFilter?: SearchTimeParams
}

const genOrderTypeColumn = (value?: OrderTypeList[]) => {
  // 下单金额列
  const orderAmountColumn: ColumnsType<OrderTypeSummaryItem> = []
  // 出库金额列
  const outstockAmountColumn: ColumnsType<OrderTypeSummaryItem> = []

  _.forEach(value, (item) => {
    orderAmountColumn.push({
      title: `${item.name}${t('（下单金额）')}`,
      key: `${item.id}-orderAmountColumn`,
      width: 200,
      render(_val, row) {
        const target = row.customizeOrderType[item.id]
        return target?.orderAmount || '-'
      },
    })
    outstockAmountColumn.push({
      title: `${item.name}${t('（出库金额）')}`,
      key: `${item.id}-outstockAmountColumn`,
      width: 200,
      render(_val, row) {
        const target = row.customizeOrderType[item.id]
        return target?.outstockAmount || '-'
      },
    })
  })
  return { orderAmountColumn, outstockAmountColumn }
}

/**
 * 按订单类型汇总 tab 页
 */
const OrderTypeSummary: React.VFC<OrderTypeSummaryProps> = (props) => {
  const { list } = useOrderTypeList()
  const { data } = useOrderTypeData(props)

  const orderTypeColumn = useMemo(() => {
    return genOrderTypeColumn(list)
  }, [list])

  const columns = useMemo<ColumnsType<OrderTypeSummaryItem>>(() => {
    return [
      {
        title: t('下单日期（按天）'),
        dataIndex: 'orderDate',
        fixed: 'left',
        width: 140,
      },
      ...orderTypeColumn.orderAmountColumn,
      {
        title: t('下单总金额'),
        dataIndex: 'totalOrderAmount',
        width: 140,
      },
      ...orderTypeColumn.outstockAmountColumn,
      {
        title: t('出库总金额'),
        dataIndex: 'totalOutstockAmount',
        width: 140,
      },
    ]
  }, [orderTypeColumn])

  return (
    <Table<OrderTypeSummaryItem>
      rowClassName='order_type_table_row'
      size='small'
      rowKey='id'
      dataSource={data}
      columns={columns}
      pagination={false}
      scroll={{ x: 1300 }}
    />
  )
}

export default OrderTypeSummary
