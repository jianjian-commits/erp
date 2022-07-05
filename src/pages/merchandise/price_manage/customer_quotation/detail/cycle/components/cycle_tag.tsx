/**
 *  @description 周期报价单子报价单状态标签
 */
import { Tag } from 'antd'
import { t } from 'gm-i18n'
import { Quotation_Status } from 'gm_api/src/merchandise'
import React, { FC } from 'react'

interface CycleStatusTagProps {
  status: Quotation_Status
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
const CycleStatusTag: FC<CycleStatusTagProps> = ({ status }) => {
  const tagObj: {
    [key: number]: TagItem
  } = {
    [Quotation_Status.STATUS_WAIT_AUDIT]: {
      id: 5,
      label: t('待审核'),
      color: 'blue',
      className: '',
    },
    [Quotation_Status.STATUS_AVAILABLE]: {
      id: 7,
      label: t('进行中'),
      color: 'green',
      className: '',
    },
    [Quotation_Status.STATUS_WAIT_VALID]: {
      id: 1,
      label: t('禁用中'),
      color: 'red',
      className: '',
    },
    [Quotation_Status.STATUS_WAIT_AVAILABLE]: {
      id: 6,
      label: t('未开始'),
      color: 'default',
      className: 'cycle_quotation_status_expired',
    },
    [Quotation_Status.STATUS_EXPIRED]: {
      id: 8,
      label: t('已过期'),
      color: 'default',
      className: 'cycle_quotation_status_expired',
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

export default CycleStatusTag
