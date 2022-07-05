import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Button, Price, Flex, Input, Tooltip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../store/detail_store'
import list_store from '../store/list_store'
import _ from 'lodash'
import moment from 'moment'
import { AfterSaleOrder_Status } from 'gm_api/src/aftersale'
import { map_Order_State } from 'gm_api/src/order'
import { useGMLocation } from '@gm-common/router'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import AfterSaleTag from './after_sale_tag'
import globalStore from '@/stores/global'
import { orderState4Light } from '@/pages/order/enum'
import { message, Space } from 'antd'
import { history } from '@/common/service'

interface ActionProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<ActionProps> = observer((props) => {
  const location = useGMLocation<{
    type: 'create' | 'draft' | 'detail'
  }>()
  const { type } = location.query

  const { after_status, after_sale_order_id, order_id } = store.headerDetail

  // 申请退款数校验
  const returnValueValidator = () => {
    if (!order_id || order_id === '0') {
      return []
    }
    const afterSalesList = _.groupBy(
      store.refundDetailOnly,
      (item) => item.sku_id,
    )
    const skuNameList: string[] = []
    _.forEach(afterSalesList, (afterSales) => {
      const { can_return_value } = afterSales[0]
      let realReturnValue = 0
      _.forEach(afterSales, (item) => {
        if (item.apply_return_value.calculate?.quantity)
          realReturnValue =
            realReturnValue + Number(item.apply_return_value.calculate.quantity)
      })
      if (can_return_value < realReturnValue)
        skuNameList.push(afterSales[0].sku_name.name)
    })
    return skuNameList
  }

  const handleSubmit = () => {
    const skuNameList = returnValueValidator()
    if (skuNameList.length) {
      return message.error(
        t(`商品${skuNameList.join('、')}的总申请退款数大于可退数量`),
      )
    }

    // 新建提交
    if (type === 'create') {
      store.CreateAfterSaleOrder(AfterSaleOrder_Status.STATUS_TO_REVIEWED)
      // 草稿提交
    } else if (type === 'draft') {
      store.UpdateAfterSaleOrder(AfterSaleOrder_Status.STATUS_TO_REVIEWED)
    } else {
    }
  }
  const handleSaveDraft = () => {
    const skuNameList = returnValueValidator()
    if (skuNameList.length) {
      return message.error(
        t(`商品${skuNameList.join('、')}的总申请退款数大于可退数量`),
      )
    }

    // 新建保存草稿
    if (type === 'create') {
      store.CreateAfterSaleOrder(AfterSaleOrder_Status.STATUS_TO_SUBMIT)
      // 草稿保存草稿
    } else if (type === 'draft') {
      store.UpdateAfterSaleOrder(AfterSaleOrder_Status.STATUS_TO_SUBMIT)
    } else {
    }
  }

  const handleAuditAfterSaleOrder = () => {
    const skuNameList = returnValueValidator()
    if (skuNameList.length) {
      return message.error(
        t(`商品${skuNameList.join('、')}的总申请退款数大于可退数量`),
      )
    }

    store.AuditAfterSaleOrder().then(() => {
      history.replace(
        `/order/after_sales/after_sales_list/detail?serial_no=${after_sale_order_id}&type=detail`,
      )
    })
  }

  useEffect(() => {
    list_store.fetchDriverList()
  }, [])
  return (
    <>
      {Number(after_status) < AfterSaleOrder_Status.STATUS_TO_REVIEWED && (
        <>
          <Button
            type='primary'
            className='gm-margin-right-5'
            onClick={handleSubmit}
          >
            {t('提交')}
          </Button>
          <div className='gm-gap-10' />
          <Button plain className='gm-margin-right-5' onClick={handleSaveDraft}>
            {t('保存草稿')}
          </Button>
        </>
      )}
      {/* completed_detail_num >= all_detail_num && */}
      {after_status === AfterSaleOrder_Status.STATUS_TO_REVIEWED && (
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={handleAuditAfterSaleOrder}
        >
          {t('审核')}
        </Button>
      )}
    </>
  )
})

interface OrderCodeProps {
  type: 'add' | 'detail'
}
const OrderCode: FC<OrderCodeProps> = observer(() => {
  const { order_code, order_code_popover, order_id } = store.headerDetail
  const { driverList } = list_store
  let orderState = '-'
  if (!order_id && order_id !== '0') {
    orderState = globalStore.isLite
      ? orderState4Light[
          order_code_popover.state as keyof typeof orderState4Light
        ]
      : map_Order_State[order_code_popover.state!]
  }

  const tip_list = [
    {
      text: t('下单时间'),
      value: `\xa0${moment(+order_code_popover.create_time).format(
        'YYYY-MM-DD HH:mm:ss',
      )}`,
    },
    {
      text: t('收货时间'),
      value: `\xa0${moment(+order_code_popover.received_time).format(
        'YYYY-MM-DD HH:mm:ss',
      )}`,
    },
    {
      text: t('订单状态'),
      value: <div>{`\xa0${orderState || '-'}`}</div>,
    },
    ...(globalStore.isLite
      ? []
      : [
          {
            text: t('司机'),
            value: (
              <div>
                {`\xa0${
                  _.find(
                    driverList,
                    (item) => item.value === order_code_popover?.driver_id!,
                  )?.text! || '-'
                }`}
              </div>
            ),
          },
          {
            text: t('线路'),
            value: <div>{`\xa0${order_code_popover?.route! || '-'}`}</div>,
          },
        ]),
    {
      text: t('收货地址'),
      value: (
        <div>
          {`\xa0${
            order_code_popover?.addresses?.addresses![0]?.address! || '-'
          }`}
        </div>
      ),
    },
  ]
  const OrderCodeTip = () => {
    return (
      <Flex column style={{ width: '250px', height: '200px' }}>
        {_.map(tip_list, (item, index) => {
          return (
            <Flex
              justifyStart
              key={index}
              className='gm-margin-top-10 gm-margin-left-10'
            >
              <span>{`${item.text}:`}</span>
              <span>{item.value}</span>
            </Flex>
          )
        })}
      </Flex>
    )
  }
  return (
    <>
      {(order_code && (
        <>
          <span className='gm-margin-right-5'>{order_code}</span>
          <Tooltip popup={OrderCodeTip} />
        </>
      )) ||
        '-'}
    </>
  )
})

interface RemarkProps {
  type: 'add' | 'detail'
}

const Remark: FC<RemarkProps> = observer(({ type }) => {
  // 确保在最后一行
  const { remark } = store.headerDetail

  const isAdd = type === 'add'

  const handleListRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    store.updateHeaderDetail('remark', value)
  }

  return isAdd ? (
    <Input
      type='text'
      value={remark || ''}
      className='form-control'
      maxLength={100}
      style={{ minWidth: '600px' }}
      onChange={handleListRemarkChange}
    />
  ) : (
    <div style={{ width: '500px' }} className='b-stock-in-content'>
      {remark || '-'}
    </div>
  )
})

interface HeaderDetailProps {
  type: 'add' | 'detail'
}
const HeaderDetail: FC<HeaderDetailProps> = observer((props) => {
  const { type } = props

  const renderHeaderInfo = () => {
    const { after_sales_code, after_status } = store.headerDetail
    return [
      {
        label: t('售后单号'),
        item: (
          <Space style={{ width: '280px' }}>
            {after_sales_code || '-'}
            {after_status > AfterSaleOrder_Status.STATUS_UNSPECIFIED && (
              <AfterSaleTag status={after_status as number} />
            )}
          </Space>
        ),
      },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    const { creator_name, create_time, customers } = store.headerDetail
    return [
      {
        label: t('商户名'),
        item: customers?.name! || '-',
      },
      {
        label: t('订单号'),
        item: <OrderCode type={type} />,
      },
      {
        label: t(''),
        item: '',
      },
      {
        label: t('新建时间'),
        item: (
          <div>
            {create_time
              ? moment(new Date(+create_time!)).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </div>
        ),
      },
      {
        label: t('建单人'),
        item: creator_name || '-',
      },
      {
        label: t('售后备注'),
        item: <Remark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    const {
      actual_refund_money,
      order_money,
      refundable_money,
      stock_out_money,
    } = store.summary

    const { order_id } = store.headerDetail

    return [
      {
        text: t('下单金额'),
        value: order_id ? <Price value={Number(order_money) || 0} /> : '-',
        left: false,
      },
      {
        text: t('出库金额'),
        value: order_id ? <Price value={Number(stock_out_money) || 0} /> : '-',
        left: false,
      },
      {
        text: t('申请退款金额'),
        value: <Price value={Number(refundable_money) || 0} />,
        left: false,
      },
      {
        text: t('实退金额'),
        value: <Price value={Number(actual_refund_money) || 0} />,
        left: false,
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentCol={3}
      contentLabelWidth={60}
      contentBlockWidth={250}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
