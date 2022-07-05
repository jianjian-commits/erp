import React, { useState, FC } from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import _ from 'lodash'
import moment from 'moment'
import { DateButtonOptions, DateButtonMapOptions } from '../interface'

const DATEMAP: DateButtonMapOptions = {
  1: t('今天'),
  7: t('近7天'),
  15: t('近15天'),
  30: t('近30天'),
}

const DateButton: FC<DateButtonOptions> = ({ range, onChange }) => {
  const [cur, setCur] = useState<number>(7)
  const date = _.map(range, (r) => ({ value: r, text: DATEMAP[r] }))
  const handleClick = (item: number) => {
    setCur(item)
    const begin = moment().subtract(item, 'd').toDate()
    const end = moment().toDate()
    onChange && onChange(begin, end)
  }

  const getDate = (value: number) => {
    const begin = moment()
      .subtract(value - 1, 'day')
      .format('YYYY-MM-DD')
    const end = moment().format('YYYY-MM-DD')
    return (
      <span>
        {`近${value}天`}
        &nbsp;{`(${begin}~${end})`}
      </span>
    )
  }

  return (
    <Select
      className='b-purchase-overview-dropDown gm-cursor'
      style={{ borderRadius: '2px', height: '30px' }}
      value={cur}
      data={date}
      renderItem={(item: any) => getDate(item.value)}
      onChange={(value: number) => handleClick(value)}
    />
  )
}
export default DateButton
