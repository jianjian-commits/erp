import React from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import productDefaultImg from '@/img/product-default-gm.png'
import ProductImage from '@/common/components/product_image'
import store from '../../store'
import { observer } from 'mobx-react'
import { getCategoryName } from '@/common/util'

const MerchandiseHeader = () => {
  const { chooseSku, category_map } = store
  const url = chooseSku?.repeated_field?.images?.[0]?.path || ''
  const imageUrl = url || productDefaultImg
  return (
    <Flex className='rule-list-right-header'>
      <ProductImage
        url={imageUrl}
        style={{ width: '64px', height: '64px', maxWidth: '64px' }}
      />

      <Flex className='tw-ml-3 tw-h-full' column justifyBetween>
        <span className='tw-text-sm tw-font-bold' style={{ color: '#000' }}>
          {t(chooseSku?.name! || '-')}
        </span>
        <span className='tw-text-xs  tw-font-normal'>
          {t(
            getCategoryName(category_map, chooseSku?.category_id!) ||
              '暂无分类',
          )}
        </span>
      </Flex>
    </Flex>
  )
}
export default observer(MerchandiseHeader)
