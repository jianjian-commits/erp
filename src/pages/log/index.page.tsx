import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import List from './components/list'
import Filter from './components/filter'
import store from './store'
import { t } from 'gm-i18n'

const SystemLog: FC = observer(() => {
  const { clearStore } = store

  useEffect(() => {
    window.document.title = t('系统日志')
    return () => {
      clearStore()
    }
  }, [])

  return (
    <>
      <Filter />
      <List />
    </>
  )
})

export default SystemLog
