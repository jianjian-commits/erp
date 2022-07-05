import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { map_App_Type } from 'gm_api/src/common'
import { appTypeMap } from '../../../../enum'

const Original = () => {
  const {
    order: { view_type, app_type, repair, order_op },
  } = store
  if (view_type === 'create') {
    return <div>{!repair ? '系统录单' : '补录订单'}</div>
  }
  return (
    <div>
      {appTypeMap[`${app_type!}_${order_op}`] || map_App_Type[app_type!]}
    </div>
  )
}

export default observer(Original)
