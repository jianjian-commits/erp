import React from 'react'
import { t } from 'gm-i18n'
import { BoxPanel, Price } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import MergeList from './merge_list'
import MenuList from './menu_list'

import store from '../store'

const List = () => {
  return (
    <>
      <BoxPanel
        title={t('下单商品')}
        summary={
          <Observer>
            {() => (
              <span>
                {t('商品列表: ')}
                <span className='gm-text-primary gm-text-bold'>
                  {store.menuList.length}
                </span>
              </span>
            )}
          </Observer>
        }
        collapse
      >
        <MenuList />
      </BoxPanel>
      <BoxPanel
        title={t('商品明细')}
        summary={
          <Observer>
            {() => (
              <span>
                {t('商品列表: ')}
                <span className='gm-text-primary gm-text-bold'>
                  {store.list.length}
                </span>
                <span className='gm-padding-lr-10 gm-text-desc'>|</span>
                <span>
                  {t('运费: ')}
                  <Price
                    className='gm-text-primary gm-text-bold'
                    value={+store.summary.freightPrice! || 0}
                  />
                </span>
              </span>
            )}
          </Observer>
        }
        collapse
      >
        <MergeList />
      </BoxPanel>
    </>
  )
}

export default observer(List)
