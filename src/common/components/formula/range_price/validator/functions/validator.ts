import { formularValidator } from '@/common/components/formula/calculator'
import { ValidatorFn } from '@/common/components/formula/range_price/validator/types'
import { Formula_Is_Valid } from '@/pages/merchandise/enum'

const isValid: ValidatorFn = (params) => {
  const { value } = params

  let status = Formula_Is_Valid.VALID
  if (value?.formula && formularValidator(value?.formula).length) {
    status = Formula_Is_Valid.INVALID
  }

  return {
    isValid: status === Formula_Is_Valid.VALID,
    message:
      status === Formula_Is_Valid.VALID ? '' : '不合法的公式，请重新输入',
  }
}

export default isValid
