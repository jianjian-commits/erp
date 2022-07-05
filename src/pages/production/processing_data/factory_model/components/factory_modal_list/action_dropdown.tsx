import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'
import { observer } from 'mobx-react'

import { ProcessorItem } from '../../interface'
import store from '../../store'

interface ActionDropDownProps {
  item: ProcessorItem
  menu: ProcessorItem[]
  isDefault?: boolean
}

const ActionDropDown: FC<ActionDropDownProps> = observer(
  ({ item, menu, children, isDefault }) => {
    const { processor_id, parent_id } = item
    const [showMenu, setShowMenu] = useState(false) // 显示下拉菜单状态
    const showDropdown = () => setShowMenu(!showMenu)

    // 全局监听点击事件关闭浮层
    if (showMenu) {
      window.addEventListener('click', showDropdown)
    } else {
      window.removeEventListener('click', showDropdown)
    }

    const addProcessor = (
      parent_id: string | undefined,
      menu: ProcessorItem[],
    ) => {
      store.updateFactoryModalItem(
        item.parent_id || '',
        item.processor_id,
        'showIcon',
        false,
      )
      // 判断当前是否还存在未编辑完成item
      if (_.some(menu, (item) => item.edit)) {
        Tip.danger('当前还有未编辑完成的模型，请完成后重试！')
        return
      }
      if (parent_id === processor_id) {
        store.updateFactoryModalItem(
          item.parent_id || '',
          item.processor_id,
          'expand',
          true,
        )
      }

      store.addNewFactoryModalItem(parent_id || '')
    }

    const addModal = () => {
      addProcessor(parent_id, menu)
    }

    const addModalChildren = () => {
      addProcessor(processor_id, item.children)
    }

    // 目前工厂模型只有两层，第二层无法建立子级模型
    return (
      <div className='b-factory-list-dropdown' onClick={showDropdown}>
        {children}
        {showMenu && (
          <div className='b-factory-list-dropdown-menu'>
            <ul>
              <li onClick={addModal}>{t('新建同级模型')}</li>
              {!isDefault && parent_id === '0' && (
                <li onClick={addModalChildren}>{t('新建子级模型')}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    )
  },
)

export default ActionDropDown
