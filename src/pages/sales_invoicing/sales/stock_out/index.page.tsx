import * as React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { useMount } from 'react-use'
import { usePagination } from '@gm-common/hooks'

import TableListTips from '@/common/components/table_list_tips'
import { useEffectOnce } from '@/common/hooks'

import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

import Filter from './components/filter'
import List from './components/list'

import { ListSotre } from './stores/index'

const StockOut = () => {
  const {
    filter: { q, warehouse_id },
    notInQuery,
    fetchList,
    getCustomerLabelList,
  } = ListSotre

  const { pagination, run, loading } = usePagination<any>(fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'salesStockOutList',
  })

  useMount(() => {
    execMutiWarehouseJudge(run)
    getCustomerLabelList()
  })

  useEffectOnce<string | undefined>(run, warehouse_id)

  return (
    <div>
      <Filter onSearch={run} loading={loading} />
      {notInQuery && (
        <TableListTips
          tips={[q + t('不在筛选条件中，已在全部销售出库单中为您找到')]}
        />
      )}
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </div>
  )
}

export default observer(StockOut)
