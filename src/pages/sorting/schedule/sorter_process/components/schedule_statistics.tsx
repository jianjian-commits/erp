import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Box, Flex } from '@gm-pc/react'
import scheduleStore from '../store'
import uiStyle from '../utils/ui_style'
import _ from 'lodash'
import CommonVerticalLayout from '@/pages/sorting/components/common_vertical_layout'
import FourCornerBorder from '@/pages/sorting/components/four_corner_border'

interface ScheduleStatisticsProcess {
  name: string
  value: number // 数字
  color: string
  numberClassName: string
}

const ScheduleStatistics = observer(
  class ScheduleStatistics extends React.Component {
    contentComponet = (process: Array<ScheduleStatisticsProcess>) => {
      const { isFullScreen } = scheduleStore
      return (
        <Flex
          style={{
            height: uiStyle.getStatisticsHeight(isFullScreen),
          }}
        >
          {_.map(process, (item, i) => (
            <Flex flex={process.length} alignCenter key={i}>
              <CommonVerticalLayout
                name={item.name}
                value={item.value}
                color={item.color}
                key={i}
                numberClassName={isFullScreen ? item.numberClassName : null}
              />
              {i === 0 ? (
                <span
                  style={{
                    height: '32px',
                    border: uiStyle.getStatisticsBorder(isFullScreen),
                  }}
                />
              ) : null}
            </Flex>
          ))}
        </Flex>
      )
    }

    render() {
      const { isFullScreen, totalInfo } = scheduleStore
      const process = [
        {
          name: t('总任务数'),
          value: totalInfo.total_count,
          color: '#2993FF',
          numberClassName: 'b-full-screen-gradient-color-blue',
        },
        {
          name: t('已完成任务数'),
          value: totalInfo.out_stock_count + totalInfo.weight_count,
          color: '#2993FF',
          numberClassName: 'b-full-screen-gradient-color-blue',
        },
        {
          name: t('未完成任务数'),
          value: totalInfo.unweight_count,
          color: '#FFBB00',
          numberClassName: 'b-full-screen-gradient-color-yellow',
        },
      ]

      const style = {
        background: uiStyle.getStatisticsBackgroundColor(
          scheduleStore.isFullScreen,
        ),
        width: '100%',
      }

      return (
        <Box style={style}>
          {isFullScreen ? (
            <FourCornerBorder>{this.contentComponet(process)}</FourCornerBorder>
          ) : (
            this.contentComponet(process)
          )}
        </Box>
      )
    }
  },
)

export default ScheduleStatistics
