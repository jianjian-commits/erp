import React, { useEffect, useRef } from 'react'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import ScheduleStatistics from '@/pages/sorting/schedule/sorter_process/components/schedule_statistics'
import CategorySchedule from '@/pages/sorting/schedule/sorter_process/components/category_schedule'
import SortingData from '@/pages/sorting/schedule/sorter_process/components/sorting_data'
import OrderSchedule from '@/pages/sorting/schedule/sorter_process/components/order_schedule'
import FullScreenHeader from '@/pages/sorting/schedule/sorter_process/components/full_screen_header'
import MerchandiseSchedule from '@/pages/sorting/schedule/sorter_process/components/merchandise_schedule'
import scheduleStore from '@/pages/sorting/schedule/sorter_process/store'
import { useGMLocation } from '@gm-common/router'

import './style.less'
import { Filter } from '../sorter_process/interface'

const SortingScheduleFullScreen = () => {
  const location = useGMLocation<Filter>()

  useEffect(() => {
    scheduleStore.setFullScreen(true)
    scheduleStore.fetchServicePeriod()
    return () => {
      scheduleStore.setFullScreen(false)
    }
  }, [])

  const param = location.query ? location.query : scheduleStore.filter
  return (
    <div
      style={{
        color: '#56A3F2',
        minHeight: '1080px',
        fontWeight: 'bold',
      }}
      className='b-full-screen-background gm-padding-bottom-20'
    >
      <FullScreenHeader query={param} />
      <div className='gm-margin-lr-20'>
        <Flex justifyBetween>
          <Flex flex={3} style={{ marginRight: '10px' }}>
            <ScheduleStatistics /> {/* 整体进度 */}
          </Flex>
          <Flex flex={2}>
            <SortingData /> {/* 分拣数据 */}ƒ
          </Flex>
        </Flex>
        <div className='gm-padding-5' />
        <Flex justifyBetween flex>
          <OrderSchedule /> {/* 订单进度 */}
          <div className='gm-padding-5' />
          <CategorySchedule /> {/* 分类进度 */}
        </Flex>
        <div className='gm-padding-5' />
        <MerchandiseSchedule />
      </div>
    </div>
  )
}

export default observer(SortingScheduleFullScreen)
