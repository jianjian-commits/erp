import React from 'react'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import Filter from './components/search_filter'
import CategorySchedule from './components/category_schedule'
import ScheduleStatistics from './components/schedule_statistics'
import SortingData from './components/sorting_data'
import OrderSchedule from './components/order_schedule'

import MerchandiseSchedule from './components/merchandise_schedule'
import scheduleStore from './store'
import { useAsync } from '@gm-common/hooks'

const SortingSchedule = () => {
  const { run } = useAsync(scheduleStore.fetchDate, {
    manual: true,
  })

  return (
    <>
      <Filter onSearch={run} />
      <div
        style={{ backgroundColor: '#F7F8FA' }}
        className='gm-padding-lr-20 gm-padding-tb-10'
      >
        <Flex justifyBetween>
          <Flex flex={3} style={{ marginRight: '10px' }}>
            <ScheduleStatistics /> {/* 整体进度 */}
          </Flex>
          <Flex flex={2}>
            <SortingData /> {/* 分拣数据 */}
          </Flex>
        </Flex>
        <div className='gm-padding-5' />
        <Flex justifyBetween flex>
          <OrderSchedule /> {/* 订单进度 */}
          <div className='gm-padding-5' />
          <CategorySchedule /> {/* 分类进度 */}
        </Flex>
        <div className='gm-padding-5' />
        <MerchandiseSchedule /> {/* 商品进度 */}
      </div>
    </>
  )
}

export default observer(SortingSchedule)
