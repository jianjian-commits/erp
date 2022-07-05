import React, { useMemo, useState } from 'react'
import { Steps as AntdSteps, StepsProps } from 'antd'
import { StepProps } from './types'
import {
  StepsDispatcherContext,
  StepsStateContext,
  DispatcherShape,
} from './context'

const { Step } = AntdSteps

const Steps: React.FC<StepsProps> = (props) => {
  const { children, current, ...rest } = props
  const [stepMap, setStepMap] = useState(
    () => new Map<StepProps['stepKey'], StepProps>(),
  )

  const steps = useMemo(() => {
    return Array.from(stepMap.values())
  }, [stepMap])

  const dispatcher = useMemo<DispatcherShape>(() => {
    return {
      add(key, value) {
        setStepMap((rawMap) => {
          const result = new Map(rawMap)
          result.set(key, value)
          return result
        })
      },
    }
  }, [])

  const state = useMemo(() => {
    return { activeKey: steps[current || 0]?.stepKey }
  }, [current, steps])

  return (
    <StepsDispatcherContext.Provider value={dispatcher}>
      <StepsStateContext.Provider value={state}>
        <AntdSteps current={current} {...rest}>
          {steps.map((item) => {
            const { stepKey, ...restItem } = item
            return <Step key={stepKey} {...restItem} />
          })}
        </AntdSteps>
        {children}
      </StepsStateContext.Provider>
    </StepsDispatcherContext.Provider>
  )
}

export default Steps
