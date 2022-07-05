import React, { FC } from 'react'
import { Select } from '@gm-pc/react'
import _ from 'lodash'
import { getDayList } from '../util'

interface Day {
  value: any
  text: string
}
interface DaySelectProps {
  days?: Day[]
  value: any
  onChange: (value: any) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

const DaySelect: FC<DaySelectProps> = (props) => {
  const { days = getDayList(15), className, min, max, ...rest } = props

  let newDays = days

  if (min !== undefined) {
    newDays = days.slice(min)
  }
  if (max !== undefined) {
    newDays = days.slice(0, max)
  }
  if (min !== undefined && max !== undefined) {
    newDays = days.slice(min, max)
  }

  return <Select {...rest} data={newDays} style={{ width: '80px' }} />
}

export default DaySelect
