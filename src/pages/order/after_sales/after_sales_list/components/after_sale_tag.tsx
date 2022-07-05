/**
 *  @description 售后单状态标签
 */
import { Tag } from 'antd'
import { t } from 'gm-i18n'
import { AfterSaleOrder_Status } from 'gm_api/src/aftersale'
import React, { FC } from 'react'
import '../style.less'

interface AfterSaleTagProps {
  status: AfterSaleOrder_Status
}

interface TagItem {
  /** 同后台状态值 */
  id: number
  label: string
  color: string
  className: string
}

/**
 * 周期报价单状态标签
 */
const AfterSaleTag: FC<AfterSaleTagProps> = ({ status }) => {
  const tagObj: {
    [key: number]: TagItem
  } = {
    [AfterSaleOrder_Status.STATUS_TO_SUBMIT]: {
      id: 1,
      label: t('待提交'),
      color: 'blue',
      className: '',
    },
    [AfterSaleOrder_Status.STATUS_TO_REVIEWED]: {
      id: 6,
      label: t('待审核'),
      color: 'blue',
      className: '',
    },
    [AfterSaleOrder_Status.STATUS_TO_RETURNED]: {
      id: 7,
      label: t('待退货'),
      color: 'red',
      className: 'after_sale_status_return',
    },
    [AfterSaleOrder_Status.STATUS_TO_REFUND]: {
      id: 8,
      label: t('待退款'),
      color: 'default',
      className: 'after_sale_status_return',
    },
    [AfterSaleOrder_Status.STATUS_REFUNDED]: {
      id: 9,
      label: t('已退款'),
      color: 'default',
      className: 'after_sale_status_expired',
    },
  }

  const tag = () => {
    if (status in tagObj) {
      const { label, color, className } = tagObj[status]
      return (
        <Tag className={className} color={color}>
          {label}
        </Tag>
      )
    }
    return <>-</>
  }

  return <>{tag()}</>
}

export default AfterSaleTag
