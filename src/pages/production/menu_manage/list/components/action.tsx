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
    const {
      name,
      icon,
      default_receive_time,
      order_receive_min_date,
      order_create_min_time,
    } = store.menu_period_[index]
    handleUpdateList('isEditing', false)
    handleUpdateList('name', name)
    handleUpdateList('icon', icon)
    handleUpdateList('default_receive_time', default_receive_time)
    handleUpdateList('order_receive_min_date', order_receive_min_date)
    handleUpdateList('order_create_min_time', order_create_min_time)
  }

  const handleEditMealTimeSave = () => {
    const {
      name,
      order_create_min_time,
      order_receive_min_date,
      default_receive_time,
    } = store.menu_period[index]

    if (!name) {
      Tip.danger(t('餐次名称不为空'))
      return
    }
    if (!order_receive_min_date) {
      Tip.danger('截止下单天数不为空')
      return
    }
    if (!order_create_min_time) {
      Tip.danger(t('请选择截止下单时间'))
      return
    }
    if (!default_receive_time) {
      Tip.danger(t('请选择默认收货时间'))
      return
    }
    store.updateMealTimes(index).then(() => {
      Tip.success(t('修改成功'))
      handleUpdateList('isEditing', false)
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
          Permission.PERMISSION_MERCHANDISE_UPDATE_MENU_PERIOD,
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
              Permission.PERMISSION_MERCHANDISE_DELETE_MENU_PERIOD,
            )
          }
          title={t('删除餐次')}
          onClick={handleDelete}
          read={t('我已阅读以上提示， 确认要删除餐次')}
        >
          <div>{t('确定要删除所选餐次吗？')}</div>
          <div className='gm-text-red gm-padding-top-10'>
            <div>{t('1.存在未进入生产的团餐订单的餐次将无法被删除')}</div>
            <div>{t('2.删除后菜谱中引用的该餐次将不显示')}</div>
            <div>{t('3.删除后餐次相关数据将无法恢复，请谨慎操作')}</div>
          </div>
        </OperationDelete>
      )}
    </OperationCellRowEdit>
  )
})

export default Action
