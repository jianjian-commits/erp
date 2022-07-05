import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import OrderSchedulePie from './order_schedule_pie'
import OrderScheduleList from './order_schedule_list'
import { Box, Flex } from '@gm-pc/react'
import scheduleStore from '../store'
import uiStyle from '../utils/ui_style'
import PurchaseOverviewTitle from '@/pages/sorting/components/purchase_overview_title'
import FourCornerBorder from '@/pages/sorting/components/four_corner_border'

import { Tab } from '@/pages/sorting/detail/index.page'

const OrderSchedule = () => {
  const contentComponent = () => {
    const { isFullScreen } = scheduleStore

    return (
      <Box
        style={uiStyle.getQuickPanelStyle(isFullScreen)}
        className='gm-padding-tb-10 gm-padding-lr-20'
      >
        <PurchaseOverviewTitle
          title={t('订单分拣进度')}
          type={!isFullScreen ? 'more' : 'fullScreen'}
          linkText={t('查看更多')}
          linkRoute={`/sorting/detail?tab=${Tab.ORDER}`}
        />
        <Flex style={{ height: '490px' }}>
          <Flex flex={4.5}>
            <OrderSchedulePie />
          </Flex>
          <OrderScheduleList />
        </Flex>
      </Box>
    )
  }

  const { isFullScreen } = scheduleStore
  return isFullScreen ? (
    <FourCornerBorder>{contentComponent()}</FourCornerBorder>
  ) : (
    contentComponent()
  )
}

export default observer(OrderSchedule)
