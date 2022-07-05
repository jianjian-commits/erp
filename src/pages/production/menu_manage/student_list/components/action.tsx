import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { TableXUtil } from '@gm-pc/table-x'
import { Tip } from '@gm-pc/react'
import store from '../store'
import '../style.less'
import { Permission } from 'gm_api/src/enterprise'
import { Menu_Period } from '../interface'
import globalStore from '@/stores/global'

interface ActionProps {
  index: number
  isEditing: boolean
}

const { OperationCellRowEdit, OperationDelete } = TableXUtil

const Action: FC<ActionProps> = observer(({ index, isEditing }) => {
  const handleUpdateList = <T extends keyof Menu_Period>(
    name: T,
    value: Menu_Period[T],
  ) => {
    store.updateListColumn(index, name, value)
  }

  const handleEditMealTimeCancel = () => {
    const { name, icon } = store.menu_period[index]
    handleUpdateList('isEditing', false)
    handleUpdateList('name', name)
    handleUpdateList('icon', icon)
  }

  const handleEditMealTimeSave = () => {
    const { name } = store.menu_period[index]

    if (!name) {
      Tip.danger(t('餐次名称不为空'))
      return
    }

    store.updateMealTimes(index).then(() => {
      Tip.success(t('修改成功'))
      handleUpdateList('isEditing', false)
      store.fetchMealList()
      return null
    })
  }

  const handleDelete = () => {
    store.deleteMealTimes(index)
  }

  return (
    <OperationCellRowEdit
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_MERCHANDISE_UPDATE_ESHOP_MENU_PERIOD,
        )
      }
      isEditing={isEditing}
      onClick={() => handleUpdateList('isEditing', true)}
      onCancel={handleEditMealTimeCancel}
      onSave={handleEditMealTimeSave}
    >
      {!isEditing && (
        <OperationDelete
          disabled={
            !globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_DELETE_ESHOP_MENU_PERIOD,
            )
          }
          title={t('删除餐次')}
          onClick={handleDelete}
          read={t('我已阅读以上提示， 确认要删除餐次')}
        >
          <div>{t('确定要删除所选餐次吗？')}</div>
          <div className='gm-text-red gm-padding-top-10'>
            <div>{t('1.如餐次在菜谱中应用,将无法删除！')}</div>
            <div>{t('2.删除后菜谱中引用的该餐次将不显示')}</div>
            <div>{t('3.删除后餐次相关数据将无法恢复，请谨慎操作')}</div>
          </div>
        </OperationDelete>
      )}
    </OperationCellRowEdit>
  )
})

export default Action
