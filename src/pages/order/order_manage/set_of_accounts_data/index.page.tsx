import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'
import { usePagination } from '@gm-common/hooks'
import { useTableListRef } from '@/common/hooks'
import globalStore from '@/stores/global'

/** 套账数据列表 */
const SetOfAccountsData = () => {
  const tableRef = useTableListRef()

  const { pagination, run, loading } = usePagination<any>(store.fetchList, {
    paginationKey: 'view_order',
    defaultPaging: {
      need_count: true,
    },
  })

  useEffect(() => {
    store.setDoRequest(run)
    run()
  }, [])

  const onExport = () => {
    const diyShowMap = tableRef.current?.getDiyShowMap()
    return store.exportList(diyShowMap).then(() => {
      globalStore.showTaskPanel()
    })
  }

  return (
    <>
      <Filter onSearch={run} onExport={onExport} />
      <List pagination={pagination} loading={loading} tableRef={tableRef} />
    </>
  )
}

export default SetOfAccountsData
