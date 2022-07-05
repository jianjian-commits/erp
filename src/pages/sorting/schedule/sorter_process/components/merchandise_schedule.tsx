import React, { useState, FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Flex, Box } from '@gm-pc/react'

import scheduleStore from '../store'
import uiStyle from '../utils/ui_style'
import PurchaseOverviewTitle from './purchase_overview_title'
import SvgRefresh from '@/svg/refresh.svg'
import FourCornerBorder from '@/common/components/four_corner_border'
import schedulePieEChartsHoc from '@/common/components/customize_echarts/schedule_pie_echarts_hoc'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'
import { Tab } from '@/pages/sorting/detail/index.page'
import Empty from './empty'
import { SsuSortingInfo } from '../interface'

const SchedulePieECharts = schedulePieEChartsHoc(BaseECharts)

const SchedulePie: FC<{
  data: SsuSortingInfo[]
}> = observer(({ data }) => {
  const { isFullScreen } = scheduleStore

  const rowNum = Math.ceil(data.length / 8)

  const currentSsuList: SsuSortingInfo[][] = []

  _.times(rowNum, (index) => {
    const begin = index * 8
    const end = begin + 8
    currentSsuList[index] = data.slice(begin, end)
  })

  return (
    <Flex column style={{ width: '100%' }}>
      {_.times(rowNum, (index) => {
        return (
          <SchedulePieECharts
            data={currentSsuList[index]}
            itemFieldName={{
              finishedFieldName: 'finished',
              totalFieldName: 'total',
              titleFieldName: 'name',
            }}
            showText={{
              finishedText: '已完成分拣数',
              unFinishedText: '未完成分拣数',
            }}
            isHalfColor
            isGradualChange={isFullScreen}
            titlePosition={{ bottom: '0' }}
            style={{ height: '120px', width: '100%' }}
          />
        )
      })}
    </Flex>
  )
})

function shuffle15(list: any[]) {
  return _.shuffle(list).slice(0, 15)
}

const MerchandiseSchedule = () => {
  const { ssuSortingInfo } = scheduleStore
  const [ssuList, setSsuList] = useState(() => {
    return shuffle15(ssuSortingInfo)
  })

  useEffect(() => {
    setSsuList(shuffle15(ssuSortingInfo))
  }, [ssuSortingInfo])

  // 当商品等于15时 显示换一批
  const nextButtonContent = () => {
    const { isFullScreen } = scheduleStore

    return (
      <div>
        {ssuList.length === 15 && !isFullScreen && (
          <Flex
            alignCenter
            className='gm-cursor text-primary'
            onClick={() => {
              setSsuList(shuffle15(scheduleStore.ssuSortingInfo))
            }}
          >
            <span className='gm-margin-lr-5'>
              <SvgRefresh />
            </span>
            {t('换一批')}
          </Flex>
        )}
      </div>
    )
  }

  const contentComponent = () => {
    const { isFullScreen, ssuSortingInfo } = scheduleStore

    const rowNum = Math.ceil(ssuSortingInfo.length / 8)
    const extraHeight = rowNum === 0 ? 0 : (rowNum - 1) * 120

    return (
      <Box
        style={{
          backgroundColor: uiStyle.getOrderBackgroundColor(isFullScreen),
        }}
        className='gm-padding-tb-10 gm-padding-lr-20'
      >
        <PurchaseOverviewTitle
          title={t('商品分拣进度')}
          type={!isFullScreen ? 'more' : 'fullScreen'}
          linkRoute={`/sorting/detail?tab=${Tab.MERCHANDISE}`}
          linkText={t('查看更多')}
          leftChildren={nextButtonContent()}
        />
        <Flex
          alignCenter
          justifyCenter
          style={{
            backgroundColor: uiStyle.getMerchandiseBackgroundColor(
              isFullScreen,
            ),
            marginTop: '10px',
            height: isFullScreen
              ? extraHeight + 160 + `px`
              : extraHeight + 120 + `px`,
          }}
        >
          {ssuSortingInfo.length === 0 ? (
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
            <SchedulePie data={ssuList} />
          )}
        </Flex>
      </Box>
    )
  }

  const { isFullScreen } = scheduleStore

  return isFullScreen ? (
    <FourCornerBorder>{contentComponent()}</FourCornerBorder>
  ) : (
    contentComponent()
  )
}

export default observer(MerchandiseSchedule)
