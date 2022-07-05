import { t } from 'gm-i18n'
import _ from 'lodash'
import { ValidatorFn } from '../types'

/**
 * 验证所有字段是否已填
 */
const isRequired: ValidatorFn = (params) => {
  const { value, index, list = [] } = params

  const isRequired = [
    {
      action: !_.isNil(value?.type),
      text: t('区间类型必填'),
    },
    /**
     * 第一个公式区间max必填
     * 最后一个公式区间min必填
     * 其他都必填
     */
    {
      action:
        index === 0
          ? !_.isNil(value?.max)
          : index === list.length - 1
          ? !_.isNil(value?.min)
          : !_.isNil(value?.min) || !_.isNil(value?.max),
      text: t('请填写完整区间'),
    },
    {
      action: !_.isNil(value?.formula),
      text: t('公式错误，存在定价公式未填写'),
    },
  ]
  let message = ''

  return {
    isValid: !isRequired.some(({ action, text }) => {
      const boo = action === false
      if (boo) {
        message = text
      }
      return boo
    }),
    message,
  }
}

export default isRequired
