import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import scheduleStore from '../store'
import Big from 'big.js'

import schedulePieEChartsHoc from '@/common/components/customize_echarts/schedule_pie_echarts_hoc'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'

const SchedulePieECharts = schedulePieEChartsHoc(BaseECharts)

const OrderSchedulePie = observer(
  class OrderSchedulePie extends React.Component {
    render() {
      const { isFullScreen, orderSortingInfo } = scheduleStore

      const eChartsData = [
        {
          finished: orderSortingInfo.finished,
          total: orderSortingInfo.total,
          name: '整体进度',
        },
      ]

      return (
        <>
          {/* 组件用法 */}
          <SchedulePieECharts
            data={eChartsData}
            itemFieldName={{
              finishedFieldName: 'finished',
              totalFieldName: 'total',
              titleFieldName: 'name',
            }}
            showLegend
            showText={{
              finishedText: '已完成订单数',
              unFinishedText: '未完成订单数',
            }}
            // radiusList={[113, 143]}
            radiusList={['70%', '90%']}
            titlePosition={{ bottom: '20' }}
            style={{ width: '100%', height: '100%', marginRight: '4%' }}
            isGradualChange={isFullScreen}
            onFormatLabel={[
              `{percent|${
                eChartsData[0].finished
                  ? Big(eChartsData[0].finished)
                      .div(eChartsData[0].total)
                      .times(100)
                      .toFixed(2) + '%'
                  : '0%'
              }}`,
              `{text|${i18next.t('已完成订单')}}`,
            ]}
            labelFormatStyle={{
              percent: {
                fontSize: 42,
                fontWeight: 'bold',
                color: '#007eff',
              },
              text: {
                fontSize: 16,
                color: '#007eff',
              },
            }}
            className='gm-padding-top-20'
          />
        </>
      )
    }
  },
)

export default OrderSchedulePie
