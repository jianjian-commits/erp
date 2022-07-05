import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { Flex, Checkbox } from '@gm-pc/react'
import MenuItem from './menu_item'
import { getHolidayText, getWeek } from '@/common/util'
import _ from 'lodash'
import classNames from 'classnames'
// import { MenuDetail_State } from 'gm_api/src/merchandise'
import Status from './status'
import { Sku_SkuType } from 'gm_api/src/merchandise'

interface DayItemProps {
  dayIndex: number
}

const DayItem: FC<DayItemProps> = observer(({ dayIndex }) => {
  const { menu_time, is_holiday, details, state, selected, menu_status } =
    store.menuDetailList[dayIndex]
  const { source } = store.filter
  // 未进入生产
  // const isPrepare = state === MenuDetail_State.STATE_PREPARE
  // todo 学生餐菜谱 能生生成订单
  // const isCanNotBeOrder =
  //   menu_detail_id &&
  //   isPrepare &&
  //   (menu_status === 'in' || menu_status === 'done')

  // todo 学生餐有 对每日餐次的setting
  // const popoverRef = useRef<Popover>(null)
  // const moreList = []
  // const handleSelect = (value: number) => {
  //   popoverRef.current!.apiDoSetActive(false)
  //   _.find(moreList, (v) => v.value === value)?.onClick(dayIndex)
  // }

  const handleCheck = () => {
    store.changeMenuSelected(dayIndex, !selected)
  }

  const renderDay = () => {
    if (is_holiday) {
      return (
        <div className='gm-padding-10' style={{ height: '100%' }}>
          <Flex
            alignCenter
            justifyCenter
            style={{ height: '100%', borderRadius: '8px' }}
            className='gm-text-20 gm-back-bg gm-text-desc'
          >
            {t('放假')}
          </Flex>
        </div>
      )
    }
    return _.map(details?.service_period_infos, (item, mealIndex) => {
      return (
        <MenuItem
          dayIndex={dayIndex}
          mealIndex={mealIndex}
          disabled={menu_status === 'future'}
        />
      )
    })
  }

  // 要考虑菜谱下单
  let isCombine = false
  if (source === 'order') {
    isCombine = true
  } else {
    _.forEach(details?.service_period_infos, (item) => {
      if (
        _.some(
          item.details,
          (skuItem) => skuItem.sku_type === Sku_SkuType.COMBINE,
        )
      ) {
        isCombine = true
      }
    })
  }

  return (
    <Flex
      none
      className={classNames('b-day-item', `b-day-item-status-${state}`, {
        'b-day-item-selected': selected,
      })}
      key={Math.random()}
      style={{ minHeight: '380px', width: '260px' }}
    >
      <Flex column flex className='gm-position-relative'>
        <div className='gm-border-bottom'>
          <Flex className='b-day-item-head' alignCenter>
            <Checkbox
              className='gm-margin-top-10'
              onChange={handleCheck}
              checked={selected}
              disabled={!isCombine}
            />

            <Flex column flex>
              <div className='gm-text-center gm-text-18'>
                {getWeek(menu_time)}
              </div>
              <div className='gm-text-center'>
                <span>{menu_time}</span>
                {getHolidayText(menu_time) && (
                  <span>/{getHolidayText(menu_time)}</span>
                )}
                <Status is_holiday={is_holiday} menu_status={menu_status} />
              </div>
            </Flex>
            {/* {moreList.length > 0 && ( */}
            {/*  <Popover */}
            {/*    ref={popoverRef} */}
            {/*    showArrow */}
            {/*    type='hover' */}
            {/*    right */}
            {/*    center */}
            {/*    popup={ */}
            {/*      <List */}
            {/*        data={moreList} */}
            {/*        onSelect={handleSelect} */}
            {/*        className='gm-border-0' */}
            {/*        style={{ minWidth: '30px' }} */}
            {/*      /> */}
            {/*    } */}
            {/*  > */}
            {/*    <div */}
            {/*      style={{ height: '10px', top: '5px', right: '10px' }} */}
            {/*      className='gm-position-absolute' */}
            {/*    > */}
            {/*      <SVGMore /> */}
            {/*    </div> */}
            {/*  </Popover> */}
            {/* )} */}
          </Flex>
        </div>
        {/* todo tag 暂时学生餐菜谱需要 */}
        {/* <div className={`b-day-label b-day-label-status-${state}`}>
          {map_MenuDetail_State[state] || '-'}
        </div> */}
        <div style={{ height: '100%' }}>{renderDay()}</div>
      </Flex>
    </Flex>
  )
})

DayItem.displayName = 'DayItem'

export default DayItem
