import React from 'react'
import { useGMLocation } from '@gm-common/router'
import Detail from '../components/detail'

const Update = () => {
  const location = useGMLocation<{
    budget_id: string
  }>()
  const { budget_id } = location.query
  return <Detail budget_id={budget_id} />
}

export default Update
