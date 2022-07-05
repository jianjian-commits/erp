import React from 'react'
import { usePagination } from '@gm-common/hooks'

import { Filter, List } from './components'

import store from './stores/list_store'
import { t } from 'gm-i18n'
import TableListTips from '@/common/components/table_list_tips'
import { observer } from 'mobx-react'
import { useEffectOnce } from '@/common/hooks'
import { useMount } from 'react-use'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

const StockIn = () => {
  const { pagination, run, loading } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'produceRefundStockInList',
  })
  const {
    filter: { q, warehouse_id },
    notInQuery,
  } = store

  useEffectOnce<string | undefined>(run, warehouse_id)

  useMount(() => {
    execMutiWarehouseJudge(run)
  })

  return (
    <div>
      <Filter onSearch={run} loading={loading} />
      {notInQuery && (
        <TableListTips
          tips={[q + t('不在筛选条件中，已在全部退料入库单中为您找到')]}
        />
      )}
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </div>
  )
}

export default observer(StockIn)
