import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'

import store from '../store'
import Summary from '../../components/summary'
import RankModal from '../../components/rank_modal'
import SkusSchedule from '../../components/skus_schedule'
import { SummaryPlanConfig, SummaryProcessConfig } from '../../utils'

const ChartPanel = () => {
  const { isFullScreen, rank_data, plan_schedule_data } = store
  const { plan_schedule, process_schedule } = plan_schedule_data

  const summary_plan = _.map(SummaryPlanConfig, (item) => ({
    ...item,
    value: plan_schedule[item.field],
  }))

  const summary_processes = _.map(SummaryProcessConfig, (item) => ({
    ...item,
    value: process_schedule[item.field],
  }))

  return (
    <div style={{ backgroundColor: '#F7F8FA' }} className='gm-padding-20'>
      <Flex justifyBetween>
        <Flex flex={2} style={{ marginRight: '20px' }}>
          <Summary
            title={t('计划进度')}
            data={summary_plan}
            isFullScreen={isFullScreen}
          />
        </Flex>
        <Flex flex={2}>
          <Summary
            title={t('工序进度')}
            data={summary_processes}
            isFullScreen={isFullScreen}
          />
        </Flex>
      </Flex>
      <Flex justifyBetween className='gm-margin-tb-20'>
        <Flex flex={2} className='gm-margin-right-20'>
          <RankModal
            title={t('小组工序生产进度排行榜')}
            data={rank_data}
            info={t('已完成工序任务数/总工序任务数')}
            isFullScreen={isFullScreen}
          />
        </Flex>
        <Flex flex={2}>工序类型进度</Flex>
      </Flex>
      <SkusSchedule
        title={t('商品生产进度')}
        data={rank_data}
        isFullScreen={isFullScreen}
      />
    </div>
  )
}

export default observer(ChartPanel)
