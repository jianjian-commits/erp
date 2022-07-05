import TableListTips from '@/common/components/table_list_tips'
import { BoxTable } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Task_Type } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { FC } from 'react'
import {
  avg_price,
  base_unit_name,
  base_unit_output_amount_sum,
  base_unit_stock_in_amount_sum,
  bom_name,
  by_products,
  category_path,
  customized_code,
  input_actual_usage_total_price_sum,
  reference_cost,
  sku_name,
  sku_type,
  sub_actual_usage_amount_sum,
  sub_actual_usage_total_price_sum,
  sub_base_unit_name,
  sub_customized_code,
  sub_plan_usage_amount_sum,
  sub_receive_amount_sum,
  sub_return_amount_sum,
  sub_sku_name,
  sub_sku_type,
} from '../../components/columns'
import store from '../store'

const List: FC = observer(() => {
  const { tasks } = store
  const columns: Array<any> = [
    customized_code,
    sku_name,
    bom_name,
    sku_type,
    category_path,
    base_unit_name,
    base_unit_output_amount_sum,
    base_unit_stock_in_amount_sum,
    input_actual_usage_total_price_sum(store),
    avg_price(Task_Type.TYPE_PRODUCE),
    reference_cost,
    by_products,
  ]
  const subColumns = [
    sub_customized_code,
    sub_sku_name,
    sub_sku_type,
    sub_base_unit_name,
    sub_receive_amount_sum,
    sub_return_amount_sum,
    sub_actual_usage_amount_sum,
    sub_plan_usage_amount_sum,
    sub_actual_usage_total_price_sum,
  ]

  return (
    <>
      <TableListTips
        tips={[
          store.updateTime === '0' || store.updateTime === ''
            ? t('统计时间约10分钟统计更新一次')
            : t(
                `统计时间约10分钟统计更新一次，最近更新时间${moment(
                  new Date(+store.updateTime),
                ).format('YYYY-MM-DD HH:mm:ss')}`,
              ),
        ]}
      />
      <BoxTable
        headerProps={{
          height: 'auto',
          style: { padding: 0 },
        }}
      >
        <Table
          data={tasks.slice()}
          loading={store.loading}
          columns={columns as any}
          isExpand
          SubComponent={
            store.tab === Task_Type.TYPE_PRODUCE
              ? (row: any) => (
                  <Table
                    isSub
                    data={tasks[row.index].materials || []}
                    columns={subColumns as any}
                  />
                )
              : undefined
          }
        />
      </BoxTable>
    </>
  )
})

export default List
