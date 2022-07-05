import React, { FC } from 'react'
import { Box, Flex, ProgressCircle } from '@gm-pc/react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import PanelHeader from '../../../production/components/panel_header'
import uiStyle from '../ui_style'

// 数据格式未定
interface Item {
  // text: string
  // value: number
  name: string
  percentage: number
}

interface SkusScheduleProps {
  title: string
  data: Array<Item>
  isFullScreen: boolean
}

const SkusSchedule: FC<SkusScheduleProps> = ({ title, data, isFullScreen }) => {
  return (
    <Box hasGap style={uiStyle.getGoodsBackgroundColor(isFullScreen)}>
      <PanelHeader
        title={title}
        className='gm-margin-bottom-20'
        info={t('商品已完成数/商品计划生产数')}
      />
      <Flex justifyAround alignCenter wrap>
        {_.map(data, (item, index) => (
          <Flex alignCenter column key={index}>
            <ProgressCircle
              percentage={item.percentage}
              size={100}
              lineWidth={20}
            />
            <div>{t(`${item.name}`)}</div>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
export default SkusSchedule
