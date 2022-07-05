/**
 *  @description 报价单状态标签
 */
import { Tag } from 'antd'
import { t } from 'gm-i18n'
import { Quotation_Status } from 'gm_api/src/merchandise'
import React, { FC } from 'react'

interface QuotationStatusTagProps {
  status: Quotation_Status
}

interface TagItem {
  /** 同后台状态值 */
  id: number
  label: string
  color: string
  className: string
}

const QuotationStatusTag: FC<QuotationStatusTagProps> = ({ status }) => {
  const tagObj: {
    [key: number]: TagItem
  } = {
    [Quotation_Status.STATUS_WAIT_AUDIT]: {
      id: 5,
      label: t('待审核'),
      color: '#C2D9FF',
      className: '',
    },
    [Quotation_Status.STATUS_WAIT_VALID]: {
      id: 1,
      label: t('禁用'),
      color: '#ccc',
      className: '',
    },
    [Quotation_Status.STATUS_VALID]: {
      id: 2,
      label: t('启用'),
      color: '#87d068',
      className: '',
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
    return <></>
  }

  return <>{tag()}</>
}

export default QuotationStatusTag
