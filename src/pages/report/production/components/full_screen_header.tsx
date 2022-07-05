import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import styled from 'styled-components'

import FourCornerBorder from '@/common/components/four_corner_border'
import SVGNext from 'svg/next.svg'

const TimeLabel = styled.span`
  font-size: 16px;
  color: #c0c0c0;
`

const ForScreenButton = styled(Flex)`
  width: 80px;
  height: 30px;
`

interface FullScreenHeaderProps {
  selectTime: string
  onExit: () => void
}
const FullScreenHeader: FC<FullScreenHeaderProps> = ({
  selectTime,
  onExit,
}) => {
  return (
    <Flex
      justifyBetween
      alignCenter
      className='gm-padding-tb-10 gm-padding-lr-20 gm-text-white'
    >
      <Flex alignCenter className='gm-margin-top-10'>
        <span className='gm-margin-lr-10 gm-text-14 gm-text-bold'>
          {t('创建时间:')}
        </span>
        <TimeLabel>{selectTime}</TimeLabel>
      </Flex>
      <Flex onClick={onExit} className='gm-margin-top-10'>
        <FourCornerBorder>
          <ForScreenButton className='gm-cursor' alignCenter justifyCenter>
            {t('退出投屏')}&nbsp;
            <SVGNext />
          </ForScreenButton>
        </FourCornerBorder>
      </Flex>
    </Flex>
  )
}

export default FullScreenHeader
