import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { usePagination } from '@gm-common/hooks'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

const OrderTask: FC = observer(() => {
  const { pagination, run } = usePagination<any>(
    (params) => store.fetchList(params),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )
  return (
    <>
      <Filter onSearch={run} />
      <List pagination={pagination} />
    </>
  )
})

export default OrderTask
