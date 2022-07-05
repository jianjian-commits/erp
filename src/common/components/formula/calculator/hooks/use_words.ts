import { useEffect, useRef, useState } from 'react'
import { CalcBtnConfig } from '../types'
import { useIsomorphicLayoutEffect, useLatest } from 'react-use'
import parse from '../utils/parse_formula'
import _ from 'lodash'

interface WordSibling {
  /** 当前 word 所在 formulaDesc 中的索引 */
  breforeSize: number
  /** 当前 word 的文字长度 */
  size: number
  /** 当前 word 所在 formulaDesc 中的索引（包含当前 word） */
  afterSize: number
  /** 当前 word 所在 words 中的索引 */
  wordIndex: number
  /** word 对象 */
  word?: CalcBtnConfig
}

function useWords(formula?: string) {
  const [words, setWords] = useState<CalcBtnConfig[]>([])
  const currentWords = useLatest(words)

  useIsomorphicLayoutEffect(() => {
    setWords(parse(formula))
  }, [formula])

  const length = useRef<number[]>([])
  useEffect(() => {
    length.current = words.map((item) => item.textBoxValue.length)
  }, [words])

  /**
   * 兼容光标位置为 falsy 的情况，index 为 falsy 时则返回文本框内容长度
   */
  const getTruthyIndex = (index?: number) => {
    const result = _.isFinite(index)
      ? (index as number)
      : length.current.reduce((res, next) => res + next, 0)
    return result
  }

  /**
   * 根据光标获取前后两个 word
   */
  const getCursorPositionSibling = (index?: number) => {
    const truthyIndex = getTruthyIndex(index)
    const isZero = truthyIndex === 0
    const prev: WordSibling = {
      size: 0,
      breforeSize: 0,
      afterSize: 0,
      wordIndex: 0,
    }
    const next: WordSibling = {
      size: 0,
      breforeSize: 0,
      afterSize: 0,
      wordIndex: 0,
    }
    let count = 0
    length.current.some((item, i) => {
      count += item
      if (count >= truthyIndex) {
        if (!isZero) {
          prev.word = currentWords.current[i]
          prev.size = _.size(prev.word?.textBoxValue)
          prev.breforeSize = count - item
          prev.afterSize = count
          prev.wordIndex = i
        }
        next.word = currentWords.current[isZero ? 0 : i + 1]
        next.size = _.size(next.word?.textBoxValue)
        next.breforeSize = truthyIndex
        next.afterSize = truthyIndex + next.size
        next.wordIndex = isZero ? 0 : i + 1
        return true
      }
      return false
    })
    return {
      // 当前光标的上一个 word
      prev,
      // 当前光标的下一个 word
      next,
      // 计算后光标应当所在的位置
      realCursorPosition: count,
    }
  }

  /**
   * 删除（Backspace）
   * @param index 当前光标位置
   */
  const deleteWord = (index?: number) => {
    // 光标位于 0 下标时，不处理
    if (index === 0) {
      return { newWords: currentWords.current, deletedWords: [] }
    }
    const newWords = currentWords.current.slice()
    const deletedWords = newWords.splice(
      Math.max(getCursorPositionSibling(index).prev.wordIndex, 0),
      1,
    )
    setWords(newWords)
    return { newWords, deletedWords }
  }

  /** 插入 word */
  const insetWord = (val: CalcBtnConfig, cursorPosition?: number) => {
    const newWords = currentWords.current.slice()
    const isZero = cursorPosition === 0

    const index = isZero
      ? 0
      : getCursorPositionSibling(cursorPosition).prev.wordIndex + 1
    newWords.splice(index, 0, val)
    setWords(newWords)
    return newWords
  }

  /**
   * 鼠标点击文本框聚焦时，应该计算正确的光标位置，防止光标位于公式变量中
   */
  const getRealCursorPosition = (index?: number) => {
    return getCursorPositionSibling(index ?? undefined).realCursorPosition
  }

  return {
    words,
    insetWord,
    deleteWord,
    getRealCursorPosition,
    getTruthyIndex,
    getCursorPositionSibling,
  }
}

export default useWords
