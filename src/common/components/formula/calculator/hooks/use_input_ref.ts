import _ from 'lodash'
import { useCallback, useRef } from 'react'

function setInputFocus(el: HTMLInputElement) {
  el.focus()
}

function setInputSelectionRange(
  el: HTMLInputElement,
  start: number,
  end?: number | null,
) {
  el.setSelectionRange(start, _.isFinite(end) ? (end as number) : start)
}

export default function useInputRef() {
  const node = useRef<HTMLInputElement | null>(null)

  const getNode = useCallback((fn: (el: HTMLInputElement) => void) => {
    if (!node.current) {
      return
    }
    fn(node.current)
  }, [])

  /** 设置 input 聚焦 */
  const focus = useCallback(() => {
    getNode(setInputFocus)
  }, [getNode])

  /** 获取光标位置 */
  const getCursorPosition = useCallback(() => {
    if (!node.current) {
      return 0
    }
    const result = node.current.selectionEnd
    return _.isNil(result) ? _.size(node.current.value) : result
  }, [])

  /** 设置光标位置 */
  const setCursorPosition = useCallback(
    (index: number) => {
      getNode((el) => {
        /**
         * 如果 input 已经处于 focus 状态，
         * 那么设置光标位置后，input 内容不会自动滚动到光标处。
         *
         * 所以，将 input 失焦一次后再设置即可。
         */
        el.blur()
        setInputSelectionRange(el, index)
        setInputFocus(el)
      })
    },
    [getNode],
  )

  /** 设置光标位置为最后 */
  const setCursor2End = useCallback(() => {
    getNode((el) => {
      setInputSelectionRange(el, el.value.length)
      setInputFocus(el)
    })
  }, [getNode])

  return {
    inputRef: node,
    setFocus: focus,
    setCursorPosition,
    setCursor2End,
    getCursorPosition,
  }
}
