import React, { FC, MouseEvent } from 'react'
import moment, { Moment } from 'moment'

interface DayProps {
  key?: number
  /* 日期值 */
  value: Moment
  /* 开始日期 */
  begin: Moment | null
  /* 结束日期 */
  end: Moment | null
  onClick(value: Moment): void
  disabled: boolean
  /* 键盘用 */
  will: Moment
  /* 当前鼠标hover日期 */
  hoverDay?: Moment | null
  onHoverDay?(value: Moment | null): void
}

const Day: FC<DayProps> = ({
  key,
  disabled,
  onClick,
  value,
  will,
  begin,
  end,
  hoverDay,
  onHoverDay,
}) => {
  const handleClick = (): void => {
    if (disabled) {
      return
    }
    onClick(value)
  }

  const handleMouseOver = (event: MouseEvent<HTMLSpanElement>): void => {
    if (!onHoverDay) {
      return
    }
    // 获取鼠标所在hover值
    const day = (event.target as HTMLSpanElement).innerText
    if (day && ((begin && !end) || (!begin && end))) {
      !disabled && onHoverDay(moment(value))
    } else {
      onHoverDay(null)
    }
  }

  // const cn = classNames('gm-calendar-day', {
  //   // 无状态
  //   'gm-calendar-day-old': will.month() > value.month(),
  //   'gm-calendar-day-new': will.month() < value.month(),
  //   'gm-calendar-day-now': nowStart === valueStart,
  //   // 键盘
  //   'gm-calendar-day-will': willStart === valueStart,
  //   // 选中日期中间态
  //   active: isActive(),
  //   'gm-calendar-day-begin': beginStart === valueStart,
  //   'gm-calendar-day-end': endStart === valueStart,
  //   // hover日期中间态
  //   'gm-calendar-day-hover': isHover(),
  //   'gm-calendar-day-hover-end':
  //     ((begin && !end) || (!begin && end)) && hoverStart === valueStart,
  //   // 不可用
  //   disabled,
  // })

  return (
    <div
      className='gm-calendar-day'
      onClick={handleClick}
      onMouseOver={handleMouseOver}
    >
      {value.date()}
    </div>
  )
}

export default Day
