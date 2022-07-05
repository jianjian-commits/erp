import moment from 'moment'
import { isNumber } from 'lodash'

// 把string类型的时间戳格式化显示时间
const formatTimeStamp = (
  timeStamp: string | number,
  key: string, // YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH
): string => {
  const _timeStamp = isNumber(timeStamp) ? timeStamp : Number(timeStamp)
  const toDateObject = new Date(_timeStamp)
  if (timeStamp) {
    return moment(toDateObject).format(key)
  } else {
    return '-'
  }
}

/**
 * 时间选择器控制在三个月范围内
 */
const minPickerDate = moment().subtract(1, 'month').toDate() // 往前一个月
const maxPickerDate = moment().add(2, 'month').toDate() // 往后两个月

export { formatTimeStamp, minPickerDate, maxPickerDate }
