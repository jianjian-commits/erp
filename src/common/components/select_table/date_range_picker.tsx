import { useControllableValue } from '@/common/hooks'
import {
  DateRangePicker as RawDateRangePicker,
  DateRangePickerProps as RawDateRangePickerProps,
} from '@gm-pc/react'
import classNames from 'classnames'
import React from 'react'

export interface DateRangeShape {
  begin: RawDateRangePickerProps['begin']
  end: RawDateRangePickerProps['end']
}

export type BasicDateRangePickerProps = Omit<
  RawDateRangePickerProps,
  'begin' | 'end' | 'onChange'
>

export type DateRangePickerProps = BasicDateRangePickerProps & {
  value: DateRangeShape
  defaultValue?: DateRangeShape
  onChange?: (value: DateRangeShape) => void
}

const DateRangePicker: React.VFC<DateRangePickerProps> = (props) => {
  const { className, value, defaultValue, onChange, ...otherProps } = props

  const [state, setState] = useControllableValue<DateRangeShape>({
    value,
    defaultValue,
    onChange,
  })

  return (
    <RawDateRangePicker
      enabledTimeSelect
      {...otherProps}
      className={classNames('antd-gm-date-picker', className)}
      begin={state.begin}
      end={state.end}
      onChange={(begin, end) => setState({ begin, end })}
    />
  )
}

export default DateRangePicker
