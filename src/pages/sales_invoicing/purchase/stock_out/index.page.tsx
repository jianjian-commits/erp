import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'

import Filter from './components/filter'
import List from './components/list'
import store from './stores/list_store'
import TableListTips from '@/common/components/table_list_tips'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

const StockOut = () => {
  const { pagination, run, loading } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'PurchaseStockOutList',
  })

  const {
    filter: { q, warehouse_id },
    notInQuery,
  } = store

  useEffectOnce<string | undefined>(run, warehouse_id)

  useEffect(() => {
    execMutiWarehouseJudge(run)
  }, [])

  return (
    <div>
      <Filter onSearch={run} loading={loading} />
      {notInQuery && (
        <TableListTips
          tips={[q + t('不在筛选条件中，已在全部采购退货出库单中为您找到')]}
        />
      )}
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </div>
  )
}

export default observer(StockOut)
