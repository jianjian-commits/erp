import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import TableListTips from '@/common/components/table_list_tips'
import { usePagination } from '@gm-common/hooks'

import Filter from './components/filter'
import List from './components/list'
import store from './stores/store'
import { observer } from 'mobx-react'
import { useEffectOnce } from '@/common/hooks'
import { useMount } from 'react-use'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

export default observer(() => {
  const { pagination, run, loading } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'otherStockStockInList',
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
    <>
      <Filter onSearch={run} loading={loading} />
      {notInQuery && (
        <TableListTips
          tips={[q + t('不在筛选条件中，已在全部其他入库单中为您找到')]}
        />
      )}
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </>
  )
})
