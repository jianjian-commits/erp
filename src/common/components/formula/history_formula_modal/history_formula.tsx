import _ from 'lodash'
import React, {
  forwardRef,
  ReactElement,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { TableData } from './types'
import Modal from './modal'
import { devWarn } from '@gm-common/tool'

interface HistoryFormulaProps {
  /**
   * 点击确定按钮时触发，参数为已选择的数据的 id
   */
  onChange?: (data: TableData) => void
  children?: ReactNode
}

export interface HistoryFormulaRef {
  /**
   * 打开弹窗
   */
  open: () => void
  /**
   * 关闭弹窗
   */
  close: () => void
}

/**
 * 历史公式弹窗
 *
 * 该组件只需要一个子节点，且子节点需要能够正常处理 onClick 事件，以便弹窗能够正常打开。
 *
 * @example
 * ```tsx
 * <HistoryFormula>
 *   <button type="button">选择历史公式</button> // button 元素能够正常处理 onClick，它被点击时，便能打开弹窗
 * </HistoryFormula>
 * ```
 */
const HistoryFormula = forwardRef<HistoryFormulaRef, HistoryFormulaProps>(
  (props, ref) => {
    const { children, onChange } = props
    const [visible, setVisible] = useState(false)

    const methods = useMemo(() => {
      return {
        open() {
          setVisible(true)
        },
        close() {
          setVisible(false)
        },
      }
    }, [])

    useImperativeHandle(ref, () => methods, [methods])

    const node = useMemo(() => {
      try {
        const element = React.Children.only(children) as ReactElement
        return React.cloneElement(element, {
          onClick: (...rest: unknown[]) => {
            setVisible(true)
            if (_.isFunction(element?.props?.onClick)) {
              element.props.onClick(...rest)
            }
          },
        })
      } catch (error) {
        devWarn(() => {
          console.error(
            '<HistoryFormula /> 需要一个子元素，且子元素能够接受 onClick 事件',
          )
        })
        return null
      }
    }, [children])

    return (
      <>
        {node}
        <Modal visible={visible} onClose={methods.close} onChange={onChange} />
      </>
    )
  },
)

HistoryFormula.displayName = 'HistoryFormula'

export default HistoryFormula
