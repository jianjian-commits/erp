import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  Price,
  Flex,
  Tip,
  Dialog,
} from '@gm-pc/react'
import { TableXUtil, BatchActionDefault } from '@gm-pc/table-x'
import TableTotalText from '@/common/components/table_total_text'
import DayList from './day_list'
import { useGMLocation } from '@gm-common/router'

const MenuDetailList = observer(() => {
  const location = useGMLocation<{ menu_id: string }>()
  const { menu_id } = location.query
  const {
    summary: { count, total_price },
    menuPeriodGroup,
  } = store

  return (
    <BoxTable
      info={
        store.selectedMenuIds.length ? (
          <TableXUtil.BatchActionBar
            pure
            onClose={() => store.changeSelectedAll()}
            batchActions={[
              {
                children: (
                  <BatchActionDefault>{t('生成订单')}</BatchActionDefault>
                ),
                onAction: () => {
                  Dialog.render({
                    title: t('生成订单'),
                    size: 'md',
                    children: (
                      <Flex column>
                        <div>{t('确定生成订单？')}</div>
                        <div className='gm-text-red'>
                          <p>{t('1.点击确定，订单将按照菜谱内配比生成；')}</p>
                          <p>
                            {t(
                              '2.仅“生效中和已完成未进入生产”状态的菜谱才可生成订单；',
                            )}
                          </p>
                          <p>
                            {t(
                              '3.生成订单后，菜谱将被标记为已进入生产，后续不可再进行编辑。',
                            )}
                          </p>
                        </div>
                      </Flex>
                    ),
                    buttons: [
                      {
                        text: t('取消'),
                        onClick: Dialog.hide,
                      },
                      {
                        text: t('确定'),
                        btnType: 'primary',
                        onClick: () => {
                          if (!store.selectedMenuIds.length) {
                            Tip.tip(t('没有可生成订单'))
                            return
                          }
                          store.batchCreateOrder().then((json) => {
                            Tip.success(t('生成订单成功'))
                            Dialog.hide()
                            store.fetchList(menu_id)
                            return json
                          })
                        },
                      },
                    ],
                  })
                },
              },
            ]}
            count={store.selectedMenuIds?.length}
          />
        ) : (
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('商品总数'),
                  content: count,
                },
                {
                  label: t('总售价'),
                  content: <Price value={+total_price! || 0} />,
                },
              ]}
            />
          </BoxTableInfo>
        )
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
