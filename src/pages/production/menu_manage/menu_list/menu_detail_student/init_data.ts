import moment from 'moment'

export const initSku = {
  sku_id: '',
  unit_id: '',
  count: '',
  sku: {
    name: '',
    units: {
      units: [],
    },
  },
}

const getMondayAndSunday = (date: Date) => {
  const week = moment(date).day()
  return {
    monday: moment(date)
      .subtract(week - 1, 'd')
      .startOf('day')
      .toDate(),
    sunday: moment(date)
      .add(7 - week, 'd')
      .startOf('day')
      .toDate(),
  }
}

const today = new Date()
const { monday, sunday } = getMondayAndSunday(today)

export const initFilter = {
  meal_date_start: monday,
  meal_date_end: sunday,
}

export const initSummary = {
  count: '0',
  total_price: '0',
}
