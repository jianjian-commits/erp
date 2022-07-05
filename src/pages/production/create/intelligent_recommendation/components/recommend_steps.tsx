import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'

interface RecommendStepsProps {
  activeStep: number
}

const RecommendSteps: FC<RecommendStepsProps> = ({ activeStep }) => {
  return (
    <Flex row className='b-recommend-plan-header'>
      <Flex
        flex={1}
        alignCenter
        justifyCenter
        className={classNames('b-recommend-plan-header-first-step', {
          active: activeStep === 1,
        })}
      >
        {t('第一步：选择智能推荐算法与配置')}
      </Flex>
      <div
        className={classNames('b-recommend-plan-header-triangle', {
          'first-active': activeStep === 1,
          'second-active': activeStep === 2,
        })}
      />
      <Flex
        flex={1}
        alignCenter
        justifyCenter
        className={classNames('b-recommend-plan-header-second-step', {
          active: activeStep === 2,
        })}
      >
        {t('第二步：查看结果并加入生产计划')}
      </Flex>
    </Flex>
  )
}

export default RecommendSteps
