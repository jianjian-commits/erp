import React, { FC, ReactNode } from 'react'
import { t } from 'gm-i18n'
import { Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import './style.less'
interface BatchActionProps {
  /** 选中的数据 */
  selected: string[]
  isSelectAll: boolean
  toggleSelectAll: (params: boolean) => void
  onClose: () => void
  /** 总数量 */
  count?: number

  /** 禁用与非禁用根据判断状态下的ReactNode */
  ButtonNode: ReactNode
  className?: string
}
const BatchActionBarComponent: FC<BatchActionProps> = ({
  selected,
  count,
  ButtonNode,
  isSelectAll,
  toggleSelectAll,
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
    toggleSelectAll(!isSelectAll)
  }

  return (
    <Space size='middle' className={res.className}>
      {selected.length > 0 && (
        <>
          <CloseOutlined className='gm-cursour' onClick={handleClear} />
          <a className='bar_font' onClick={handleSelect}>
            {isSelectAll ? t('全选当前页') : t('全选所有页')}
          </a>
          <span className='bar_font'>
            {t('当前已选: ')}
            <span className='bar_font_count'>
              {isSelectAll ? count || t('所有') : selected.length}
            </span>
          </span>
        </>
      )}
      <Space size='middle'>{ButtonNode}</Space>
    </Space>
  )
}

export default BatchActionBarComponent
