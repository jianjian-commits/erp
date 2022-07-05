import { t } from 'gm-i18n'
import React, { ReactNode } from 'react'
import { Price, Tooltip } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import { observer, Observer } from 'mobx-react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import OrderNo from './order_no'
import Customer from './customer'
import ServiceTime from './service_time'
import ReceiveTime from './receive_time'
import OrderComment from './order_comment'
import OrderTime from './order_time'
import Receiver from './receiver'
import Address from './address'
import Original from './original'
import OperateTime from './operate_time'
import Action from './action'
import store from '../store'
import globalStore from '@/stores/global'
import ReceiptStatus from './receipt_status'
import OutStockTime from './out_stock_time'
import OrderType from './order_type'
import _ from 'lodash'
import './index.less'
import classNames from 'classnames'
import { Permission } from 'gm_api/src/enterprise'
import { Quotation_Type } from 'gm_api/src/merchandise'

interface Block {
  text: string | ReactNode
  value: ReactNode
  hide?: boolean
}
const Header = observer(() => {
  const location = useGMLocation<{ id: string }>()
  const { id } = location.query
  const isIdDetail = !!id

  // 隐藏加单字段（没有权限、菜谱订单）
  const hideFakeOrderValue =
    store.order.quotation_type === Quotation_Type.WITH_TIME ||
    !globalStore.hasPermission(
      Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
    )

  let priceBlock: Block[] = []
  if (isIdDetail) {
    priceBlock = [
      {
        text: t('下单金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+store.summary.orderPrice}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      ...(globalStore.isLite
        ? []
        : [
            {
              text: t('出库金额'),
              value: (
                <Observer>
                  {() => (
                    <Price
                      value={+store.summary.outStockPrice}
                      precision={globalStore.dpOrder}
                    />
                  )}
                </Observer>
              ),
            },
            {
              text: t('售后金额'),
              value: (
                <Observer>
                  {() => (
                    <Price
                      value={+store.summary.afterSales}
                      precision={globalStore.dpOrder}
                    />
                  )}
                </Observer>
              ),
            },
            {
              text: (
                <span>
                  {t('销售额')}
                  &nbsp;
                  <Tooltip
                    right
                    showArrow
                    popup={
                      <div className='gm-padding-10'>
                        {t(
                          '销售额 = 实际商品出库销售额 + 售后金额优惠金额 + 运费',
                        )}
                      </div>
                    }
                  />
                </span>
              ),
              value: (
                <Observer>
                  {() => (
                    <>
                      <Price
                        value={+store.summary.salePrice}
                        precision={globalStore.dpOrder}
                      />
                    </>
                  )}
                </Observer>
              ),
            },
            {
              text: (
                <span>
                  {t('总加单金额')}
                  &nbsp;
                  <Tooltip
                    right
                    showArrow
                    popup={
                      <div className='gm-padding-10'>
                        {t(
                          '总加单金额=加单金额1+加单金额2+加单金额3+加单金额4',
                        )}
                      </div>
                    }
                  />
                </span>
              ),
              value: (
                <Observer>
                  {() => (
                    <Price
                      value={+store.summary.totalAddOrderPrice!}
                      precision={globalStore.dpOrder}
                    />
                  )}
                </Observer>
              ),
              hide: hideFakeOrderValue,
            },
            {
              text: (
                <span>
                  {t('套账下单金额')}
                  &nbsp;
                  <Tooltip
                    right
                    showArrow
                    popup={
                      <div className='gm-padding-10'>
                        {t('套账下单金额=下单金额+总加单金额')}
                      </div>
                    }
                  />
                </span>
              ),
              value: (
                <Observer>
                  {() => (
                    <Price
                      value={+store.summary.fakeOrderPrice!}
                      precision={globalStore.dpOrder}
                    />
                  )}
                </Observer>
              ),
              hide: hideFakeOrderValue,
            },
            {
              text: (
                <span>
                  {t('套账出库金额')}
                  &nbsp;
                  <Tooltip
                    right
                    showArrow
                    popup={
                      <div className='gm-padding-10'>
                        {t('套账出库金额=出库金额+总加单金额')}
                      </div>
                    }
                  />
                </span>
              ),
              value: (
                <Observer>
                  {() => (
                    <Price
                      value={+store.summary.fakeOutstockPrice!}
                      precision={globalStore.dpOrder}
                    />
                  )}
                </Observer>
              ),
              hide: hideFakeOrderValue,
            },
          ]),
    ]
  }
  return (
    <ReceiptHeaderDetail
      className={classNames({ order_detail_wrapper: !globalStore.isLite })}
      contentLabelWidth={55}
      contentCol={4}
      customerContentColWidth={[350, 350, 350, 350]}
      totalData={isIdDetail ? priceBlock : undefined}
      HeaderInfo={[
        {
          label: t('订单号'),
          item: <OrderNo />,
        },
        {
          label: t('客户'),
          item: <Customer />,
        },
      ]}
      HeaderAction={<Action />}
      ContentInfo={
        _.without(
          [
            {
              label: t('运营时间'),
              item: <ServiceTime />,
              hide: globalStore.isLite,
            },
            {
              label: t('预计收货'),
              item: <ReceiveTime />,
            },
            {
              label: t('订单类型'),
              item: <OrderType />,
              hide: globalStore.isLite,
            },
            {
              label: t('订单备注'),
              item: <OrderComment />,
              hide: globalStore.isLite,
            },
            {
              label: t('订单来源'),
              item: <Original />,
              hide: globalStore.isLite,
            },
            {
              label: t('下单时间'),
              item: <OrderTime />,
            },
            {
              label: t('出库时间'),
              item: <OutStockTime />,
            },
            {
              label: t('收货人'),
              item: <Receiver />,
            },
            {
              label: t('收货地址'),
              item: <Address />,
            },
            {
              label: t('最后操作'),
              item: <OperateTime />,
            },
            {
              label: t('回单状态'),
              item: <ReceiptStatus />,
              hide: globalStore.isLite,
            },
          ],
          false,
        ) as any
      }
    />
  )
})

export default Header
