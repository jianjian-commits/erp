import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { usePagination } from '@gm-common/hooks'
import Filter from './componetns/filter'
import List from './componetns/list'
import store from './store'

const OrderTask: FC = observer(() => {
  const { pagination, run, refresh } = usePagination<any>(
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
      <List refreshList={refresh} pagination={pagination} />
    </>
  )
})

export default OrderTask
