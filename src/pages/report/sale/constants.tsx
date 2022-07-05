import React from 'react'
import moment from 'moment'
import { t } from 'gm-i18n'
import { TimeType } from 'gm_api/src/aftersale'

import DateRangeFilter from '@/common/components/date_range_filter'
import { dateFilterData, Placeholders } from '@/common/enum'
import { CategoryFilter, FormConfig } from '@/common/components'
import { TableListColumn } from '@gm-pc/business'
import { toFixedOrder, toFixOrderWithPrice } from '@/common/util'
import { formatGrossProfitRate } from '../util'

const TEMP_FORMS_CONFIGS = {
  time_range: {
    name: 'time_range',
    component: (
      <DateRangeFilter data={[...dateFilterData.slice(1)]} enabledTimeSelect />
    ),
  },
  category: {
    label: '商品分类',
    name: 'category',
    valuePropName: 'selected',
    component: <CategoryFilter multiple style={{ width: 275 }} />,
  },
  sku_name: {
    label: '商品',
    name: 'sku_name',
    type: 'Input',
    componentProps: {
      placeholder: Placeholders.MERCHANDISE_NAME,
    },
  },
  customer_name: {
    label: '客户',
    name: 'customer_name',
    type: 'Input',
    componentProps: {
      placeholder: Placeholders.CUSTOMER_NAME,
    },
  },
}
export const FORMS_CONFIGS = TEMP_FORMS_CONFIGS as {
  [key in keyof typeof TEMP_FORMS_CONFIGS]: FormConfig
}
export const INITIALVALUES = {
  time_range: {
    begin: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate(),
    dateType: TimeType.TIME_TYPE_PLACE_ORDER,
  },
  category: {
    // category1_ids: [],
    // category2_ids: [],
    category_ids: []
  },
}

export const BASE_SUMMARY = {
  /* 商品种类数 */
  sku_count: '-',
  order_id_count: '-', // 订单数
  order_price_sum: '-', // 下单金额
  outstock_price_sum: '-', // 出库金额
  aftersale_price_sum: '-', // 售后金额
  sale_price_sum: '-', // 销售金额
  outstock_cost_price_sum: '-', // 出库成本金额
  gross_margin: '-', // 毛利
  gross_profit_rate: '-', // 毛利率
  detail_sum_tax_price_sum: '-', // 销售税额 只针对综合销售报表
  tax_price_sum: '-', // 销售税额
  unit_quantity_sum: '-', // 下单数
  unit_name: '-', // 下单单位名称
  unit_pre_price_avg: '-', // 单价
  order_time: '-',
  receive_tme: '-',
  category_l1_name: '-',
  category_l2_name: '-',
  ssu_name: '-',
  ssu_customize_code: '-',
  receive_customer_name: '-',
  receive_customer_code: '-',
  receive_time: '-',
  order_detail_count_sum: '-',
  receive_customer_count: '-',
}

type BASE_SUMMARY_TYPE = typeof BASE_SUMMARY
type COMMON_COLUMNS_TYPE = {
  [key in keyof BASE_SUMMARY_TYPE]?: TableListColumn<BASE_SUMMARY_TYPE>
}
export const COMMON_COLUMNS: COMMON_COLUMNS_TYPE = {
  gross_margin: {
    Header: t('毛利'),
    id: 'gross_margin',
    accessor: (d) => toFixOrderWithPrice(parseFloat(d.gross_margin)),
    minWidth: 130,
    headerSort: true,
  },
  gross_profit_rate: {
    Header: t('毛利率'),
    id: 'gross_profit_rate',
    accessor: (d) => formatGrossProfitRate(parseFloat(d.gross_profit_rate)),
    minWidth: 130,
    headerSort: true,
  },
  order_price_sum: {
    Header: t('下单金额'),
    id: 'order_price_sum',
    accessor: (d) => toFixOrderWithPrice(d.order_price_sum),
    minWidth: 120,
    headerSort: true,
  },
  outstock_price_sum: {
    Header: t('出库金额'),
    id: 'outstock_price_sum',
    accessor: (d) => toFixOrderWithPrice(d.outstock_price_sum),
    minWidth: 120,
    headerSort: true,
  },
  aftersale_price_sum: {
    Header: t('售后金额'),
    id: 'aftersale_price_sum',
    accessor: (d) => toFixOrderWithPrice(d.aftersale_price_sum),
    minWidth: 120,
    headerSort: true,
  },
  sale_price_sum: {
    Header: t('销售金额'),
    id: 'sale_price_sum',
    accessor: (d) => toFixOrderWithPrice(d.sale_price_sum),
    minWidth: 120,
    headerSort: true,
  },
  // 只针对综合销售报表
  detail_sum_tax_price_sum: {
    Header: t('销售税额'),
    id: 'detail_sum_tax_price_sum',
    accessor: (d) => toFixOrderWithPrice(d.detail_sum_tax_price_sum),
    minWidth: 120,
    headerSort: true,
  },
  tax_price_sum: {
    Header: t('销售税额'),
    id: 'tax_price_sum',
    accessor: (d) => toFixOrderWithPrice(d.tax_price_sum),
    minWidth: 120,
    headerSort: true,
  },
  outstock_cost_price_sum: {
    Header: t('出库成本金额'),
    id: 'outstock_cost_price_sum',
    accessor: (d) => toFixOrderWithPrice(d.outstock_cost_price_sum),
    minWidth: 120,
    headerSort: true,
  },
  category_l1_name: {
    Header: t('一级分类'),
    id: 'category_l1_name',
    accessor: 'category_l1_name',
    minWidth: 100,
    diyEnable: false,
  },
  category_l2_name: {
    Header: t('二级分类'),
    id: 'category_l2_name',
    accessor: 'category_l2_name',
    minWidth: 100,
    diyEnable: false,
  },
  order_time: {
    Header: t('下单日期'),
    id: 'order_time',
    accessor: (d) => moment(d.order_time).format('YYYY-MM-DD'),
    minWidth: 100,
    diyEnable: false,
  },
  receive_time: {
    Header: t('收货日期'),
    id: 'receive_time',
    accessor: (d) => moment(d.receive_time).format('YYYY-MM-DD'),
    minWidth: 150,
    diyEnable: false,
  },
  receive_customer_code: {
    Header: t('客户编码'),
    id: 'receive_customer_code',
    accessor: 'receive_customer_code',
    minWidth: 150,
  },
  receive_customer_name: {
    Header: t('客户名称'),
    id: 'receive_customer_name',
    accessor: 'receive_customer_name',
    minWidth: 100,
  },
  sku_count: {
    Header: t('商品种类数'),
    id: 'sku_count',
    accessor: 'sku_count',
    minWidth: 120,
    headerSort: true,
  },
  receive_customer_count: {
    Header: t('下单客户数'),
    id: 'receive_customer_count',
    accessor: 'receive_customer_count',
    minWidth: 100,
    headerSort: true,
  },
  order_id_count: {
    Header: t('订单数'),
    id: 'order_id_count',
    accessor: 'order_id_count',
    minWidth: 100,
    headerSort: true,
  },
  unit_quantity_sum: {
    Header: t('下单数'),
    id: 'unit_quantity_sum',
    accessor: (d) => toFixedOrder(+d.unit_quantity_sum),
    minWidth: 150,
    headerSort: true,
  },
  unit_name: {
    Header: t('下单单位'),
    id: 'unit_name',
    accessor: 'unit_name',
    minWidth: 100,
  },
}
