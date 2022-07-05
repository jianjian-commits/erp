import React, { useEffect } from 'react'
import _ from 'lodash'
import { useGMLocation } from '@gm-common/router'

import store from '../stores/detail_store'
import ListDetail from '../components/list_detail'
import HeadDetail from '../components/head_detail'

interface Query {
  adjust_sheet_id: string
}

export default () => {
  const { adjust_sheet_id } = useGMLocation<Query>().query

  useEffect(() => {
    store.fetchAdjustSheet({ adjust_sheet_id })
    return store.clear
  }, [])
  return (
    <>
      <HeadDetail />
      <ListDetail />
    </>
  )
}
