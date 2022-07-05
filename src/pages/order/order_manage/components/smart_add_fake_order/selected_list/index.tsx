import { t } from 'gm-i18n'
import _ from 'lodash'
import React from 'react'
import { MerchandiseShape } from '../store/types'
import { CloseCircleOutlined } from '@ant-design/icons'
import './index.less'

interface SelectedListProps {
  list?: MerchandiseShape[]
  onClear?: () => void
  onRemove?: (key: string) => void
}

const SelectedList: React.VFC<SelectedListProps> = (props) => {
  const { list, onRemove, onClear } = props

  const handleClear = () => {
    if (_.size(list) > 0) {
      onClear && onClear()
    }
  }

  return (
    <div className='smart_add_fake_order_selected_list'>
      <header className='tw-flex tw-mb-4 header'>
        <h3 className='headline'>
          {t('已选')}（{_.size(list)}）
        </h3>
        <button
          className='tw-ml-auto clear-btn'
          type='button'
          onClick={handleClear}
        >
          {t('清空已选')}
        </button>
      </header>
      <ul className='tw-m-0 list'>
        {_.map(list, (item) => (
          <li
            key={item.key}
            className='tw-flex list-item tw-items-center'
            style={{ marginBottom: 12 }}
          >
            {item.name}
            <CloseCircleOutlined
              className='remove-btn tw-ml-auto'
              onClick={() => {
                onRemove && onRemove(item.key)
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SelectedList
