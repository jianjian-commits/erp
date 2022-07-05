import React from 'react'
import { Flex, Tooltip } from '@gm-pc/react'
import { t } from 'gm-i18n'

const ProductionUnitTip = () => {
  return (
    <Flex>
      {t('商品单位')}
      <Tooltip
        className='gm-padding-lr-5 gm-text-14'
        popup={
          <div className='gm-padding-5' style={{ width: '450px' }}>
            <div>
              {t(
                '支持选择生产单位或基本单位组进行录入。示例：生产单位是500ml=1瓶，则此处可录入ml或瓶',
              )}
            </div>
          </div>
        }
      />
    </Flex>
  )
}

export default ProductionUnitTip
