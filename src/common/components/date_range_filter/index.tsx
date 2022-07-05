import React, { FC } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { Select, DateRangePicker, FormItem, Flex } from '@gm-pc/react'

interface Data {
  type: number | string
  name: string
  expand: boolean
  limit?: (
    date: Date,
    v: {
      begin?: Date
      end?: Date
    },
  ) => boolean
}

export interface DRFOnChange {
  (value: { begin?: Date; end?: Date; dateType?: number }): void
}

interface DateRangeFilterProps {
  data: Data[]
  onChange?: DRFOnChange
  value?: {
    begin: Date
    end: Date
    dateType: number
  }

  className?: string
  enabledTimeSelect?: boolean
}

// TODO 运营时间相关还不太清楚后端怎么设计
const DateRangeFilter: FC<DateRangeFilterProps> = ({
  data,
  onChange,
  value = {},
  className = '',
  enabledTimeSelect = false,
}) => {
  const { begin, end, dateType } = value
  const handleDateChange = (begin: Date, end: Date) => {
    onChange && onChange({ ...value, begin, end })
  }

  const handleSelectChange = (dateType: number) => {
    onChange && onChange({ ...value, dateType })
  }

  const target = _.find(data, (item) => {
    return item.type === dateType
  })

  const datePart = (
    <DateRangePicker
      begin={begin}
      end={end}
      onChange={handleDateChange}
      disabledDate={target?.limit}
      enabledTimeSelect={enabledTimeSelect}
    />
  )

  const isSelect = data.length > 1

  return (
    <FormItem
      className={classNames('', className)}
      col={target?.expand ? 2 : 1}
    >
      <Flex>
        <div
          className='gm-padding-right-5 '
          style={
            isSelect
              ? { width: '110px', marginLeft: '-10px' }
              : { margin: 'auto' }
          }
        >
          {isSelect ? (
            <Select
              clean
              value={dateType}
              onChange={handleSelectChange}
              className='gm-block'
              data={_.map(data, (v) => ({
                value: v.type,
                text: v.name,
              }))}
            />
          ) : (
            <div className='gm-block'>{data[0]?.name + '：'}</div>
          )}
        </div>
        <Flex flex none column style={{ minWidth: 'auto' }}>
          {datePart}
        </Flex>
      </Flex>
    </FormItem>
  )
}

export default DateRangeFilter
