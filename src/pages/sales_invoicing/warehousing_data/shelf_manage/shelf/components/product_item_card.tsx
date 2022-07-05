import React, { useState } from 'react'

import { Flex, Price, RightSideModal } from '@gm-pc/react'

import { t } from 'gm-i18n'
import { SkuForShow } from '../../interface'
import productDefaultImg from '@/img/product-default-gm.png'
import ProductDetailsModal from './product_details_modal'
import { toFixedByType } from '@/common/util'

interface SpuListCardProps {
  data: SkuForShow
}

const SpuListCard: React.FC<SpuListCardProps> = (props) => {
  const {
    data: {
      sku_customized_code,
      sku_name,
      imageUrl,
      batch_count,
      stock_num,
      stock_money,
      sku_base_unit_name,
    },
  } = props

  const [url, changeUrl] = useState(imageUrl)

  const handleSpuCardClick = () => {
    RightSideModal.render({
      children: <ProductDetailsModal {...props.data} />,
      title: '商品信息',
      style: {
        width: '1200px',
      },
      onHide: RightSideModal.hide,
    })
  }

  return (
    <Flex
      flex={1}
      className='tw-cursor-pointer gm-padding-20 gm-margin-bottom-20 spu-list-card gm-margin-right-20'
      onClick={handleSpuCardClick}
    >
      <Flex row alignCenter>
        <div className='spu-list-card-left gm-margin-right-20'>
          <img
            src={url}
            alt={sku_name}
            onError={() => changeUrl(productDefaultImg)}
          />
        </div>
        <div>
          <h4>{sku_name}</h4>
          <h4>{sku_customized_code}</h4>
          <p>
            {t('批次数量：')}
            <span>{batch_count}</span>
          </p>
          <p>
            {t('库存数量：')}
            <span>{toFixedByType(stock_num) + sku_base_unit_name}</span>
          </p>
          <p>
            {t('库存货值：')}
            <span>
              {toFixedByType(stock_money, 'dpInventoryAmount') +
                Price.getUnit()}
            </span>
          </p>
        </div>
      </Flex>
    </Flex>
  )
}

export default SpuListCard
