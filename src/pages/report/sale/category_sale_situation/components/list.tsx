import React, { FC, useCallback } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { TableList, TableListColumn } from '@gm-pc/business'

import { toFixOrderWithPrice } from '@/common/util'

import { BaseTableListType } from '../../interface'
import { CategorySaleDataType } from '../types'
import { COMMON_COLUMNS } from '../../constants'
import store, { CategoryReportTab } from '../store'
import globalStore from '@/stores/global'

const tableId = 'category_sale_situation'

export const List: FC<BaseTableListType & { category: CategoryReportTab }> =
  observer(({ category, ...res }) => {
    const {
      order_price_sum, // 下单金额
      outstock_price_sum, // 出库金额
      aftersale_price_sum, // 售后金额
      sale_price_sum, // 销售金额
      tax_price_sum, // 销售税额
      outstock_cost_price_sum, // 出库成本金额
    } = store.summary[category]
    const { isActiveCategory1 } = store.getActiveTab()
    const columns = [
      isActiveCategory1
        ? COMMON_COLUMNS.category_l1_name
        : COMMON_COLUMNS.category_l2_name,
      COMMON_COLUMNS.sku_count,
      {
        Header: t('订单数'),
        id: 'order_count',
        accessor: 'order_count',
        minWidth: 100,
        headerSort: true,
      },
      COMMON_COLUMNS.receive_customer_count,
      COMMON_COLUMNS.order_price_sum,
      { ...COMMON_COLUMNS.outstock_price_sum, hide: globalStore.isLite },
      COMMON_COLUMNS.aftersale_price_sum,
      COMMON_COLUMNS.sale_price_sum,
      { ...COMMON_COLUMNS.tax_price_sum, hide: globalStore.isLite },
      COMMON_COLUMNS.outstock_cost_price_sum,
      COMMON_COLUMNS.gross_margin,
      COMMON_COLUMNS.gross_profit_rate,
    ] as TableListColumn<CategorySaleDataType>[]
    const service = useCallback(
      (params) => store.getList(category, params),
      [category],
    )
    return (
      <TableList<CategorySaleDataType>
        {...res}
        isDiy
        isUpdateEffect
        isHeaderSort
        isFilterSpread
        filter={store.filter[category]}
        service={service}
        id={`${tableId}${category}`}
        keyField='id'
        paginationOptions={{
          paginationKey: `${tableId}${category}`,
          defaultPaging: { need_count: true },
        }}
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
            hide: globalStore.isLite,
          },
          {
            label: t('销售金额'),
            content: toFixOrderWithPrice(sale_price_sum),
          },
          {
            label: t('销售税额'),
            content: toFixOrderWithPrice(tax_price_sum),
            hide: globalStore.isLite,
          },
          {
            label: t('出库成本金额'),
            content: toFixOrderWithPrice(outstock_cost_price_sum),
          },
        ]}
      />
    )
  })
