import SVGHoliday from './svg/holiday.svg'
import { t } from 'gm-i18n'
import SVGDone from './svg/done.svg'
import SVGFuture from './svg/future.svg'
import SVGIn from './svg/in.svg'
import React from 'react'
import classNames from 'classnames'

const Status = ({ is_holiday, menu_status, className, ...rest }: any) => {
  const holiday = (
    <>
      <SVGHoliday /> {t('放假')}
    </>
  )

  const done = (
    <>
      <SVGDone /> {t('已完成')}
    </>
  )

  const future = (
    <>
      <SVGFuture /> {t('未生效')}
    </>
  )

  const cin = (
    <>
      <SVGIn /> {t('生效中')}
    </>
  )

  return (
    <span
      {...rest}
      className={classNames('gm-text-desc gm-margin-left-5', className)}
    >
      {is_holiday
        ? holiday
        : menu_status === 'done'
        ? done
        : menu_status === 'future'
        ? future
        : menu_status === 'in'
        ? cin
        : '-'}
    </span>
  )
}

export default Status
