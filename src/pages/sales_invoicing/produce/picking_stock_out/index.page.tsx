import React from 'react'
import { observer } from 'mobx-react'
import { useMount } from 'react-use'
import { t } from 'gm-i18n'
import { usePagination } from '@gm-common/hooks'

import TableListTips from '@/common/components/table_list_tips'
import { useEffectOnce } from '@/common/hooks'

import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

import { Filter, List } from './components'

import { ListSotre } from './stores'

const StockIn = () => {
  const {
    filter: { q, warehouse_id },
    notInQuery,
    fetchList,
  } = ListSotre

  const { pagination, run, loading } = usePagination<any>(fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'producePickingStockOutList',
  })

  // 只在第一次加载一次
  useEffectOnce<string | undefined>(run, warehouse_id)

  // component mounted 后调用请求列表 run
  useMount(() => {
    execMutiWarehouseJudge(run)
  })

  return (
    <div>
      <Filter onSearch={run} loading={loading} />
      {notInQuery && (
        <TableListTips
          tips={[q + t('不在筛选条件中，已在全部领料出库单中为您找到')]}
        />
      )}
      <List onFetchList={run} loading={loading} pagination={pagination} />
    </div>
  )
}

export default observer(StockIn)
