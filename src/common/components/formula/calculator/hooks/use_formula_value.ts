import { useMemo } from 'react'
import _ from 'lodash'
import { useControllableValue } from '@/common/hooks'
import useWords from './use_words'
import { CalcBtnConfig } from '../types'
interface FormulaValueOptions {
  value?: string
  defaultValue?: string
  onChange?(value: string): void
}

/**
 * 前置概念：
 * 文本内显示的称为：formulaDesc（仅做展示，可供人类阅读）
 * 后端存储的称为：formula (真正有效的值)
 * 拿到 formula 解析为数组，数组中的每一项被称为：word
 */
function useFormulaValue(options: FormulaValueOptions) {
  const [formula, setFormula] = useControllableValue<string>(options)

  const {
    words,
    insetWord,
    deleteWord,
    getRealCursorPosition,
    getCursorPositionSibling,
  } = useWords(formula)
  const formulaDesc = useMemo(() => {
    return _.map(words, (item) => item.textBoxValue).join('')
  }, [words])

  const insetValue = (val: CalcBtnConfig, cursorPosition?: number) => {
    const newFormula = insetWord(val, cursorPosition)
      .map((item) => item.value)
      .join('')
    setFormula(newFormula)
  }

  /**
   * 返回被删除的 words 长度
   */
  const backspace = (cursorPosition?: number) => {
    const { newWords, deletedWords } = deleteWord(cursorPosition)
    const newFormula = newWords.map((item) => item.value).join('')
    setFormula(newFormula)
    return _.reduce(
      deletedWords,
      (res, next) => res + _.size(next.textBoxValue),
      0,
    )
  }

  const clear = () => setFormula('')

  return {
    formulaDesc,
    insetValue,
    clear,
    backspace,
    getRealCursorPosition,
    getCursorPositionSibling,
  }
}

export default useFormulaValue
