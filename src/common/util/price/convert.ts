/*
 * @Description:不确定或公共的transform util放这里
 */
import Big from 'big.js'
import _ from 'lodash'
/**
 * @description: 加数字转化为对应的大写金额
 * @param {number} n 金额数
 * @return {string} 输入数字对应的大写金额
 */
export const coverDigit2Uppercase = (n: number): string => {
  if (_.isNil(n) || _.isNaN(n)) {
    return '-'
  }

  const fraction = ['角', '分']

  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']

  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]

  const head = n < 0 ? '欠' : ''

  n = Math.abs(n)

  let left = ''
  let right = ''
  let i = 0
  for (i; i < fraction.length; i++) {
    right +=
      digit[
        Math.floor(
          // @ts-ignore
          Big(n)
            .times(Big(10).pow(i + 1))
            .mod(10)
            .toString(),
        )
      ] + fraction[i]
  }

  right = right.replace(/(零分)/, '整').replace(/(零角整)/, '') || '整'

  n = Math.floor(n)

  for (i = 0; i < unit[0].length && n > 0; i++) {
    let p = ''
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p
      n = Math.floor(n / 10)
    }
    left = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + left
  }

  return (
    head +
    (left.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零') + right).replace(
      /^整$/,
      '零元整',
    )
  )
}
