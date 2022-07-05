import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { history } from '@/common/service'
import SvgNext from 'svg/next.svg'
import FourCornerBorder from '@/common/components/four_corner_border'
import moment from 'moment'
import store from '../store'
import globalStore from '@/stores/global'
import { Tab } from '@/pages/sorting/schedule/interface'
import { Filter } from '../interface'

interface FullScreenHeaderProps {
  query: Filter
}

const FullScreenHeader: FC<FullScreenHeaderProps> = ({ query }) => {
  const handleExit = () => {
    history.push(`/sorting/schedule?tab=${Tab.SCHEDULE}`)
  }

  const { stationInfo } = globalStore
  const { receive_date, service_period_id } = query
  const { listServicePeriod } = store
  const targetDate = moment(receive_date).format('YYYY-MM-DD')
  const targetServiceTime = _.find(
    listServicePeriod,
    (s) => s.value === service_period_id,
  )

  return (
    <Flex
      justifyBetween
      alignCenter
      className='gm-padding-tb-10 gm-padding-lr-20'
    >
      <Flex alignCenter>
        <span className='gm-margin-lr-10 gm-text-24 gm-text-bold gm-text-white'>
          {stationInfo.name + t('分拣进度管理')}
        </span>
        <span
          style={{
            fontSize: '16px',
            color: '#C0C0C0',
          }}
        >
          {targetDate}&nbsp;(
          {targetServiceTime ? targetServiceTime.text : '-'})
        </span>
      </Flex>
      <Flex onClick={handleExit} width='80px' height='30px'>
        <FourCornerBorder>
          <Flex
            style={{
              width: '80px',
              height: '30px',
            }}
            className='gm-cursor b-sorting-full-screen-button'
            alignCenter
            justifyCenter
          >
            {t('退出投屏')}&nbsp;
            <SvgNext />
          </Flex>
        </FourCornerBorder>
      </Flex>
    </Flex>
  )
}

export default observer(FullScreenHeader)
