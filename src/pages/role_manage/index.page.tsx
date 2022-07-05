import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import List from './components/list'
import Filter from './components/filter'
import { usePagination } from '@gm-common/hooks'
import { ListRoleRequest } from 'gm_api/src/enterprise'

const RoleManage: FC = () => {
  const { pagination, refresh } = usePagination<ListRoleRequest>(
    (params) => store.fetchRoleList(params),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  return (
    <div>
      <Filter onSearch={refresh} />
      <List refresh={refresh} pagination={pagination} />
    </div>
  )
}

export default observer(RoleManage)
