import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  ReactNode,
} from 'react'
import _ from 'lodash'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'
import './style.less'

interface Step {
  text: string
  value: string
  children: ReactNode
}

interface StepsProps {
  steps: Step[]
  defaultActive?: string
}

interface StepApi {
  setSelected(v: string): void
}

const Steps = forwardRef<StepApi, StepsProps>(
  ({ steps, defaultActive }, ref) => {
    const [active, setActive] = useState(defaultActive || steps[0].value)

    useImperativeHandle(
      ref,
      () => {
        return {
          setSelected: (value: string) => {
            const target = _.find(steps, (tab) => tab.value === value)
            if (!target) throw Error('no item')
            setActive(value)
          },
        }
      },
      [steps],
    )

    const stepsChildren = () => {
      const item = _.find(steps, (tab) => tab.value === active)
      return <>{item && item.children}</>
    }
    return (
      <Flex flex column>
        <Flex row className='b-customize-step-header'>
          {_.map(steps, (v, i) => (
            <Flex flex>
              <Flex
                flex
                alignCenter
                justifyCenter
                className={classNames('b-customize-step-header-step', {
                  active: active === v.value,
                })}
              >
                {v.text}
              </Flex>
              {i !== steps.length - 1 && (
                <div
                  className={classNames('b-customize-step-header-triangle', {
                    active: active === v.value,
                  })}
                />
              )}
            </Flex>
          ))}
        </Flex>
        <Flex flex column>
          {stepsChildren()}
        </Flex>
      </Flex>
    )
  },
)

export default Steps
