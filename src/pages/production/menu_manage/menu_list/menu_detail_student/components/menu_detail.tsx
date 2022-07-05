import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import _ from 'lodash'
import { BoxPanel, Flex, RightSideModal, Tip } from '@gm-pc/react'
import { Button } from 'antd'
import MealDetail from './meal_detail'
import { useGMLocation } from '@gm-common/router'
import { getWeek } from '@/common/util'
import moment from 'moment'
import Big from 'big.js'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

interface MenuDetailProps {
  mealIndex: number
}

const MenuDetail: FC<MenuDetailProps> = observer(({ mealIndex }) => {
  const location = useGMLocation<{ menu_id: string }>()
  useEffect(() => {
    return () => {
      store.setDelMeals([])
    }
  }, [])
  const { menu_id } = location.query
  const periodInfos = _.get(store.editMenu, 'periodInfos', [])
  const menu_time = _.get(store.editMenu, 'menu_time', '')

  const handleCreate = () => {
    store
      .handleCreateOrEditMenu()
      .then(() => {
        Tip.success(t('保存成功'))
        RightSideModal.hide()
        return store.fetchList(menu_id)
      })
      .then(() => store.generateMenuList(menu_id))
  }

  const handleSave = () => {
    if (store.delMeals.length > 0) {
      store.handleDeleteMenuSku().then(() => handleCreate())
    } else {
      handleCreate()
    }
  }

  const handleCancel = () => {
    RightSideModal.hide()
  }

  return (
    <Flex column style={{ height: '100%', maxHeight: '100%' }}>
      <Flex
        alignCenter
        style={{ height: '40px' }}
        className='gm-padding-lr-20 gm-border-bottom'
      >
        <span>{getWeek(menu_time)}</span>
        <span>({moment(menu_time).format('YYYY-MM-DD')})</span>
      </Flex>
      <Flex flex block className='gm-overflow-y'>
        {_.map(periodInfos, (meal, index) => {
          return (
            <BoxPanel
              key={meal?.menu_period_group_id || '' + index}
              title={meal?.name}
              summary={[
                {
                  text: t('餐标'),
                  value: `${Big(meal.price || 0).toFixed(2)}元`,
                },
              ]}
              collapse={mealIndex === +index}
            >
              <MealDetail mealIndex={+index} />
            </BoxPanel>
          )
        })}
      </Flex>
      <Flex justifyEnd className='gm-padding-10 gm-border-top'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button
          type='primary'
          htmlType='submit'
          disabled={
            !globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_UPDATE_MENU_DETAIL,
            )
          }
          onClick={handleSave}
        >
          {t('确定')}
        </Button>
      </Flex>
    </Flex>
  )
})

export default MenuDetail
