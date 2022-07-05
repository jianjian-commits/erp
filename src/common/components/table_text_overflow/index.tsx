import React from 'react'
import { Tooltip } from 'antd'
import { TABLE_TEXT_MAX_LENGTH } from '@/common/constants'
import './style.less'

interface TableTextOverflowProps {
  text: string
  maxLength?: number
}

/**
 * 表格文本超出的处理
 */
const TableTextOverflow = (props: TableTextOverflowProps) => {
  const { text = '-', maxLength = TABLE_TEXT_MAX_LENGTH } = props
  if (text.length < maxLength) return <>{text || '-'}</>
  return (
    <span>
      <Tooltip
        placement='bottom'
        title={<div className='b-table-text-overflow'>{text}</div>}
        mouseLeaveDelay={0.2}
      >
        <span>
          {text.slice(0, (maxLength || TABLE_TEXT_MAX_LENGTH) - 1) + '...'}
        </span>
      </Tooltip>
    </span>
  )
}

export default TableTextOverflow
