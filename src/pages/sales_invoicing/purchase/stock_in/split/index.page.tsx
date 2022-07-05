import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import SplitDetail from '../components/split_detail'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import { DetailStore } from '../stores'

const Create = observer(() => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query
  const { fetchStockSheet, clear } = DetailStore

  const { run, loading } = useAsync(() =>
    Promise.all([fetchStockSheet(sheet_id)]),
  )

  useEffect(() => {
    if (sheet_id) {
      run()
    }
    return clear
  }, [])

  return (
    <LoadingChunk loading={loading}>
      <SplitDetail />
    </LoadingChunk>
  )
})

export default Create
