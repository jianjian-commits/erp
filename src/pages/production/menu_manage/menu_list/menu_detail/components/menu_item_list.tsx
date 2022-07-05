import React, { FC } from 'react'
import _ from 'lodash'
import { Flex } from '@gm-pc/react/src/index'
import classNames from 'classnames'
import SvgZu from './svg/zu.svg'

interface MenuItemList {
  // TODO
  data: any
}

const MenuItemList: FC<MenuItemList> = ({ data }) => {
  return (
    <div>
      {_.map(data, (item, index: number) => {
        if (!item.sku_id) return null
        const isBom = !!item.bom?.bom_id

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
              {isBom && (
                <SvgZu
                  className='gm-text-primary gm-text-16'
                  style={{ marginRight: '2px' }}
                />
              )}
              <Flex flex column>
                <div className='gm-text-ellipsis' style={{ width: '130px' }}>
                  {item?.name}
                </div>
              </Flex>
              <span>{item?.base_price?.price + '元/' + item?.unit?.name}</span>
            </Flex>
          </>
        )
      })}
    </div>
  )
}

export default MenuItemList
