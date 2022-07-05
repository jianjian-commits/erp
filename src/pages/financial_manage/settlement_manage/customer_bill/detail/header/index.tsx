import React from 'react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { t } from 'gm-i18n'
import { Price } from '@gm-pc/react'
import globalStore from '@/stores/global'
import HeaderTip from '@/common/components/header_tip'

import './index.less'

const EMPTY_ARR: any[] = []

export interface HeaderProps {
  /** 应付金额 */
  amountPayable?: string
  /** 已付金额 */
  amountPaid?: string
  /** 未付金额 */
  outstandingAmount?: string
  /** 售后金额 */
  amountAfterSale?: string
  /** 待结金额 */
  amountToBeSettled?: string
  /** 客户名称 */
  customerName?: string
  /** 账单周期 */
  billingDate?: string
}

const Header: React.FC<HeaderProps> = (props) => {
  const {
    amountAfterSale = '',
    amountPaid = '',
    outstandingAmount = '',
    amountPayable = '',
    amountToBeSettled = '',
    children = '',
    customerName = '',
    billingDate,
  } = props

  return (
    <ReceiptHeaderDetail
      className='customer_bill_detail_header'
      totalData={[
        {
          left: true,
          text: (
            <HeaderTip
              header={t('待结金额')}
              tip={t('待结算金额 = 订单未付金额 - 订单售后金额')}
            />
          ),
          value: (
            <Price value={amountToBeSettled} precision={globalStore.dpOrder} />
          ),
        },
        {
          text: t('应付金额'),
          value: (
            <Price value={amountPayable} precision={globalStore.dpOrder} />
          ),
        },
        {
          text: t('已付金额'),
          value: <Price value={amountPaid} precision={globalStore.dpOrder} />,
        },
        {
          text: (
            <HeaderTip
              header={t('未付金额')}
              tip={t('仅为销售订单的未付金额，不包含售后金额')}
            />
          ),
          value: (
            <Price value={outstandingAmount} precision={globalStore.dpOrder} />
          ),
        },
        {
          text: t('售后金额'),
          value: (
            <Price value={amountAfterSale} precision={globalStore.dpOrder} />
          ),
        },
      ]}
      HeaderInfo={[
        { label: t('客户名'), item: customerName },
        { label: t('账单周期'), item: billingDate },
      ]}
      ContentInfo={EMPTY_ARR}
      HeaderAction={children}
    />
  )
}

export default Header
