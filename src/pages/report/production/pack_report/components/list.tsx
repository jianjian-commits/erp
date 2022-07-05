import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { BoxTable, BoxTableInfo, BoxTableProps } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import moment from 'moment'
import TableTotalText from '@/common/components/table_total_text'
import TableListTips from '@/common/components/table_list_tips'
import store from '../store'
import {
  avg_price,
  category_path,
  customized_code,
  input_actual_usage_total_price_sum,
  detail,
  output_amount_sum,
  pack_unit_name,
  sku_name,
  sku_type,
  spec,
  spec_name,
  sub_customized_code,
  sub_sku_name,
  sub_sku_type,
  sub_base_unit_name,
  sub_receive_amount_sum,
  sub_return_amount_sum,
  sub_actual_usage_amount_sum,
  sub_plan_usage_amount_sum,
  sub_actual_usage_total_price_sum,
} from '../../components/columns'
import { Task_Type } from 'gm_api/src/production'

const List: FC<Pick<BoxTableProps, 'pagination'>> = observer(
  ({ pagination }) => {
    const { taskCount, tasks } = store
    const columns = [
      customized_code,
      sku_name,
      sku_type,
      spec_name,
      spec,
      category_path,
      pack_unit_name,
      output_amount_sum,
      input_actual_usage_total_price_sum(store),
      avg_price(Task_Type.TYPE_PACK),
      detail(store, Task_Type.TYPE_PACK),
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
          pagination={pagination}
          info={
            <BoxTableInfo>
              <TableTotalText
                data={[
                  {
                    label: t('商品列表'),
                    content: taskCount,
                  },
                ]}
              />
            </BoxTableInfo>
          }
        >
          <Table
            data={tasks.slice()}
            loading={store.loading}
            columns={columns as any}
            isExpand
            SubComponent={(row: any) => (
              <Table
                isSub
                data={tasks[row.index].materials || []}
                columns={subColumns as any}
              />
            )}
          />
        </BoxTable>
      </>
    )
  },
)

export default List
