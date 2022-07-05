import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'

const Receiver = () => {
  const {
    order: { view_type, addresses },
  } = store
  if (view_type === 'create') return <div className='gm-padding-right-5'>-</div>
  return (
    <div className='gm-padding-right-5'>
      {(addresses?.addresses || [])[0]?.receiver || '-'}
    </div>
  )
}

export default observer(Receiver)
