import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { TableList, TableListColumn } from '@gm-pc/business'
import { observer } from 'mobx-react'

import { toFixOrderWithPrice, toFixedOrder } from '@/common/util'

import { BaseTableListType } from '../../interface'
import { MerchandiseSaleDataType } from '../types'
import store from '../store'
import { COMMON_COLUMNS } from '../.././constants'
import { getOrderOrReceiveTimeColumn } from '../../../util'
import globalStore from '@/stores/global'

const categoryColumnConfig = {
  diyEnable: true,
  label: undefined,
}
export const List: FC<BaseTableListType> = observer(({ ...res }) => {
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
    { ...COMMON_COLUMNS.category_l1_name, ...categoryColumnConfig },
    { ...COMMON_COLUMNS.category_l2_name, ...categoryColumnConfig },
    {
      Header: t('规格'),
      id: 'specification',
      accessor: 'specification',
      minWidth: 100,
      hide: globalStore.isLite,
    },
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
    COMMON_COLUMNS.unit_quantity_sum, // 下单数
    COMMON_COLUMNS.unit_name, // 下单单位
    {
      Header: t('单价'),
      id: 'unit_pre_price_avg',
      hide: globalStore.isLite,
      accessor: (d) => toFixOrderWithPrice(d.unit_pre_price_avg),
      minWidth: 130,
      headerSort: true,
    },
    // {
    //   Header: t(globalStore.isLite ? '下单数' : '下单数(计量单位)'),
    //   id: 'unit_measuring_quantity_sum',
    //   accessor: (d) => toFixedOrder(+d.unit_measuring_quantity_sum),
    //   minWidth: 150,
    //   headerSort: true,
    // },
    // {
    //   Header: t(globalStore.isLite ? '单价' : '单价(计量单位)'),
    //   id: 'unit_measuring_pre_price_avg',
    //   accessor: (d) => toFixOrderWithPrice(d.unit_measuring_pre_price_avg),
    //   width: 130,
    //   headerSort: true,
    // },
    COMMON_COLUMNS.order_price_sum,
    {
      Header: t('出库数(计量单位)'),
      id: 'unit_measuring_outstock_quantity_sum',
      hide: globalStore.isLite,
      accessor: (d) => toFixedOrder(+d.unit_measuring_outstock_quantity_sum),
      minWidth: 150,
      headerSort: true,
    },
    { ...COMMON_COLUMNS.outstock_price_sum, hide: globalStore.isLite },
    COMMON_COLUMNS.aftersale_price_sum,
    COMMON_COLUMNS.sale_price_sum,
    { ...COMMON_COLUMNS.tax_price_sum, hide: globalStore.isLite },
    {
      Header: t('出库成本均价'),
      id: 'outstock_per_cost_price_avg',
      minWidth: 120,
      accessor: (d) => toFixOrderWithPrice(d.outstock_per_cost_price_avg),
      headerSort: true,
    },
    COMMON_COLUMNS.outstock_cost_price_sum,
    COMMON_COLUMNS.gross_margin,
    COMMON_COLUMNS.gross_profit_rate,
  ] as TableListColumn<MerchandiseSaleDataType>[]

  return (
    <TableList<MerchandiseSaleDataType>
      {...res}
      filter={store.filter}
      service={store.getList}
      isDiy
      isHeaderSort
      isFilterSpread
      id='merchandise_sales_ituation'
      keyField='id'
      formatData={(data) => data.data}
      columns={columns}
      paginationOptions={{
        paginationKey: 'merchandise_sales_ituation',
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
