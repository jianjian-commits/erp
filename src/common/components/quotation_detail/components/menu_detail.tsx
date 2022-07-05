import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import _ from 'lodash'
import { BoxPanel, Flex, Button, RightSideModal, Tip } from '@gm-pc/react'
import MealDetail from './meal_detail'
import { useGMLocation } from '@gm-common/router'
import Status from './status'
import { getWeek } from '@/common/util'
import moment from 'moment'
import { getTableChildEditStatus } from '../util'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

interface MenuDetailProps {
  mealIndex: number
}

const MenuDetail: FC<MenuDetailProps> = observer(({ mealIndex }) => {
  const location = useGMLocation<{ quotation_id: string }>()
  const { quotation_id } = location.query
  const {
    details: { service_period_infos },
    menu_time,
    menu_status,
  } = store.editMenu
  const editStatus = getTableChildEditStatus()

  const handleSave = () => {
    const msg = store.checkMenuDetail()
    if (msg) {
      Tip.tip(msg)
    } else {
      store
        .save()
        .then(store.getList)
        .then(() => {
          Tip.success(t('修改成功'))
          RightSideModal.hide()
        })
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
        {/* todo 学生餐菜谱 */}
        {/* <div
          className={classNames(
            'b-menu-detail-label gm-margin-right-5 gm-text-12',
            `b-menu-detail-label-${state}`,
          )}
          style={{ padding: '2px 4px' }}
        >
          {map_MenuDetail_State[state]}
        </div> */}
        <Status
          menu_status={menu_status}
          className='gm-text-12 gm-margin-right-5 '
        />
        <span>{getWeek(menu_time)}</span>
        <span>({moment(menu_time).format('YYYY-MM-DD')})</span>
      </Flex>
      <Flex flex block className='gm-overflow-y'>
        {_.map(service_period_infos, (meal, index) => {
          return (
            <BoxPanel
              key={meal?.menu_period_group_id || '' + index}
              title={meal?.name}
              summary={[
                {
                  text: t('共计'),
                  value: _.filter(meal?.details, (m) => m?.sku_id)?.length,
                },
              ]}
              collapse={mealIndex === +index}
            >
              <MealDetail editStatus={editStatus} mealIndex={+index} />
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
          onClick={handleSave}
          disabled={
            store.filter.source === 'vegetables' &&
            !globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_UPDATE_CLEANFOOD_MENU_DETAIL,
            )
          }
        >
          {t('确定')}
        </Button>
      </Flex>
    </Flex>
  )
})

MenuDetail.displayName = 'MenuDetail'

export default MenuDetail
