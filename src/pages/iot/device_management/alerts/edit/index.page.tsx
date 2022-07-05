import React from 'react'
import Details from '../components/details'
import { useGMLocation } from '@gm-common/router'

const EditRulePage = () => {
  const { alarm_rule_id } = useGMLocation<{
    alarm_rule_id: string
  }>().query

  return <Details isEdit alarm_rule_id={alarm_rule_id} />
}

export default EditRulePage
