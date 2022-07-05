/* eslint-disable no-useless-escape */
// 数学公式格式校验
export default function formulaValidator(formulaInfo: string) {
  let msg = ''
  // 剔除空白符
  formulaInfo = formulaInfo.replace(/\s/g, '')
  // 错误情况，空字符串
  if (formulaInfo === '') {
    msg += '[数学公式不能为空]'
  }
  if (/^[\x\÷\+\-\*\/]/.test(formulaInfo)) {
    msg += '[以运算符开头]'
  }
  // 运算符结尾
  if (/[\x\÷\+\-\*\/]$/.test(formulaInfo)) {
    msg += '[以运算符结尾]'
  }
  // (后面是运算符或者)
  if (/\([\x\÷\+\-\*\/]/.test(formulaInfo)) {
    msg += '[后面是运算符或者]'
  }
  // 运算符连续
  if (/[\x\÷\+\-\*\/]{2,}/.test(formulaInfo)) {
    msg += '[运算符连续]'
  }
  // 空括号
  if (/\(\)/.test(formulaInfo)) {
    msg += '[空括号]'
  }
  // 括号不配对
  const stack = []
  for (let i = 0, item; i < formulaInfo.length; i++) {
    item = formulaInfo.charAt(i)
    if (item === '(') {
      stack.push('(')
    } else if (item === ')') {
      if (stack.length > 0) {
        stack.pop()
      } else {
        stack.push(')')
      }
    }
  }
  if (stack.length !== 0) {
    msg += '[括号不配对]'
  }
  // (后面是运算符
  if (/\([\x\÷\+\-\*\/]/.test(formulaInfo)) {
    msg += '[(后面是运算符]'
  }
  // )前面是运算符
  if (/[\x\÷\+\-\*\/]\)/.test(formulaInfo)) {
    msg += '[)前面是运算符]'
  }
  if (formulaInfo.indexOf('(') !== -1 && formulaInfo.indexOf(')') !== -1) {
    // (前面不是运算符
    if (!/[\x\÷\+\-\*\/]\(/.test(formulaInfo)) {
      if (!/^\(/.test(formulaInfo)) {
        msg += '[(前面不是运算符]'
      }
    }
    // )后面不是运算符
    if (!/\)[\x\÷\+\-\*\/]/.test(formulaInfo)) {
      if (!/\)$/.test(formulaInfo)) {
        msg += '[)后面不是运算符]'
      }
    }
  }
  // 被除数是0
  if (/[\÷\/]0/.test(formulaInfo)) {
    msg += '被除数不能是0'
  }
  // 没有运算符
  //   if (!/[\x\÷\+\-\*\/]/.test(formulaInfo)) {
  //     msg += '没有运算符'
  //   }

  // 价格连续，如 XX价 YY价 + 1
  if (/\}\{/.test(formulaInfo)) {
    msg += '价格连续'
  }
  console.error('公式异常原因：' + msg)

  return msg
}
