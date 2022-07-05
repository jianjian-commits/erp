import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { getReceiptStatusText } from '@/common/util'

const ReceiptStatus = () => {
  const {
    order: { status },
  } = store
  return (
    <div className='gm-padding-right-5'>{getReceiptStatusText(status!)}</div>
  )
}

export default observer(ReceiptStatus)
