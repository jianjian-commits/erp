import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import List from './components/list'
import Filter from './components/filter'
import store from './store'

interface LogProps {
  modelId: string | string[]
  type: string
}

const Log: FC<LogProps> = observer((props) => {
  const { modelId, type } = props
  const { setPageInfo, clearStore } = store

  useEffect(() => {
    setPageInfo(type, modelId)
  }, [modelId, type])

  useEffect(() => {
    return () => clearStore()
  }, [])

  return (
    <>
      <Filter />
      <List />
    </>
  )
})

export default Log
