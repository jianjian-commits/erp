import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'

import ScheduleSummary from './schedule_summary'
import uiStyle from '../../ui_style'

interface ItemProps {
  name: string
  value: number
  color: string
  numberClassName: string
}

interface SummaryContentProps {
  data: Array<ItemProps>
  isFullScreen: boolean // 从各自store传进来
}

const SummaryContent: FC<SummaryContentProps> = ({ data, isFullScreen }) => {
  return (
    <Flex flex={data.length}>
      {_.map(data, (item, i) => (
        <Flex flex={data.length} alignCenter key={i}>
          <ScheduleSummary
            name={item.name}
            color={item.color}
            value={item.value}
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

export default observer(SummaryContent)
