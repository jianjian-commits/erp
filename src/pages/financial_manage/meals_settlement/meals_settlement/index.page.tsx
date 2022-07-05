import React, { useEffect } from 'react'
import { Pagination, BoxPagination } from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'
import { observer } from 'mobx-react'
import List from './components/list'
import Filter from './components/filter'
import store from './store'
import { t } from 'gm-i18n'
import { setTitle } from '@gm-common/tool'

export default observer(() => {
  useEffect(() => {
    setTitle(t('对账单'))
  })
  useEffect(() => {
    store.fetchSettlementList()
  }, [])
  return (
    <>
      <Filter />
      <List />
    </>
  )
})
