import { t } from 'gm-i18n'
import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'

import store from '../store'
import { history } from '@/common/service'
import FourCornerBorder from '@/common/components/four_corner_border'
import RankModal from '../../components/rank_modal'
import FullScreenHeader from '../../components/full_screen_header'
import SkusSchedule from '../../components/skus_schedule'
import Summary from '../../components/summary'
import { SummaryPlanConfig, SummaryProcessConfig } from '../../utils'

const FullScreen = () => {
  const { isFullScreen, rank_data, plan_schedule_data } = store
  const { plan_schedule, process_schedule } = plan_schedule_data

  useEffect(() => {
    // 每8s更新一下数据
  }, [])

  const summary_plan = _.map(SummaryPlanConfig, (item) => ({
    ...item,
    value: plan_schedule[item.field],
  }))

  const summary_processes = _.map(SummaryProcessConfig, (item) => ({
    ...item,
    value: process_schedule[item.field],
  }))

  const handleExitFullScreen = () => {
    store.setFullScreen(false)
    history.push('/report/production/pack_schedule')
  }

  return (
    <div className='b-schedule-full-screen gm-padding-lr-20'>
      <FullScreenHeader
        selectTime='2020-10-12 12:20:30'
        onExit={handleExitFullScreen}
      />
      <Flex justifyBetween style={{ marginTop: '50px' }}>
        <Flex flex={2} className='gm-margin-right-20'>
          <FourCornerBorder>
            <Summary
              title={t('计划进度')}
              data={summary_plan}
              isFullScreen={isFullScreen}
            />
          </FourCornerBorder>
        </Flex>
        <Flex flex={2}>
          <FourCornerBorder>
            <Summary
              title={t('工序进度')}
              data={summary_processes}
              isFullScreen={isFullScreen}
            />
          </FourCornerBorder>
        </Flex>
      </Flex>
      <Flex justifyBetween className='gm-margin-tb-20'>
        <Flex flex={2} className='gm-margin-right-20'>
          <FourCornerBorder>
            <RankModal
              title={t('车间生产进度排行榜')}
              data={rank_data}
              info={t('进度：车间已完成工序数/车间总工序数')}
              isFullScreen={isFullScreen}
            />
          </FourCornerBorder>
        </Flex>
        <Flex flex={2}>
          <FourCornerBorder>
            <RankModal
              title={t('工序类型进度')}
              data={rank_data}
              info={t('进度：车间已完成工序数/车间总工序数')}
              isFullScreen={isFullScreen}
            />
          </FourCornerBorder>
        </Flex>
      </Flex>
      <FourCornerBorder>
        <SkusSchedule
          title={t('商品生产进度')}
          data={rank_data}
          isFullScreen={isFullScreen}
        />
      </FourCornerBorder>
    </div>
  )
}

export default observer(FullScreen)
