import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import '@/pages/order/style.less'

const Address = () => {
  const {
    order: { view_type, addresses },
  } = store
  if (view_type === 'create') return <div className='gm-padding-right-5'>-</div>
  const addr = (addresses?.addresses || [])[0]?.address || '-'
  return (
    <div className='gm-padding-right-5 over-flow-ellipsis-3' title={addr}>
      {addr}
    </div>
  )
}

export default observer(Address)
