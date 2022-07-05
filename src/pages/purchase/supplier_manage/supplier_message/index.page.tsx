import { usePagination } from '@gm-common/hooks'
import { observer } from 'mobx-react'
import React from 'react'
import { useMount } from 'react-use'
import { Filter, List } from './components'
import store from './store'

const SupplierMessage = observer(() => {
  const { paging, pagination, run } = usePagination<any>(
    store.fetchSupplierList,
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useMount(() => {
    store.generateCategory1Map().then(() => run())
  })

  return (
    <div>
      <Filter onSearch={run} />
      <List run={run} paging={paging} pagination={pagination} />
    </div>
  )
})

export default SupplierMessage
