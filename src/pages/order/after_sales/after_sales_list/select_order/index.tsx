import React, { FC, useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'
import { observer } from 'mobx-react'
import Filter from './filter'
import List from './list'
import store from '../store/select_order_store'

const SelectOrder: FC = observer(() => {
  const { paging, runChangePaging, run } = usePagination<any>(
    store.fetchOrderList,
    {
      paginationKey: 'view_order',
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffect(() => {
    run()
  }, [])

  return (
    <>
      <Filter onSearch={run} />
      <List />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
    </>
  )
})

export default SelectOrder
