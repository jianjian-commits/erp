import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
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
    <div
      style={{ backgroundColor: '#F7F8FA' }}
      className='gm-padding-lr-20 gm-padding-tb-20'
    >
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
      <Flex justifyBetween className='gm-margin-top-20 gm-margin-bottom-20'>
        <Flex flex={2} style={{ marginRight: '20px' }}>
          <RankModal
            title={t('车间生产进度排行榜')}
            data={rank_data}
            info={t('进度：车间已完成工序数/车间总工序数')}
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
