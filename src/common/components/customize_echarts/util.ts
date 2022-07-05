import moment from 'moment'

// 格式化数值表述。
const valueLabelFormatter = (value: number) => {
  if (value >= 10000) {
    return value / 10000 + 'w'
  }

  if (value >= 1000) {
    return value / 1000 + 'k'
  }

  return value
}

// 获取日期范围，后台返回的数据可能有些天使没有数据的，估不能用后台的数据。
const getDateRange = (begin: Date, end: Date) => {
  const result = []
  const b = moment(begin).startOf('d')
  const e = moment(end).startOf('d')
  // eslint-disable-next-line no-unmodified-loop-condition
  while (b <= e) {
        // eslint-disable-line
    result.push(b.format('YYYY-MM-DD'))
    b.add('d', 1)
  }
  return result
}

export { valueLabelFormatter, getDateRange }
