import parse from './parse_formula'

/**
 * 将公式格式化为可阅读的文字（替换公式中的公式占位符）
 */
export default function formatFormula(value?: string) {
  return parse(value)
    .map((item) => item.textBoxValue)
    .join('')
}
