import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { TableList, TableListColumn } from '@gm-pc/business'
import { observer } from 'mobx-react'

import { toFixOrderWithPrice } from '@/common/util'

import { BaseTableListType } from '../../interface'
import { CustomerMerchandiseSaleDataType } from '../types'
import { COMMON_COLUMNS } from '../../constants'
import { getOrderOrReceiveTimeColumn } from '../../../util'
import store from '../store'
import globalStore from '@/stores/global'

const tableId = 'customer_merchandise_sale_situation'
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
    {
      Header: t('客户编码'),
      id: 'receive_customer_code',
      accessor: 'receive_customer_code',
      minWidth: 150,
    },
    {
      Header: t('客户名称'),
      id: 'receive_customer_name',
      accessor: 'receive_customer_name',
      minWidth: 120,
    },
    // {
    //   Header: t('商品编号'),
    //   id: 'ssu_customize_code',
    //   accessor: 'ssu_customize_code',
    //   minWidth: 100,
    // },
    {
      Header: t('商品名称'),
      id: 'sku_name',
      accessor: 'sku_name',
      minWidth: 100,
    },
    COMMON_COLUMNS.category_l1_name,
    COMMON_COLUMNS.category_l2_name,
    // {
    //   Header: t('计量单位'),
    //   id: 'unit_measuring_name',
    //   accessor: 'unit_measuring_name',
    //   minWidth: 100,
    // },
    // {
    //   Header: t('包装单位'),
    //   id: 'unit_name',
    //   hide: globalStore.isLite,
    //   accessor: 'unit_name',
    //   minWidth: 100,
    // },
    {
      Header: t('规格'),
      id: 'specification',
      accessor: 'specification',
      minWidth: 100,
      hide: globalStore.isLite,
    },
    {
      Header: t('单价'),
      id: t('unit_pre_price_avg'),
      accessor: (d) => toFixOrderWithPrice(d.unit_pre_price_avg),
      minWidth: 130,
      headerSort: true,
    },
    COMMON_COLUMNS.unit_quantity_sum,
    COMMON_COLUMNS.unit_name,
    COMMON_COLUMNS.order_price_sum,
    { ...COMMON_COLUMNS.outstock_price_sum, hide: globalStore.isLite },
    COMMON_COLUMNS.aftersale_price_sum,
    COMMON_COLUMNS.sale_price_sum,
    { ...COMMON_COLUMNS.tax_price_sum, hide: globalStore.isLite },
    COMMON_COLUMNS.outstock_cost_price_sum,
    COMMON_COLUMNS.gross_margin,
    COMMON_COLUMNS.gross_profit_rate,
  ] as TableListColumn<CustomerMerchandiseSaleDataType>[]
  return (
    <TableList<CustomerMerchandiseSaleDataType>
      {...props}
      isDiy
      isHeaderSort
      isFilterSpread
      filter={store.filter}
      service={store.getList}
      id={tableId}
      keyField='id'
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
