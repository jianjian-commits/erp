import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import TableListTips from '@/common/components/table_list_tips'
import { usePagination } from '@gm-common/hooks'

import Filter from './components/filter'
import List from './components/list'
import store from './stores/store'

import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

const ManageList = observer(() => {
  const { pagination, run } = usePagination<any, any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'inventoryCheckTransferList',
  })

  const {
    filter: { q, warehouse_id },
    notInQuery,
  } = store

  useEffectOnce(run, warehouse_id)

  useEffect(() => {
    execMutiWarehouseJudge(run)
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      {notInQuery && (
        <TableListTips
          tips={[q + t('不在筛选条件中，已在全部盘点单中为您找到')]}
        />
      )}
      <List onFetchList={run} pagination={pagination} />
    </>
  )
})

export default ManageList
