/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, {
  ReactNode,
  forwardRef,
  useImperativeHandle,
  FC,
  useState,
} from 'react'
import { Table, Space, Button, Divider, Popconfirm, Checkbox, Card } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import { t } from 'gm-i18n'
// import './style.less'

const spaceStyle = { marginBottom: 16, backgroundColor: '#fff' }

const CheckboxStyle = { marginLeft: 56 }

interface TablebarProps {
  selectedRowKeys: string[]
  selectedAllPages: boolean
  onChange: (value: boolean) => void
  extraNode: ReactNode
}

const Tablebar: FC<TablebarProps> = (props) => {
  const { selectedRowKeys, selectedAllPages, onChange, extraNode } = props

  const [isAllPages, setIsAllPages] = useState(false)

  const onCheckChange = (e: CheckboxChangeEvent) => {
    if (typeof onChange === 'function') onChange(e.target.checked)
  }

  /** 勾选所有/当前页 */
  const handleSelectAll = () => {
    setIsAllPages(!isAllPages)
  }

  return (
    <Space style={spaceStyle} size='middle'>
      <Checkbox
        style={CheckboxStyle}
        checked={selectedAllPages}
        disabled={!selectedAllPages}
        onChange={onCheckChange}
      />
      {selectedAllPages && (
        <>
          <a onClick={handleSelectAll}>
            {isAllPages ? t('勾选所有页') : t('勾选当前页')}
          </a>
          <span>
            {t('已选商品：')}
            {isAllPages ? t('所有') : selectedRowKeys.length}
          </span>
        </>
      )}
      {extraNode}
    </Space>
  )
}

export default Tablebar
