import { t } from 'gm-i18n'
import React, { forwardRef, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  FormPanel,
  Form,
  FormItem,
  InputNumber,
  Flex,
  MoreSelect,
  MoreSelectDataItem,
} from '@gm-pc/react'
import _ from 'lodash'
import { Table } from '@gm-pc/table-x'
import { useGMLocation } from '@gm-common/router'
import type StoreType from '../store'

interface OperationProps {
  store: StoreType
}
const DinnerInfo = observer(
  forwardRef<Form, OperationProps>(({ store }, ref) => {
    const {
      setChildCustomer,
      mealTimesInfo,
      setStoreKey,
      meal_times_ids,
      viewType,
      quotationList,
      menuList,
      fetchMenuList,
    } = store

    const location = useGMLocation<{ menu_id: string; customer_id: string }>()
    const { menu_id, customer_id } = location.query
    useEffect(() => {
      if (viewType === 'Update') {
        getInfo()
      } else {
        fetchMenuList()
      }
    }, [quotationList])
    const getInfo = () => {
      const _menu_id = JSON.parse(menu_id)
      fetchMenuList().then((res) => {
        const menuSelected = _.find(res, (item) => item.value === _menu_id)
        setStoreKey('meal_times_ids', menuSelected ? [menuSelected] : [])
      })
    }
    return (
      <FormPanel title={t('用餐信息')}>
        <Form ref={ref} labelWidth='150px'>
          <FormItem label={t('关联菜谱')}>
            <MoreSelect
              data={menuList}
              selected={
                meal_times_ids[0]
                  ? meal_times_ids[0]
                  : {
                      text: t('未选择菜谱'),
                      value: undefined,
                    }
              }
              onSelect={(select: MoreSelectDataItem<string>[]) => {
                setStoreKey('meal_times_ids', select ? [select] : [])
              }}
            />
            <div className='gm-padding-5 gm-text-desc'>
              {t('关联菜谱信息，用于按菜谱时候，可选择菜谱内商品')}
            </div>
          </FormItem>
          <FormItem label={t('用餐人数')}>
            <>
              <Table<any>
                data={mealTimesInfo}
                style={{ width: '500px' }}
                columns={[
                  {
                    Header: t('餐次'),
                    accessor: 'name',
                  },
                  {
                    Header: t('用餐人数'),
                    id: 'dinning_count_map',
                    Cell: (cellProps) => (
                      <Observer>
                        {() => {
                          const {
                            childCustomer: { attrs },
                          } = store
                          const { menu_period_group_id } = cellProps.original
                          return (
                            <Flex alignCenter>
                              <InputNumber
                                value={
                                  attrs?.default_dining_count
                                    ?.dinning_count_map[menu_period_group_id] ??
                                  null
                                }
                                style={{ width: '80px' }}
                                max={9999}
                                precision={0}
                                onChange={(value: number) => {
                                  // 因为后台不能识别null，所以做这个处理
                                  setChildCustomer(
                                    `attrs.default_dining_count.dinning_count_map.${menu_period_group_id}`,
                                    value === null ? undefined : value,
                                  )
                                }}
                              />
                              人
                            </Flex>
                          )
                        }}
                      </Observer>
                    ),
                  },
                ]}
              />
              <div className='gm-padding-5 gm-text-desc'>
                {t(
                  '表明单餐次的默认用餐人数，按菜谱下单时可自动基于此计算数量',
                )}
              </div>
            </>
          </FormItem>
          <FormItem label={t('就餐日历')}>
            <Flex column>
              <a
                style={{ cursor: 'pointer', lineHeight: '27px' }}
                href='javascript:;'
                onClick={() => {
                  window.open(
                    `#/customer/society/menu_calendar?customer_id=${customer_id}`,
                  )
                }}
              >
                {t('设置日历')}
              </a>
              <div className='tw-w-max gm-text-desc '>
                {t(
                  '设置后可以按日历的形式设置每餐次的就餐人数，且按菜谱下单时将优先基于此计算数量',
                )}
              </div>
            </Flex>
          </FormItem>
        </Form>
      </FormPanel>
    )
  }),
)

export default DinnerInfo
