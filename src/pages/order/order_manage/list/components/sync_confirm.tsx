import React, { useState } from 'react'
import { Confirm, Select } from '@gm-pc/react'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

export const syncConfirmStore = observable({
  /** true:订单最新价格同步到报价单；false:报价单最新单价同步到订单 */
  order_price_to_basic: false,
})

export default function syncConfirm() {
  const Dialog = observer(() => {
    return (
      <div className='gm-padding-20'>
        <div className='tw-flex tw-items-center tw-mb-5'>
          <div className='tw-mr-5'>请选择同步方式</div>
          <div>
            <Select
              value={syncConfirmStore.order_price_to_basic}
              data={[
                {
                  text: '报价单最新单价同步到订单',
                  value: false,
                },
                {
                  text: '订单最新单价同步到报价单',
                  value: true,
                },
              ]}
              onChange={(v: boolean) =>
                (syncConfirmStore.order_price_to_basic = v)
              }
            />
          </div>
        </div>
        <p>{t('注意：')}</p>
        <ol
          className={classNames({
            'tw-hidden': syncConfirmStore.order_price_to_basic,
          })}
        >
          <li>{t('订单商品价格会将与商品所属报价单的最新定价进行更新')}</li>
          <li>{t('已经加入对账单、存在售后的订单不能进行价格同步操作')}</li>
          <li>
            {t(
              '如商品从所属报价单中删除，或所属报价单被删除，不产生更新效果。',
            )}
          </li>
          <li>{t('如商品为时价，则不会更新至订单中组合商品的子商品。')}</li>
        </ol>
        <ol
          className={classNames({
            'tw-hidden': !syncConfirmStore.order_price_to_basic,
          })}
        >
          <li>
            {t('如商品从所属报价单中删除，或所属报价单被删除，不产生更新效果')}
          </li>
          <li>{t('如商品所属报价单已失效，不产生更新效果')}</li>
          <li>{t('如商品为时价，则不会更新至报价单中组合商品的子商品。')}</li>
        </ol>
      </div>
    )
  })
  return Confirm({
    size: 'md',
    title: t('批量同步价格'),
    children: <Dialog />,
  })
}
