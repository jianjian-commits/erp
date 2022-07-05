import React, { useState, useEffect } from 'react'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import scheduleStore from '../store'
import uiStyle from '../utils/ui_style'

// import CommonEmptySvg from '../../common/common_empty_svg'
import scheduleBarEChartsHoc from '@/common/components/customize_echarts/schedule_bar_echarts_hoc'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'

import SvgRefresh from '@/svg/refresh.svg'
import Empty from './empty'

const ScheduleBarECharts = scheduleBarEChartsHoc(BaseECharts)

function shuffle7(list: any[]) {
  return _.shuffle(list).slice(0, 7)
}

const ScheduleBar = observer(() => {
  const { orderSortingInfo } = scheduleStore
  const [orders, setOrders] = useState(() => {
    return shuffle7(orderSortingInfo.orders)
  })

  useEffect(() => {
    setOrders(shuffle7(orderSortingInfo.orders))
  }, [orderSortingInfo.orders])

  return (
    <Flex
      column
      justifyCenter
      className='gm-padding-20'
      key={new Date().getTime()}
      style={{
        height: '100%',
        backgroundColor: uiStyle.getMerchandiseBackgroundColor(
          scheduleStore.isFullScreen,
        ),
        border: scheduleStore.isFullScreen
          ? '1px solid rgba(44, 106, 178, .5)'
          : null,
      }}
    >
      {orders.length === 7 && !scheduleStore.isFullScreen && (
        <Flex
          justifyEnd
          className='gm-cursor gm-text-primary'
          onClick={() => {
            setOrders(shuffle7(orderSortingInfo.orders))
          }}
        >
          <span className='gm-margin-lr-5'>
            <SvgRefresh />
          </span>
          {t('换一批')}
        </Flex>
      )}
      {_.map(orders.slice(), (order, index) => {
        return (
          <ScheduleBarECharts
            key={`${index}scheduleBar`}
            style={{ width: '100%', height: '40px' }}
            data={order}
            itemFieldName={{
              finishedFieldName: 'finished',
              totalFieldName: 'total',
              labelFieldName: 'id',
            }}
            axisLabelFormatFunc={() => {
              const str = order.name + '/' + order.order_id
              return str.length > 20 ? str.substr(0, 20) + '...' : str
            }}
            showText={{
              finishedText: '已完成任务',
              unFinishedText: '未完成任务',
            }}
            customOption={{
              barWidth: scheduleStore.isFullScreen ? '16px' : '20px',
            }}
            isGradualChange={scheduleStore.isFullScreen}
            onSetCustomOption={(option) => {
              return {
                ...option,
                grid: {
                  ...option.grid,
                  left: '50%',
                  right: '0%',
                },
              }
            }}
          />
        )
      })}
    </Flex>
  )
})

const OrderScheduleList = observer(
  class OrderScheduleList extends React.Component {
    render() {
      const orders = scheduleStore.orderSortingInfo.orders
      const hasNoData = orders.length === 0
      return (
        <Flex flex={5.5} column style={{ height: '490px' }}>
          <div
            style={{
              marginTop: '60px',
              height: '370px',
              borderRadius: '10',
            }}
          >
            {hasNoData ? (
              <Empty
                text={t('没有更多数据了')}
                isFullScreen={scheduleStore.isFullScreen}
                style={{
                  height: '100%',
                  backgroundColor: uiStyle.getMerchandiseBackgroundColor(
                    scheduleStore.isFullScreen,
                  ),
                }}
              />
            ) : (
              <ScheduleBar />
            )}
          </div>
          {!hasNoData && (
            <Flex alignCenter justifyCenter className='gm-margin-top-20'>
              {t('商户明细进度')}
            </Flex>
          )}
        </Flex>
      )
    }
  },
)

export default OrderScheduleList
