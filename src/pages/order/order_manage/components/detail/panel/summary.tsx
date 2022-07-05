import React from 'react'
import { t } from 'gm-i18n'

import { Price } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import { toFixedOrder } from '@/common/util'
import { observer } from 'mobx-react'
import store from '../store'
import globalStore from '@/stores/global'
import { Sku_SkuType } from 'gm_api/src/merchandise'

const Summary = observer(() => {
  const location = useGMLocation<{ id: string }>()
  const isDetail = !!location.query.id
  const {
    order: { coupon_price },
    summary,
    list,
  } = store
  const len = list.filter(
    (item) => item.sku_type !== Sku_SkuType.COMBINE,
  ).length
  // 运费
  const freightCom = () => {
    return summary.freightPrice ? (
      <span>
        {t('运费: ')}
        <Price
          className='gm-text-primary gm-text-bold'
          value={+summary.freightPrice}
        />
      </span>
    ) : (
      <span>
        {t('运费: ')}
        <Price className='gm-text-primary gm-text-bold' value={0} />
      </span>
    )
  }

  const orderListTitle = () => {
    if (!isDetail) {
      return (
        <span>
          {t('商品统计: ')}
          <span className='gm-text-primary gm-text-bold'>{len}</span>
          <span className='gm-padding-lr-10 gm-text-desc'>|</span>
          {t('合计: ')}
          <span className='gm-text-primary gm-text-bold'>
            {Price.getCurrency()} {summary.orderPrice || 0}
          </span>
          {!globalStore.isLite && (
            <>
              <span className='gm-padding-lr-10 gm-text-desc'>|</span>
              {freightCom()}
            </>
          )}
        </span>
      )
    } else {
      const couponDiscount = +toFixedOrder(+coupon_price! || 0)
      return (
        <span>
          {globalStore.isLite ? t('商品列表: ') : t('商品数量: ')}
          <span className='gm-text-primary gm-text-bold'>{len}</span>
          {couponDiscount !== 0 && (
            <span>
              <span className='gm-padding-lr-10 gm-text-desc'>|</span>
              {t('优惠金额: ')}-
              <Price
                className='gm-text-primary gm-text-bold'
                value={couponDiscount}
              />
            </span>
          )}
          {!globalStore.isLite && (
            <>
              <span className='gm-padding-lr-10 gm-text-desc'>|</span>
              {freightCom()}
            </>
          )}
        </span>
      )
    }
  }

  return <span>{orderListTitle()}</span>
})

export default Summary
