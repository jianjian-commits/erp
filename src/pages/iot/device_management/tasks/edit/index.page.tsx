import React from 'react'
import { useGMLocation } from '@gm-common/router'
import Details from '../components/details'

const TaskEditPage = () => {
  const { strategy_id } = useGMLocation<{
    strategy_id: string
  }>().query

  return <Details isEdit strategy_id={strategy_id} />
}

export default TaskEditPage
