import React, { useEffect } from 'react'
import List from '../components/batch/list'
import batchStore from '../components/batch/store'
import { gmHistory } from '@gm-common/router'
import { useBreadcrumbs } from '@/common/hooks'

export default () => {
  const { list, servicePeriod } = batchStore
  if (!list.length || !servicePeriod) {
    gmHistory.replace('/order/order_manage/list')
    return null
  }
  useBreadcrumbs(['批量导入订单'])

  useEffect(() => {
    return () => {
      batchStore.init()
    }
  }, [])

  return <List />
}
