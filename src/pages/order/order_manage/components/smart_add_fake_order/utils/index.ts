import Big from 'big.js'
import _ from 'lodash'

export const formatePrice = (value?: unknown) => {
  if (_.isNil(value)) {
    return '0'
  }
  if (_.isPlainObject(value)) {
    return '0'
  }
  const val = _.trim(`${value}`)
  if (val.length === 0) {
    return '0'
  }
  const num = Number(value)
  if (Number.isNaN(num)) {
    return '0'
  }
  return `${value}`
}

// 是否为 0
export const isZero = (value?: unknown) => {
  return Big(0).eq(formatePrice(value))
}

export { default as getFakeFields } from './get_fake_fields'
