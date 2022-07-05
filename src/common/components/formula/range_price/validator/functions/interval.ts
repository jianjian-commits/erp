import { t } from 'gm-i18n'
import { ValidatorFn } from '../types'

/**
 * 验证区间是否有效
 * 左区间 < 右区间
 */
const isInterval: ValidatorFn = (params) => {
  const { value, index, list = [] } = params

  return {
    isValid:
      (index === 0 && !value?.min) ||
      (index === list?.length - 1 && !value?.max)
        ? true
        : (value?.min || 0) < (value?.max || 0),
    message: t('区间错误，设置区间上限应该大于区间下限'),
  }
}

export default isInterval
