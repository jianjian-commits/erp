/*
 * @Description: 获取日期util
 */
import moment from 'moment'
import { getHoliday, getDay } from '@gm-common/date'
import { WeekEnum } from '@/common/enum'

/**
 * @description: 获取周一 => 周日
 */
export const getWeek = (date: Date | string) => {
  return getDay(date)
}
/**
 * @description: 获取星期一 => 星期日
 */
export const getWeek2 = (date: Date | string) => {
  const week = moment(date).day()
  return WeekEnum[week]
}

export const getHolidayText = (date: Date | string) => {
  const holiday = getHoliday(date)
  if (!holiday) {
    return null
  }

  if (holiday!.isOffDay) {
    return holiday.name
  } else {
    return '班'
  }
}

/**
 * @description: 获取时间戳字符串
 */
export const getTimestamp = (date: Date | null): string | undefined => {
  return date ? '' + +moment(date) : undefined
}

/**
 * @description: 获取时间戳字符串对应的Date
 */
export const getDateByTimestamp = (str?: string): Date | undefined => {
  if (str === '0') return undefined
  return str ? moment(+str).toDate() : undefined
}
/**
 * @description: 根据时间戳获取对应的格式字符串
 */
export const getFormatByTimestamp = (
  format:
    | 'YYYY-MM-DD'
    | 'YYYY-MM-DD HH:mm:ss'
    | 'YYYY-MM-DD HH:mm'
    | 'HH:mm:ss'
    | 'MM.DD'
    | 'HH:mm',
  str?: string,
): string | undefined => {
  return str ? moment(+str).format(format) : undefined
}
/**
 * @description: Table的格式化日期，日期为0显示'-'
 */
export const getFormatTimeForTable = (
  format:
    | 'YYYY-MM-DD'
    | 'YYYY-MM-DD HH:mm:ss'
    | 'YYYY-MM-DD HH:mm'
    | 'HH:mm:ss' // 方便提示，如果有其他的再放开吧
    | 'HH:mm',
  str?: string,
): string | undefined => {
  if (str === '0') return '-'
  return getFormatByTimestamp(format, str) ?? '-'
}
