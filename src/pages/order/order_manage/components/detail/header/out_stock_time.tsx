import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import moment from 'moment'

const OutStockTime = () => {
  const {
    order: { outstock_time },
  } = store

  return (
    <div className='gm-padding-right-5'>
      {outstock_time !== '0' && outstock_time
        ? moment(new Date(+outstock_time!)).format('YYYY-MM-DD HH:mm')
        : '-'}
    </div>
  )
}

export default observer(OutStockTime)
