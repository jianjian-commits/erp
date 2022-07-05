import { usePagination } from '@gm-common/hooks'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { Filter, List } from './components'
import store from './stores/list_store'

const SupplierManage = observer(() => {
  const { pagination, run } = usePagination<any>(store.fetchSupplierList, {
    defaultPaging: {
      need_count: true,
    },
  })

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <Filter onSearch={run} />
      <List run={run} pagination={pagination} />
    </div>
  )
})

export default SupplierManage
