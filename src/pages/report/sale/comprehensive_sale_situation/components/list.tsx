import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { TableList, TableListColumn } from '@gm-pc/business'
import { toFixOrderWithPrice } from '@/common/util'

import { BaseTableListType } from '../../interface'

import { SynthesizeSaleDataType } from '../types'
import { getOrderOrReceiveTimeColumn } from '../../../util'
import { COMMON_COLUMNS } from '../../constants'
import store from '../store'
import globalStore from '@/stores/global'

const tableId = 'comprehensive_sale_situation'
export const List: FC<BaseTableListType> = observer(({ ...res }) => {
  const { summary } = store
  const {
    order_price_sum, // 下单金额
    outstock_price_sum, // 出库金额
    aftersale_price_sum, // 售后金额
    sale_price_sum, // 销售金额
    detail_sum_tax_price_sum, // 销售税额
    outstock_cost_price_sum, // 出库成本金额
  } = summary

  const columns = [
    getOrderOrReceiveTimeColumn(store.filter.time_range),
    COMMON_COLUMNS.order_id_count,
    {
      Header: t('退货退款单数'),
      id: 'after_sale_return_refund_count',
      hide: globalStore.isLite,
      accessor: 'after_sale_return_refund_count',
      minWidth: 120,
      headerSort: true,
    },
    {
      Header: t('仅退款单数'),
      id: 'after_sale_refund_count',
      accessor: 'after_sale_refund_count',
      minWidth: 120,
      headerSort: true,
    },
    {
      Header: t('订单均价'),
      id: 'order_average_price',
      accessor: (d) => toFixOrderWithPrice(d.order_average_price),
      minWidth: 120,
      headerSort: true,
    },
    {
      Header: t('客单价'),
      id: 'per_customer_transaction',
      accessor: (d) => toFixOrderWithPrice(d.per_customer_transaction),
      minWidth: 120,
      headerSort: true,
    },
    {
      Header: t('下单商品数'),
      id: 'sku_id_count',
      accessor: 'sku_id_count',
      minWidth: 120,
    },
    COMMON_COLUMNS.receive_customer_count,
    { ...COMMON_COLUMNS.outstock_price_sum, hide: globalStore.isLite },
    COMMON_COLUMNS.order_price_sum,
    COMMON_COLUMNS.aftersale_price_sum,
    COMMON_COLUMNS.sale_price_sum,
    {
      ...COMMON_COLUMNS.detail_sum_tax_price_sum,
      hide: globalStore.isLite,
    },
    COMMON_COLUMNS.outstock_cost_price_sum,
    COMMON_COLUMNS.gross_margin,
    COMMON_COLUMNS.gross_profit_rate,
  ] as TableListColumn<SynthesizeSaleDataType>[]

  return (
    <TableList<SynthesizeSaleDataType>
      {...res}
      isDiy
      isHeaderSort
      isFilterSpread
      id={tableId}
      keyField='id'
      service={store.getList}
      filter={store.filter}
      columns={columns}
      paginationOptions={{
        paginationKey: tableId,
        defaultPaging: { need_count: true },
      }}
      totalTextData={[
        {
          label: t('下单金额'),
          content: toFixOrderWithPrice(order_price_sum),
        },
        {
          label: t('出库金额'),
          content: toFixOrderWithPrice(outstock_price_sum),
        },
        {
          label: t('售后金额'),
          content: toFixOrderWithPrice(aftersale_price_sum),
        },
        {
          label: t('销售金额'),
          content: toFixOrderWithPrice(sale_price_sum),
        },
        (!globalStore.isLite && {
          label: t('销售税额'),
          content: toFixOrderWithPrice(detail_sum_tax_price_sum),
        }) as any,
        {
          label: t('出库成本金额'),
          content: toFixOrderWithPrice(outstock_cost_price_sum),
        },
      ].filter(Boolean)}
    />
  )
})
