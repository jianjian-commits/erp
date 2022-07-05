import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { TableList, TableListColumn } from '@gm-pc/business'
import { observer } from 'mobx-react'

import { toFixOrderWithPrice } from '@/common/util'

import { BaseTableListType } from '../../interface'
import { CustomerSaleDataType } from '../types'
import store from '../store'
import { getOrderOrReceiveTimeColumn } from '../../../util'
import { COMMON_COLUMNS } from '../../constants'
import globalStore from '@/stores/global'

const tableId = 'customer_sale_situation'

export const List: FC<BaseTableListType> = observer((props) => {
  const {
    order_price_sum, // 下单金额
    outstock_price_sum, // 出库金额
    aftersale_price_sum, // 售后金额
    sale_price_sum, // 销售金额
    tax_price_sum, // 销售税额
    outstock_cost_price_sum, // 出库成本金额
  } = store.summary

  const columns = [
    getOrderOrReceiveTimeColumn(store.filter.time_range),
    COMMON_COLUMNS.receive_customer_code,
    COMMON_COLUMNS.receive_customer_name,
    {
      Header: t('销售经理'),
      id: 'sales_group_user_name',
      hide: globalStore.isLite,
      accessor: 'sales_group_user_name',
      minWidth: 100,
    },
    {
      Header: t('客户标签'),
      id: 'receive_customer_lable',
      accessor: 'receive_customer_lable',
      minWidth: 120,
      hide: globalStore.isLite,
    },
    COMMON_COLUMNS.order_id_count,
    COMMON_COLUMNS.sku_count,
    COMMON_COLUMNS.order_price_sum,
    { ...COMMON_COLUMNS.outstock_price_sum, hide: globalStore.isLite },
    COMMON_COLUMNS.aftersale_price_sum,
    COMMON_COLUMNS.sale_price_sum,
    { ...COMMON_COLUMNS.tax_price_sum, hide: globalStore.isLite },
    COMMON_COLUMNS.outstock_cost_price_sum,
    COMMON_COLUMNS.gross_margin,
    COMMON_COLUMNS.gross_profit_rate,
  ] as TableListColumn<CustomerSaleDataType>[]
  return (
    <TableList<CustomerSaleDataType>
      {...props}
      isDiy
      isHeaderSort
      isFilterSpread
      filter={store.filter}
      service={store.getList}
      id={tableId}
      paginationOptions={{
        paginationKey: tableId,
        defaultPaging: { need_count: true },
      }}
      keyField='id'
      columns={columns}
      totalTextData={[
        {
          label: t('下单金额'),
          content: toFixOrderWithPrice(order_price_sum),
        },
        {
          label: t('出库金额'),
          content: toFixOrderWithPrice(outstock_price_sum),
          hide: globalStore.isLite,
        },
        {
          label: t('售后金额'),
          content: toFixOrderWithPrice(aftersale_price_sum),
        },
        {
          label: t('销售金额'),
          content: toFixOrderWithPrice(sale_price_sum),
          hide: globalStore.isLite,
        },
        {
          label: t('销售税额'),
          content: toFixOrderWithPrice(tax_price_sum),
        },
        {
          label: t('出库成本金额'),
          content: toFixOrderWithPrice(outstock_cost_price_sum),
        },
      ]}
    />
  )
})
