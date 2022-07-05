import * as React from 'react'
import { observer } from 'mobx-react'
import { useMount } from 'react-use'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'

import { HeaderDetail, EditDetail } from '../components'

import globalStore from '@/stores/global'
import { DetailStore } from '../stores/index'

const Create = () => {
  const { receiptDetail, fetchShelf, fetchCustomer } = DetailStore
  const { customer_name, warehouse_id } = receiptDetail

  const { run, loading } = useAsync(() =>
    Promise.all([fetchShelf(), fetchCustomer()]),
  )

  useMount(run)

  const renderDetail = () => {
    return customer_name ? <EditDetail /> : null
  }

  return (
    <LoadingChunk loading={loading}>
      <HeaderDetail type='add' />
      {/* 因为可以自定义客户，因此这里依靠name */}
      {globalStore.isOpenMultWarehouse
        ? warehouse_id && renderDetail()
        : renderDetail()}
    </LoadingChunk>
  )
}

export default observer(Create)
