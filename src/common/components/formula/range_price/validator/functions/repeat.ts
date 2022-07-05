import { t } from 'gm-i18n'
import _ from 'lodash'
import { ValidatorFn, ValidatorResult } from '../types'

const DATA_ERROR: ValidatorResult = {
  isValid: false,
  message: t('区间错误，未读取到有效数据'),
} as const

const DISCONTINUOUS: ValidatorResult = {
  isValid: false,
  message: t('区间错误，请设置连续的价格区间'),
} as const

const DATA_REPEAT: ValidatorResult = {
  isValid: false,
  message: t('区间错误，存在区间设置重叠'),
} as const

/**
 * 区间错误，存在区间设置重叠
 *
 * 1. 必须是连续区间，只能从小到大书写
 * 2. 左区间需要 = 上一个右区间
 */
const isRepeat: ValidatorFn = (params) => {
  const { value, list, index } = params

  if (index !== 0) {
    // 数据错误
    if (!_.isArray(list) || _.isNil(value)) {
      return DATA_ERROR
    }

    // 上一个区间
    const prev = list[index - 1]

    // 左区间 < 上一个右区间  => 区间重合
    if (value?.min < prev.max) {
      return DATA_REPEAT
    }

    // 左区间 > 上一个右区间  => 非连续区间
    if (value?.min > prev.max) {
      return DISCONTINUOUS
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

export default isRepeat
