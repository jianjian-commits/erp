import React, { ReactNode } from 'react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { Price } from '@gm-pc/react'
import { Observer, observer } from 'mobx-react'
import globalStore from '@/stores/global'
import { Button, Modal, message } from 'antd'
import moment from 'moment'
import { t } from 'gm-i18n'
import { ADVANCE_ORDER, CYCLE } from '../../enum'
import store from '../store'
import { useGMLocation } from '@gm-common/router'
import _ from 'lodash'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { confirm } = Modal
interface Block {
  text: string | ReactNode
  value: ReactNode
}

const Header = observer(() => {
  let priceBlock: Block[] = []
  const { advanced_order } = store
  priceBlock = [
    {
      text: t('预付金额'),
      value: (
        <Observer>
          {() => (
            <Price
              value={+advanced_order.amount! || 0}
              precision={globalStore.dpOrder}
            />
          )}
        </Observer>
      ),
    },
    {
      text: t('未就餐金额'),
      value: (
        <Observer>
          {() => (
            <Price
              value={+advanced_order.no_eat_amount! || 0}
              precision={globalStore.dpOrder}
            />
          )}
        </Observer>
      ),
    },
    {
      text: t('实退金额'),
      value: (
        <Observer>
          {() => (
            <Price
              value={+advanced_order.refund_amount! || 0}
              precision={globalStore.dpOrder}
            />
          )}
        </Observer>
      ),
    },
  ]
  const location = useGMLocation<{ advanced_order_id: string }>()

  const handleRefun = () => {
    confirm({
      title: t('删除'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确认退款单号为${location.query.advanced_order_id}的订单吗？`),
      onOk() {
        store.refun(location.query.advanced_order_id).then(() => {
          message.success(t('退款成功!'))
          store.getDetail(location.query.advanced_order_id)
        })
      },
    })
  }
  return (
    <ReceiptHeaderDetail
      contentCol={4}
      customerContentColWidth={[350, 350, 350, 350]}
      totalData={priceBlock}
      HeaderInfo={[
        {
          label: t('预付单号'),
          item: <div>{advanced_order.serial_no || ''}</div>,
        },
        {
          label: t('状态'),
          item: <div>{ADVANCE_ORDER[advanced_order.state!] || ''}</div>,
        },
      ]}
      HeaderAction={
        advanced_order.state === 4 && (
          <Button onClick={handleRefun}>{t('退款')}</Button>
        )
      }
      ContentInfo={[
        {
          label: <div style={{ textAlign: 'left' }}>{t('下单日期')}</div>,
          item: moment(+advanced_order?.order_date! || '').format('YYYY-MM-DD'),
        },
        {
          label: t('学校'),
          item: advanced_order.student?.school_name! || '',
        },
        {
          label: t('订单周期'),
          item: CYCLE[Number(advanced_order?.cycle! || 0)] || '',
        },
        {
          label: t('班级'),
          item: advanced_order.student?.class_name || '',
        },
        {
          label: t('订餐餐次'),
          item:
            _.map(
              advanced_order.menu_period_desc?.menu_period_groups,
              (item) => item.name,
            ).join(',') || '',
        },
        {
          label: t('学生姓名'),
          item: advanced_order.student?.name! || '',
        },
        {
          label: t('家长姓名'),
          item: advanced_order.student?.parent_name! || '',
        },
        {
          label: t('家长联系方式'),
          item: advanced_order.student?.parent_phone! || '',
        },
      ]}
    />
  )
})

export default Header
