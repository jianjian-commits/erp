import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { BoxTable, BoxTableInfo, Button, Price, Flex } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import DayList from './day_list'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'

const MenuDetailList = observer(() => {
  const {
    summary: { count, total_price },
    menuPeriodGroup,
  } = store

  const createDisabled =
    store.checkDateArr.every((e) => e === false) ||
    store.checkPeriodArr.every((e) => e === false)

  const handleCreateOrder = () => {
    const menu_detail_ids = store.collectMenuDetailIds()
    store.createOrder(menu_detail_ids).then(() => {
      globalStore.showTaskPanel('1')
    })
  }

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <Flex alignCenter>
            <div className='tw-mr-3'>{store.menuName}</div>
            <TableTotalText
              data={[
                {
                  label: t('商品总数'),
                  content: count,
                },
                {
                  label: t('总售价'),
                  content: <Price value={+total_price || 0} />,
                },
              ]}
            />
          </Flex>
        </BoxTableInfo>
      }
      action={
        <>
          <PermissionJudge
            permission={Permission.PERMISSION_MERCHANDISE_MENU_CREATE_ORDER}
          >
            <Button
              type='primary'
              onClick={handleCreateOrder}
              disabled={createDisabled}
            >
              {t('生成订单')}
            </Button>
          </PermissionJudge>
        </>
      }
    >
      {menuPeriodGroup.length ? (
        <DayList />
      ) : (
        <Flex alignCenter justifyCenter style={{ height: '160px' }}>
          <span style={{ lineHeight: '31px' }}>{t('暂未设置餐次，')}</span>
          <Button
            type='link'
            size='small'
            onClick={() => window.open('#/menu/menu_manage/list')}
          >
            {t('去设置')}
          </Button>
        </Flex>
      )}
    </BoxTable>
  )
})

export default MenuDetailList
