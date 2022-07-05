import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { Flex, RightSideModal, Tip } from '@gm-pc/react'
import { colorList } from '../util'
import _ from 'lodash'
import classNames from 'classnames'
import MenuDetail from './menu_detail'
import SVGPlus from '@/svg/plus.svg'
import MenuItemList from './menu_item_list'

interface MenuItemProps {
  mealIndex: number
  dayIndex: number
  /** 禁用“添加商品” */
  disabled?: boolean
}

const MenuItem: FC<MenuItemProps> = observer(
  ({ mealIndex, dayIndex, disabled }) => {
    const { details } = store.menuDetailList[dayIndex]
    const { source } = store.filter
    // 订单模块只能看列表，不能添加商品和点击查看详情
    const canOnlyView = source !== 'order'

    useEffect(() => {
      return () => store.clearEditMenu()
    }, [])

    const handleDetail = () => {
      if (disabled) {
        Tip.danger(t('当前日期未生效'))
        return
      }
      store.setEditMenu(dayIndex).then((json) => {
        RightSideModal.render({
          onHide: RightSideModal.hide,
          children: <MenuDetail mealIndex={mealIndex} />,
        })
        return json
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
                'gm-cursor': canOnlyView,
              })}
              style={{
                borderRadius: '0 0 10px 10px',
                minHeight: `${store.getMinHeight(
                  details?.service_period_infos[mealIndex]?.name,
                )}px`,
              }}
              onClick={canOnlyView ? handleDetail : _.noop}
            >
              {canOnlyView ? (
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
        <div
          onClick={source !== 'order' ? handleDetail : _.noop}
          className='b-menu-item'
        >
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
            className={classNames('b-menu-item-content gm-overflow-y', {
              'gm-cursor': source !== 'order',
            })}
            style={{
              borderRadius: '0 0 10px 10px',
              minHeight: `${store.getMinHeight(
                details?.service_period_infos[mealIndex]?.name,
              )}px`, // 181px 为最小高度
            }}
          >
            <MenuItemList
              mealIndex={mealIndex}
              dayIndex={dayIndex}
              data={details?.service_period_infos[mealIndex]?.details}
            />
          </div>
        </div>
      )
    }
    return <div className='gm-margin-10'>{renderMeal()}</div>
  },
)

MenuItem.displayName = 'MenuItem'

export default MenuItem
