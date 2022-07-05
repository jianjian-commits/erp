import { t } from 'gm-i18n'
import React, { CSSProperties } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Flex, Box } from '@gm-pc/react'
import scheduleStore from '../store'
import uiStyle from '../utils/ui_style'
import CommonVerticalLayout from '@/pages/sorting/components/common_vertical_layout'
import FourCornerBorder from '@/pages/sorting/components/four_corner_border'

interface SortingDataProps {
  name: string
  value: number
  color: string
  numberClassName: string
}

const SortingData = observer(
  class SortingData extends React.Component {
    contentComponent = (sortDataList: Array<SortingDataProps>) => {
      return (
        <Flex
          style={{
            height: uiStyle.getStatisticsHeight(scheduleStore.isFullScreen),
          }}
        >
          {_.map(sortDataList, (item, i) => (
            // 已抽取 ScheduleSummary 在common中，可直接用
            <CommonVerticalLayout
              name={item.name}
              value={item.value}
              color={item.color}
              key={i}
              numberClassName={
                scheduleStore.isFullScreen ? item.numberClassName : null
              }
            />
          ))}
        </Flex>
      )
    }

    render() {
      const { weightInfo } = scheduleStore
      const style: CSSProperties = {
        background: uiStyle.getStatisticsBackgroundColor(
          scheduleStore.isFullScreen,
        ),
        width: '100%',
      }
      if (scheduleStore.isFullScreen) {
        style.border = 'none'
      }

      const sortDataList = [
        {
          name: t('计重任务数'),
          value: weightInfo.weight_task_count,
          color: '#515D74',
          numberClassName: 'b-full-screen-gradient-color-blue',
        },
        {
          name: t('不计重任务数'),
          value: weightInfo.unweight_task_count,
          color: '#515D74',
          numberClassName: 'b-full-screen-gradient-color-blue',
        },
        {
          name: t('商品种类数'),
          value: weightInfo.ssu_count,
          color: '#515D74',
          numberClassName: 'b-full-screen-gradient-color-blue',
        },
        {
          name: t('商户数'),
          value: weightInfo.customer_count,
          color: '#515D74',
          numberClassName: 'b-full-screen-gradient-color-blue',
        },
      ]

      return (
        <Box style={style}>
          {scheduleStore.isFullScreen ? (
            <FourCornerBorder>
              {this.contentComponent(sortDataList)}
            </FourCornerBorder>
          ) : (
            this.contentComponent(sortDataList)
          )}
        </Box>
      )
    }
  },
)

export default SortingData
