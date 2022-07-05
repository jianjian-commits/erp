import TableListTips from '@/common/components/table_list_tips'
import { BoxTable, Flex, Select } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { CleanFoodTaskDataFields, Task_Type } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { FC } from 'react'
import {
  actual_product_percentage,
  avg_price,
  base_unit_name,
  base_unit_output_amount_sum,
  base_unit_stock_in_amount_sum,
  bom_name,
  by_products,
  category_path,
  child_actual_usage_amount_sum,
  child_actual_usage_total_price_sum,
  child_base_unit_name,
  child_customized_code,
  child_plan_usage_amount_sum,
  child_receive_amount_sum,
  child_return_amount_sum,
  child_sku_name,
  customized_code,
  input_actual_usage_total_price_sum,
  operation,
  product_percentage,
  reference_cost,
  sku_name,
  sku_type,
  stock_in_percentage,
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
    actual_product_percentage,
    product_percentage(store),
    stock_in_percentage(store),
    by_products,
    child_customized_code,
    child_sku_name,
    child_base_unit_name,
    child_receive_amount_sum,
    child_return_amount_sum,
    child_actual_usage_amount_sum,
    child_plan_usage_amount_sum,
    child_actual_usage_total_price_sum,
    operation(store, Task_Type.TYPE_PRODUCE),
  ]

  if (store.view === CleanFoodTaskDataFields.CLEANFOODTASKDATAFIELDS_SKU) {
    ;[
      bom_name,
      child_customized_code,
      child_sku_name,
      child_base_unit_name,
    ].forEach((item) => {
      columns.splice(columns.indexOf(item), 1)
    })
  }

  const action = (
    <Flex>
      <Select
        clean
        data={[
          {
            text: '按商品查看',
            value: CleanFoodTaskDataFields.CLEANFOODTASKDATAFIELDS_SKU,
          },
          {
            text: '按商品+Bom查看',
            value: CleanFoodTaskDataFields.CLEANFOODTASKDATAFIELDS_SKU_BOM,
          },
        ]}
        value={store.view}
        style={{ width: '140px' }}
        onChange={(value) => store.setView(value)}
      />
    </Flex>
  )

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
      <BoxTable action={action}>
        <Table
          data={tasks.slice()}
          loading={store.loading}
          columns={columns as any}
        />
      </BoxTable>
    </>
  )
})

export default List
