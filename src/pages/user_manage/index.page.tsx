import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import List from './components/list'
import Filter from './components/filter'
import { usePagination } from '@gm-common/hooks'
import { ListGroupUserRequest } from 'gm_api/src/enterprise'

const UserManage: FC = () => {
  const { pagination, paging, runChangePaging, refresh, run } =
    usePagination<ListGroupUserRequest>(
      (params) => store.fetchGroupUserList(params),
      {
        defaultPaging: {
          need_count: true,
        },
      },
    )

  useEffect(() => {
    Promise.all([run(), store.fetchWarehouselist()])
  }, [])

  return (
    <div>
      <Filter onSearch={run} />
      <List refresh={refresh} pagination={pagination} />
    </div>
  )
}

export default observer(UserManage)
