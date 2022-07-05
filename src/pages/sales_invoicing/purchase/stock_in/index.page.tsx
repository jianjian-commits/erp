import React, { useEffect } from 'react'
import { usePagination } from '@gm-common/hooks'

import { Filter, List } from './components'
import store from './stores/list_store'
import globalStore from '@/stores/global'
import { observer } from 'mobx-react'
import TableListTips from '@/common/components/table_list_tips'
import { t } from 'gm-i18n'
import { useEffectOnce } from '@/common/hooks'

const StockIn = observer(() => {
  const { pagination, run, loading } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'purchaseStockInList',
  })

  const {
    filter: { q, warehouse_id },
    notInQuery,
  } = store

  // 标准版开启多仓，受到仓库筛选限制
  useEffectOnce<string | undefined>(run, warehouse_id)

  useEffect(() => {
    store.fetchSupplier()
    store.fetchGroupUser()
    // 轻巧版和标准版未开多仓时，不受多仓限制，可发出请求
    if (!globalStore.isOpenMultWarehouse) {
      run()
    }
    return store.clearGroupUser
  }, [])

  return (
    <div>
      <Filter onSearch={run} loading={loading} />
      {notInQuery && (
        <TableListTips
          tips={[q + t('不在筛选条件中，已在全部采购入库单中为您找到')]}
        />
      )}
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </div>
  )
})

export default StockIn
