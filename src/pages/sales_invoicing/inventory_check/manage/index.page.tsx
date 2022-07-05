import React from 'react'
import { t } from 'gm-i18n'
import TableListTips from '@/common/components/table_list_tips'
import { usePagination } from '@gm-common/hooks'
import { useMount } from 'react-use'
import Filter from './components/filter'
import List from './components/list'
import store from './stores/store'
import { observer } from 'mobx-react'
import { useEffectOnce } from '@/common/hooks'
import globalStore from '@/stores/global'

const ManageList = () => {
  const { pagination, run } = usePagination<any>(store.fetchList, {
    defaultPaging: {
      need_count: true,
    },
    paginationKey: 'inventoryCheckManageList',
  })

  const {
    filter: { q, warehouse_id },
    notInQuery,
  } = store

  useEffectOnce<string | undefined>(run, warehouse_id)

  useMount(() => {
    if (!globalStore.isOpenMultWarehouse) {
      run()
    }
  })

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
}

export default observer(ManageList)
