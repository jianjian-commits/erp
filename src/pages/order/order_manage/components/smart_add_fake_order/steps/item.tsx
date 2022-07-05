import React, { useEffect, useState } from 'react'
import { useMount } from 'react-use'
import { useStepsContext } from './context'
import { StepProps } from 'antd'

interface Props extends StepProps {
  stepKey: string
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
  /** 可销毁 */
  destructible?: boolean
}

const Steps: React.FC<Props> = (props) => {
  const {
    children,
    stepKey,
    wrapperClassName,
    wrapperStyle,
    destructible = false,
    ...rest
  } = props

  const [{ activeKey }, { add }] = useStepsContext()
  const [render, setRender] = useState(false)
  const isActive = activeKey === stepKey

  useMount(() => {
    add(stepKey, {
      stepKey,
      ...rest,
    })
  })

  useEffect(() => {
    if (isActive) {
      setRender(true)
    }
  }, [isActive])

  if (!render || (destructible && !isActive)) {
    return null
  }

  return (
    <div
      className={wrapperClassName}
      style={{ ...wrapperStyle, display: isActive ? undefined : 'none' }}
    >
      {children}
    </div>
  )
}

export default Steps
