import React, { FC } from 'react'
import { Box, Flex, Progress } from '@gm-pc/react'
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

interface RandModalProps {
  title: string
  data: Array<Item>
  info: string
  isFullScreen: boolean
}

const RandModal: FC<RandModalProps> = ({ title, data, info, isFullScreen }) => {
  // TODO 每隔8s切换数据

  return (
    <Box hasGap style={uiStyle.getRankBackgroundColor(isFullScreen)}>
      <PanelHeader title={title} info={info} />
      <Flex column justifyCenter alignCenter className='gm-padding-20'>
        {_.map(data, (item, index) => (
          <Flex alignCenter key={index} style={{ width: '100%' }}>
            <div className='gm-margin-right-20'>{t(`${item.name}`)}</div>
            <div style={{ width: '80%' }}>
              <Progress
                percentage={item.percentage}
                style={{ height: '50px' }}
              />
            </div>
          </Flex>
        ))}
      </Flex>
    </Box>
  )
}
export default RandModal
