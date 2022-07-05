import React, { ChangeEvent, FC } from 'react'
import _ from 'lodash'
import store from '../store'
import { Checkbox, Flex } from '@gm-pc/react'
import classNames from 'classnames'
import SvgZu from './svg/zu.svg'
import { isValid, toFixedOrder } from '@/common/util'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { MenuDetailItem } from '../interface'
import { Sku_SkuType } from 'gm_api/src/merchandise'

interface MenuItemList {
  data: MenuDetailItem[]
  dayIndex: number
  mealIndex: number
}

const MenuItemList: FC<MenuItemList> = observer(
  ({ data, mealIndex, dayIndex }) => {
    const { source } = store.filter
    const handleCheck = (
      event: ChangeEvent,
      selected: boolean,
      ssuIndex: number,
    ) => {
      event.stopPropagation()
      store.changeSsuSelected(mealIndex, dayIndex, ssuIndex, selected)
    }

    return (
      <div>
        {_.map(data, (item, index: number) => {
          if (!item.sku_id) return null
          const isCombine = item.sku_type === Sku_SkuType.COMBINE
          const canSelected =
            source === 'order' || (source === 'vegetables' && isCombine)

          // 这里单位根据计价单位展示，与商品详情中保持一致
          // const ssuName =
          //   item?.shipping_fee_unit === Ssu_ShippingFeeUnit.PACKAGE
          //     ? item?.unit?.name
          //     : globalStore.getUnitName(item?.unit?.parent_id!)

          return (
            <>
              <Flex
                key={index}
                className={classNames('gm-padding-10 gm-border-bottom')}
                style={{ height: '36px' }}
                justifyBetween
                alignCenter
                none
              >
                {canSelected ? (
                  <Checkbox
                    style={{ marginRight: '2px' }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleCheck(e, !item.selected, index)}
                    checked={item.selected}
                  />
                ) : null}
                {isCombine ? (
                  <SvgZu
                    className='gm-text-primary gm-text-16'
                    style={{ marginRight: '2px' }}
                  />
                ) : null}
                <Flex flex column>
                  <div className='gm-text-ellipsis' style={{ width: '130px' }}>
                    {item?.name}
                  </div>
                </Flex>
                <span>
                  {(isValid(item?.price)
                    ? toFixedOrder(Big(Number(item.price) || 0))
                    : '-') +
                    '元/' +
                    item.unit?.label}
                </span>
              </Flex>
            </>
          )
        })}
      </div>
    )
  },
)
MenuItemList.displayName = 'MenuItemList'

export default MenuItemList
