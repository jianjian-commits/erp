import { t } from 'gm-i18n'
import React, { FC, useRef } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { Flex, Checkbox, List, Popover, Tip, Dialog } from '@gm-pc/react'
import MenuItem from './menu_item'
import { getHolidayText, getWeek } from '@/common/util'
import _ from 'lodash'
import SVGMore from '@/svg/more.svg'
import classNames from 'classnames'
import { MenuDetail_State, map_MenuDetail_State } from 'gm_api/src/merchandise'
import { useGMLocation } from '@gm-common/router'
import Status from './status'

interface DayItemProps {
  dayIndex: number
}

const DayItem: FC<DayItemProps> = observer(({ dayIndex }) => {
  const location = useGMLocation<{ menu_id: string }>()
  const { menu_id } = location.query
  const {
    menu_time,
    is_holiday,
    details,
    state,
    selected,
    menu_detail_id,
    menu_status,
  } = store.menuList[dayIndex]

  // 未进入生产
  const isPrepare = state === MenuDetail_State.STATE_PREPARE

  // 能生生成订单
  const isCanNotBeOrder =
    menu_detail_id &&
    isPrepare &&
    (menu_status === 'in' || menu_status === 'done')
  const popoverRef = useRef<Popover>(null)

  const moreList = [
    {
      value: 'cancelHoliday',
      text: t('取消放假'),
      onClick: () => {
        store.setHoliday(menu_id, dayIndex, false).then((json) => {
          Tip.success(t('取消放假成功'))
          store.fetchList(menu_id)
          return json
        })
      },
      // display: is_holiday && menu_status === 'future',
    },
    {
      value: 'beHoliday',
      text: t('设为放假'),
      onClick: () => {
        store.setHoliday(menu_id, dayIndex, true).then((json) => {
          Tip.success(t('设为放假成功'))
          store.fetchList(menu_id)
          return json
        })
      },
      // display: !is_holiday && menu_status === 'future',
    },
    {
      value: 'beOrder',
      text: t('生成订单'),
      onClick: () => {
        Dialog.render({
          title: t('生成订单'),
          size: 'md',
          children: (
            <Flex column>
              <div>{t('确定生成订单？')}</div>
              <div className='gm-text-red'>
                <p>{t('1.点击确定，订单将按照菜谱内配比生成；')}</p>
                <p>
                  {t('2.仅“生效中和已完成未进入生产”状态的菜谱才可生成订单；')}
                </p>
                <p>
                  {t(
                    '3.生成订单后，菜谱将被标记为已进入生产，后续不可再进行编辑。',
                  )}
                </p>
              </div>
            </Flex>
          ),
          buttons: [
            {
              text: t('取消'),
              onClick: Dialog.hide,
            },
            {
              text: t('确定'),
              btnType: 'primary',
              onClick: () => {
                store.createOrder(menu_detail_id).then((json) => {
                  Tip.success(t('生成订单成功'))
                  Dialog.hide()
                  store.fetchList(menu_id)
                  return json
                })
              },
            },
          ],
        })
      },
      display: isCanNotBeOrder,
    },
  ].filter((v) => v.display)

  // const handleSelect = (value: number) => {
  //   popoverRef.current!.apiDoSetActive(false)
  //   _.find(moreList, (v) => v.value === value)?.onClick(dayIndex)
  // }

  const handleCheck = () => {
    store.checkMenu(dayIndex)
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
      return <MenuItem dayIndex={dayIndex} mealIndex={mealIndex} />
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
              disabled={!isCanNotBeOrder}
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
                {/* <Status is_holiday={is_holiday} menu_status={menu_status} /> */}
              </div>
            </Flex>
            {/* {moreList.length > 0 && (
              <Popover
                ref={popoverRef}
                showArrow
                type='hover'
                right
                center
                popup={
                  <List
                    data={moreList}
                    onSelect={handleSelect}
                    className='gm-border-0'
                    style={{ minWidth: '30px' }}
                  />
                }
              >
                <div
                  style={{ height: '10px', top: '5px', right: '10px' }}
                  className='gm-position-absolute'
                >
                  <SVGMore />
                </div>
              </Popover>
            )} */}
          </Flex>
        </div>
        {/* <div className={`b-day-label b-day-label-status-${state}`}>
          {map_MenuDetail_State[state] || '-'}
        </div> */}
        <div style={{ height: '100%' }}>{renderDay()}</div>
      </Flex>
    </Flex>
  )
})

export default DayItem
