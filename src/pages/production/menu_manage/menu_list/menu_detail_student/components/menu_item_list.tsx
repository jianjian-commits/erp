import React, { FC } from 'react'
import _ from 'lodash'
import { Flex } from '@gm-pc/react/src/index'
import classNames from 'classnames'
import globalStore from '@/stores/global'

interface MenuItemList {
  // TODO
  data: any
}

const MenuItemList: FC<MenuItemList> = ({ data }) => {
  // 基本单位和辅助单位从globalStore查询数据
  const findUnitFromGlobal = (id: string) => {
    return _.find(globalStore.unitList, (unitItem) => unitItem.value === id)
  }
  // 自定义单位从sku查询数据
  const findUnitFromSku = (id: string, sku: any) => {
    const units = _.get(sku, 'units.units', [])
    return _.find(units, (unit) => unit.unit_id === id)
  }
  return (
    <div>
      {_.map(data, (item, index: number) => {
        if (!item.sku_id) return null
        const unit_id = item?.unit_id || ''
        const sku = item.sku
        const unitName =
          findUnitFromGlobal(unit_id)?.name ||
          findUnitFromSku(unit_id, sku)?.name
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
              <Flex flex column>
                <div className='gm-text-ellipsis' style={{ width: '130px' }}>
                  {item?.sku?.name || ''}
                </div>
              </Flex>
              <span>{item?.count + '' + unitName}</span>
            </Flex>
          </>
        )
      })}
    </div>
  )
}

export default MenuItemList
