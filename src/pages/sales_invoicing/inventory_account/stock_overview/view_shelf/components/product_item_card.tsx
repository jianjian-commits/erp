import React, { useState } from 'react'

import { Flex, Price } from '@gm-pc/react'

import _ from 'lodash'
import { t } from 'gm-i18n'
import productDefaultImg from '@/img/product-default-gm.png'
import { toFixedByType } from '@/common/util'
import { SkuForShow } from '@/pages/sales_invoicing/warehousing_data/shelf_manage/interface'
import { mutiUnitConvert } from '@/pages/sales_invoicing/util2'
import globalStore from '@/stores/global'

interface SpuListCardProps {
  data: SkuForShow
}

const SpuListCard: React.FC<SpuListCardProps> = (props) => {
  const {
    data: {
      sku_customized_code,
      sku_name,
      imageUrl,
      stock_num,
      stock_money,
      sku_base_unit_name,
      units,
      sku_base_unit_id,
      second_base_unit_id,
      second_base_unit_quantity,
      second_base_unit_name,
    },
  } = props

  const [url, changeUrl] = useState(imageUrl)

  return (
    <Flex
      flex={1}
      className='tw-cursor-pointer gm-padding-20 gm-margin-bottom-20 spu-list-card gm-margin-right-20'
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
            {t('库存数量（基本单位）')}
            <span>{toFixedByType(stock_num) + sku_base_unit_name}</span>
          </p>
          <p>
            {t('库存数量（辅助单位）')}
            <span>
              {second_base_unit_quantity
                ? toFixedByType(second_base_unit_quantity as any) +
                  second_base_unit_name
                : '-'}
            </span>
          </p>
          {!globalStore.isLite && (
            <p>
              {t('多单位数量汇总：')}
              <span>
                {_.toNumber(second_base_unit_id) !== 0
                  ? '-'
                  : mutiUnitConvert(stock_num, units.units, sku_base_unit_id)}
              </span>
            </p>
          )}
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
