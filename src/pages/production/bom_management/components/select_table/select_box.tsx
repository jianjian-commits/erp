import React, { ReactNode, Key } from 'react'
import './style.less'
import { t } from 'gm-i18n'
import { CloseCircleOutlined } from '@ant-design/icons'

interface SelectBoxProps<T> {
  selectedRows: T[]
  selectedKey: keyof T
  handleClear: () => void
  handleClose: (id: T[keyof T]) => void
  rowKey: keyof T
  extraKey?: keyof T
  extraName: ReactNode | undefined
  disabledList: Key[]
}

const SelectBox = <T extends object>(props: SelectBoxProps<T>) => {
  const {
    selectedRows,
    handleClear,
    handleClose,
    rowKey,
    selectedKey,
    extraKey,
    extraName,
  } = props
  const isSelected = selectedRows && selectedRows.length > 0

  const onClear = () => {
    if (typeof handleClear === 'function') handleClear()
  }

  const onClose = (id: T[keyof T]) => {
    if (typeof handleClose === 'function') handleClose(id)
  }

  return (
    <div className='merchandise-select-table-box'>
      <div className='select-table-box-title'>
        <div className='select-table-box-title-choose'>
          {t('已选')}（{selectedRows.length}）
        </div>
        {isSelected && (
          <div className='select-table-box-title-clear' onClick={onClear}>
            {t('清空已选')}
          </div>
        )}
      </div>

      {isSelected &&
        selectedRows.map((item, index: number) => {
          let title: ReactNode = ''
          if (extraKey && item[extraKey] && extraName) {
            title = `${item[selectedKey]}(${extraName}:${item[extraKey]})`
          } else {
            title = item[selectedKey]
          }
          return (
            <div className='select-table-box-content' key={index}>
              {/* 已选择的text，默认取rowKey */}
              <div
                className='select-table-box-content-title'
                title={title as string}
              >
                {title}
              </div>
              <div
                className='select-table-box-content-clear'
                onClick={() => onClose(item[rowKey])}
              >
                <CloseCircleOutlined />
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default SelectBox
