import React, { useEffect } from 'react'
import { observer } from 'mobx-react'

import Filter from './filter'
import List from './list'

import orderStore from './order_store'
import { usePagination } from '@gm-common/hooks'

const SortingOrder = () => {
  const { pagination, run } = usePagination<any>(orderStore.fetchList, {
    defaultPaging: {
      need_count: true,
    },
  })

  useEffect(() => {
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
}

export default observer(SortingOrder)
