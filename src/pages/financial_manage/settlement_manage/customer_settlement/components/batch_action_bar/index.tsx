import React, { FC, ReactNode, useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import { Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import './style.less'
import { AllSelect_Types } from '@/pages/financial_manage/settlement_manage/customer_settlement/constant'
import _ from 'lodash'
interface BatchActionProps {
  /** 选中的数据 */
  selected: string[]
  allSelectType?: AllSelect_Types
  //   isSelectAll: boolean
  changeAllSelectType: (params?: AllSelect_Types) => void
  onClose: () => void

  /** 禁用与非禁用根据判断状态下的ReactNode */
  ButtonNode: ReactNode
  className?: string
}

const allSelectTypes = {
  [AllSelect_Types.ALL_CUSTOMER]: t('全选同客户订单'),
  [AllSelect_Types.ALL_COMPANY]: t('全选同公司订单'),
}

const BatchActionBarComponent: FC<BatchActionProps> = ({
  selected,
  ButtonNode,
  allSelectType,
  changeAllSelectType,
  onClose,
  ...res
}) => {
  const handleClear = (e: any) => {
    if (typeof onClose !== 'function') return
    e.stopPropagation()
    onClose()
  }
  /** @description 操作当前页与所有页 */
  const handleSelect = (e: any) => {
    e.stopPropagation()
    const selectedType = !_.isNil(allSelectType)
      ? allSelectType === AllSelect_Types.ALL_CUSTOMER
        ? AllSelect_Types.ALL_COMPANY
        : AllSelect_Types.ALL_CUSTOMER
      : AllSelect_Types.ALL_CUSTOMER
    changeAllSelectType(selectedType)
  }

  return (
    <Space size='middle' className={res.className}>
      {selected.length > 0 && (
        <>
          <CloseOutlined className='gm-cursour' onClick={handleClear} />
          <a className='bar_font' onClick={handleSelect}>
            {
              allSelectTypes[
                (allSelectType === AllSelect_Types.ALL_CUSTOMER
                  ? AllSelect_Types.ALL_COMPANY
                  : AllSelect_Types.ALL_CUSTOMER) ||
                  AllSelect_Types.ALL_CUSTOMER
              ]
            }
          </a>
          <span className='bar_font'>
            {t('当前已选: ')}
            <span className='bar_font_count'>
              {allSelectType ? allSelectTypes[allSelectType] : selected.length}
            </span>
          </span>
        </>
      )}
      <Space size='middle'>{ButtonNode}</Space>
    </Space>
  )
}

export default BatchActionBarComponent
