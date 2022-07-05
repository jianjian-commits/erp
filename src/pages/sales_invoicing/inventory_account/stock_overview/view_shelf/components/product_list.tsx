import React from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Flex, FormPanel } from '@gm-pc/react'

import { ProductItemCard } from '.'
import store from '../store'
import '../../style.less'

const ProductList = observer(() => {
  const { skuListForShelf, selectedShelf } = store
  return (
    <FormPanel
      title={t('KEY5', { name: selectedShelf.text })}
      style={{ height: '100%' }}
    >
      <Flex
        alignContentStart
        wrap
        className='b-width-100-percent b-height-100-percent b-shelf-product'
      >
        {skuListForShelf.length > 0 ? (
          <>
            {_.map(skuListForShelf, (sku) => {
              return <ProductItemCard data={sku} key={sku.sku_id} />
            })}
            {/* 假的填充，10个应该够了 */}
            {_.times(10, () => (
              <Flex
                flex={1}
                className='gm-padding-lr-20 spu-list-card gm-margin-right-20 spu-list-card-virtual'
              />
            ))}
          </>
        ) : (
          <div>{t('没有数据')}</div>
        )}
      </Flex>
    </FormPanel>
  )
})

export default ProductList
