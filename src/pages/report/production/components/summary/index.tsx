import React, { FC } from 'react'
import { Box } from '@gm-pc/react'
import _ from 'lodash'

import Content from './summary_content'
import PanelHeader from '../../../../production/components/panel_header'
import uiStyle from '../../ui_style'

interface ItemProps {
  name: string
  value: number
  color: string
  numberClassName: string
}

interface SummaryProps {
  isFullScreen: boolean // 从各自store传进来
  data: Array<ItemProps>
  title: string
}

const Summary: FC<SummaryProps> = ({ isFullScreen, data, title }) => {
  return (
    <Box
      hasGap
      style={
        isFullScreen === false
          ? { width: '100%', height: '150px' }
          : uiStyle.getProcessBackgroundColor(isFullScreen)
      }
    >
      <PanelHeader title={title} className='gm-margin-bottom-20' />
      <Content data={data} isFullScreen={isFullScreen} />
    </Box>
  )
}

export default Summary
