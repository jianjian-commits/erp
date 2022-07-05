import globalStore from '@/stores/global'
import SVGDelete from '@/svg/delete.svg'
import SVGEdit from '@/svg/edit_pen.svg'
import SVGPlus from '@/svg/plus.svg'
import { Dialog, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { FC, MouseEvent } from 'react'
import { ProcessorItem } from '../../interface'
import store from '../../store'
import ActionDropdown from './action_dropdown'

interface ActionsProps {
  item: ProcessorItem
  menu: ProcessorItem[]
  isDefault?: boolean
}

const Actions: FC<ActionsProps> = observer(({ item, menu, isDefault }) => {
  const editItem = () => {
    store.updateFactoryModalItem(
      item.parent_id || '',
      item.processor_id,
      'edit',
      true,
    )
  }

  const handleCancel = () => {
    Dialog.hide()
  }

  const handleEnsure = () => {
    Dialog.hide()
    // 调用删除工厂模型
    let new_processor_id = ''
    store
      .deleteFactoryModal(item.processor_id)
      .then((json) => {
        Tip.success('删除成功')
        const { processor } = json.response
        new_processor_id = processor?.parent_id || ''
        return store.getFactoryModalList()
      })
      .then((json) => {
        if (json) {
          const { factory_modal_list } = store
          const index = _.findIndex(
            factory_modal_list,
            (m) => m.processor_id === new_processor_id,
          )
          if (index !== -1) {
            const list = toJS(factory_modal_list)
            list[index].expand = true
            store.updateFactoryModalList(list)
          }
        }
        return json
      })
  }

  const deleteItem = () => {
    Dialog.render({
      title: t('删除工厂模型'),
      buttons: [
        {
          text: t('取消'),
          onClick: handleCancel,
        },
        {
          text: t('确定'),
          onClick: handleEnsure,
          btnType: 'primary',
        },
      ],
      children: t(
        '删除该工厂模型会将该工厂模型的子级模型同步删除，请确认是否删除',
      ),
    })
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div
      className='b-factory-list-icon b-factory-list-icon-right'
      onClick={handleClick}
    >
      {globalStore.hasPermission(
        Permission.PERMISSION_PRODUCTION_CREATE_PROCESSOR,
      ) && (
        <ActionDropdown item={item} menu={menu} isDefault={isDefault}>
          <span>
            <SVGPlus />
          </span>
        </ActionDropdown>
      )}
      {!isDefault && (
        <>
          {globalStore.hasPermission(
            Permission.PERMISSION_PRODUCTION_UPDATE_PROCESSOR,
          ) && (
            <span onClick={editItem}>
              <SVGEdit />
            </span>
          )}
          {globalStore.hasPermission(
            Permission.PERMISSION_PRODUCTION_DELETE_PROCESSOR,
          ) && (
            <span onClick={deleteItem}>
              <SVGDelete />
            </span>
          )}
        </>
      )}
    </div>
  )
})

export default Actions
