import { t } from 'gm-i18n'
import React, { ReactNode } from 'react'
import { Flex, Price } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import moment from 'moment'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
// import ViewOrderNo from '../../../../components/view_order_no'
import Action from './action'
import store from '../store'
import globalStore from '@/stores/global'
import { appTypeMap } from '../../../../enum'
import { map_App_Type } from 'gm_api/src/common'
import { Order_UserType } from 'gm_api/src/order'
import OrderNo from './order_no'
import OrderComment from './order_comment'
import ReceiveTime from './receive_time'
import { Quotation_Type } from 'gm_api/src/merchandise'
import { getReceiptStatusText } from '@/common/util'

interface Block {
  text: string
  value: ReactNode
}
const Header = observer(() => {
  const isMenuOrder = store.order.quotation_type === Quotation_Type.WITH_TIME
  const priceBlock: Block[] = [
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
      text: t('销售额'),
      value: (
        <Observer>
          {() => (
            <Price
              value={+store.summary.salePrice}
              precision={globalStore.dpOrder}
            />
          )}
        </Observer>
      ),
    },
  ]

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={55}
      contentCol={4}
      customerContentColWidth={[350, 350, 350, 350]}
      totalData={priceBlock}
      HeaderInfo={[
        {
          label: t('订单号'),
          item: (
            <Observer>
              {() => {
                return <OrderNo />
              }}
            </Observer>
          ),
        },
        {
          label: t('商户'),
          item: (
            <Observer>
              {() => <Flex alignCenter>{store.order?.customer?.name}</Flex>}
            </Observer>
          ),
        },
      ]}
      HeaderAction={<Action />}
      ContentInfo={[
        {
          label: t(`${isMenuOrder ? '餐次信息' : '运营时间'}`),
          item: (
            <Observer>
              {() => (
                <Flex alignCenter>
                  {store.order?.service_period?.name || '-'}
                </Flex>
              )}
            </Observer>
          ),
        },
        {
          label: t('预计收货'),
          item: <ReceiveTime />,
        },
        {
          label: t('订单备注'),
          item: <OrderComment />,
        },
        {
          label: t('订单来源'),
          item: (
            <Observer>
              {() => {
                const {
                  order: { app_type, order_op },
                } = store
                return (
                  <div>
                    {appTypeMap[`${app_type!}_${order_op}`] ||
                      map_App_Type[app_type!]}
                  </div>
                )
              }}
            </Observer>
          ),
        },
        {
          label: t('下单时间'),
          item: (
            <Observer>
              {() => (
                <div className='gm-padding-right-5'>
                  {moment(new Date(+store.order?.create_time!)).format(
                    'YYYY-MM-DD HH:mm',
                  )}
                </div>
              )}
            </Observer>
          ),
        },
        !isMenuOrder
          ? {
              label: t('出库时间'),
              item: (
                <Observer>
                  {() => {
                    const {
                      order: { outstock_time },
                    } = store
                    return (
                      <div className='gm-padding-right-5'>
                        {outstock_time !== '0' && outstock_time
                          ? moment(new Date(+outstock_time!)).format(
                              'YYYY-MM-DD HH:mm',
                            )
                          : '-'}
                      </div>
                    )
                  }}
                </Observer>
              ),
            }
          : { label: '', item: null },
        {
          label: t('收货人'),
          item: (
            <Observer>
              {() => (
                <div className='gm-padding-right-5'>
                  {(store.order?.addresses?.addresses || [])[0]?.receiver ||
                    '-'}
                </div>
              )}
            </Observer>
          ),
        },
        {
          label: t('收货地址'),
          item: (
            <Observer>
              {() => (
                <div className='gm-padding-right-5'>
                  {(store.order?.addresses?.addresses || [])[0]?.address || '-'}
                </div>
              )}
            </Observer>
          ),
        },
        {
          label: t('最后操作'),
          item: (
            <Observer>
              {() => {
                const {
                  order: {
                    update_time,
                    group_users,
                    customer_users,
                    customer,
                    updater_id,
                    updater_id_type,
                  },
                } = store
                const updater =
                  updater_id_type === Order_UserType.USERTYPE_CUSTOMER_USER
                    ? customer_users?.[updater_id!]?.name
                    : group_users[updater_id!]?.name

                // 不同端下单收货人判断不同
                return (
                  <div>
                    {(updater || '-') +
                      '(' +
                      moment(new Date(+update_time!)).format(
                        'YYYY-MM-DD HH:mm',
                      ) +
                      ')'}
                  </div>
                )
              }}
            </Observer>
          ),
        },
        !isMenuOrder
          ? {
              label: t('回单状态'),
              item: (
                <Observer>
                  {() => {
                    const {
                      order: { status },
                    } = store
                    return (
                      <div className='gm-padding-right-5'>
                        {getReceiptStatusText(status!)}
                      </div>
                    )
                  }}
                </Observer>
              ),
            }
          : { label: '', item: null },
      ]}
    />
  )
})

export default Header
