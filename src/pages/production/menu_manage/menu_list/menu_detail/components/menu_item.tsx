import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { Flex, RightSideModal } from '@gm-pc/react'
import { colorList } from '../util'

import _ from 'lodash'

import classNames from 'classnames'
import MenuDetail from './menu_detail'
import SVGPlus from '@/svg/plus.svg'

import MenuItemList from './menu_item_list'

interface MenuItemProps {
  mealIndex: number
  dayIndex: number
}

const MenuItem: FC<MenuItemProps> = observer(({ mealIndex, dayIndex }) => {
  const { details } = store.menuList[dayIndex]
  // menu_status

  useEffect(() => {
    return () => store.clearEditMenu()
  }, [])

  const handleDetail = () => {
    store.setEditMenu(dayIndex).then(() => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        children: <MenuDetail mealIndex={mealIndex} />,
      })
    })
  }

  const renderMeal = () => {
    if (!details?.service_period_infos[mealIndex]?.details[0]?.sku_id) {
      return (
        <div className='b-menu-item'>
          <Flex
            alignCenter
            justifyCenter
            style={{
              backgroundColor: colorList[mealIndex],
              height: '40px',
              borderRadius: '10px 10px 0 0',
            }}
            className='gm-text-14 b-menu-item-head'
          >
            {details?.service_period_infos[mealIndex]?.name}
          </Flex>
          <Flex
            justifyCenter
            alignCenter
            className={classNames('b-menu-item-content', {
              // 'gm-cursor': menu_status === 'future',
            })}
            style={{ borderRadius: '0 0 10px 10px' }}
            onClick={true ? handleDetail : _.noop}
          >
            {true ? (
              <div className='b-menu-item-add'>
                <span className='gm-margin-right-5'>
                  <SVGPlus />
                </span>
                {t(`添加商品`)}
              </div>
            ) : (
              <div className='gm-text-desc'>{t(`没有商品`)}</div>
            )}
          </Flex>
        </div>
      )
    }

    return (
      <div onClick={handleDetail} className='b-menu-item'>
        <Flex
          alignCenter
          justifyCenter
          style={{
            backgroundColor: colorList[mealIndex],
            borderColor: colorList[mealIndex],
          }}
          className='b-menu-item-head'
        >
          {details?.service_period_infos[mealIndex]?.name}
        </Flex>
        <div
          className='b-menu-item-content gm-overflow-y gm-cursor'
          style={{
            borderRadius: '0 0 10px 10px',
          }}
        >
          <MenuItemList
            data={details?.service_period_infos[mealIndex]?.details}
          />
        </div>
      </div>
    )
  }
  return <div className='gm-margin-10'>{renderMeal()}</div>
})

export default MenuItem
