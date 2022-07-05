import React from 'react'
import { t } from 'gm-i18n'
import {
  BoxTable,
  Dialog,
  Input,
  InputNumber,
  Flex,
  BoxTableInfo,
  TimeSpanPicker,
  Delete,
  Modal,
} from '@gm-pc/react'
import {
  Table,
  BatchActionDelete,
  BatchActionDefault,
  TableXUtil,
  Column,
} from '@gm-pc/table-x'
import moment from 'moment'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import store from '../store'
import { MToDate, dateTMM } from '@/common/util'
import HeaderTip from '@/common/components/header_tip'
import Action from './action'
import CreateMealTimes from './create'
import { Menu_Period } from '../interface'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import EditMenu from './edit_menu'

const { TABLE_X } = TableXUtil

const List = () => {
  const { menu_period } = store

  const handleUpdateListColumn = <T extends keyof Menu_Period>(
    index: number,
    key: T,
    value: Menu_Period[T],
  ) => {
    store.updateListColumn(index, key, value)
  }

  const handleDayChange = (
    index: number,
    value: number | null,
    field: 'order_receive_min_date' | 'default_receive_date',
  ) => {
    const new_value = value === null ? '' : value + ''
    handleUpdateListColumn(index, field, new_value)
  }

  const handleCancel = (index: number) => {
    const { name, icon } = store.menu_period_[index]
    handleUpdateListColumn(index, 'name', name)
    handleUpdateListColumn(index, 'icon', icon)
    Modal.hide()
  }

  const columns: Column[] = [
    {
      Header: t('序号'),
      id: 'index',
      width: TABLE_X.WIDTH_NO,
      Cell: (cellProps) => cellProps.index + 1,
    },
    {
      Header: t('餐次'),
      accessor: 'name',
      minWidth: 100,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { name, isEditing, icon } = cellProps.original
              const index = cellProps.index
              if (!isEditing) {
                return (
                  <Flex alignCenter>
                    <img src={icon?.url} className='b_icon_size' />
                    <span className='gm-margin-left-5'>{name}</span>
                  </Flex>
                )
              }
              return (
                <div className='b-list-detail'>
                  <img src={icon?.url} className='b-list-icon b_icon_size' />
                  <Input
                    className='b-list-input'
                    value={name}
                    onClick={() => {
                      Modal.render({
                        title: t('餐次编辑'),
                        size: 'md',
                        children: (
                          <EditMenu
                            index={index}
                            onChange={handleUpdateListColumn}
                            onCancel={handleCancel}
                          />
                        ),
                        onHide: () => handleCancel(index),
                      })
                    }}
                  />
                </div>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: (
        <HeaderTip
          header={t('截止下单时间')}
          tip={t(
            '如下9月10日的早餐，若设置“当天前2天，08：00”，则最晚要在9月8日 08：00前进行下单',
          )}
        />
      ),
      accessor: 'order_create_min_time',
      minWidth: 100,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                order_create_min_time,
                order_receive_min_date,
                isEditing,
              } = cellProps.original
              const _order_create_min_time = moment(
                MToDate(+order_create_min_time),
              ).format('HH:mm')
              if (!isEditing) {
                return (
                  <span>{`当天前${Number(
                    order_receive_min_date,
                  )}天，${_order_create_min_time}`}</span>
                )
              }
              const _order_receive_min_date =
                order_receive_min_date === ''
                  ? null
                  : parseFloat(order_receive_min_date)
              return (
                <Flex justifyStart alignCenter>
                  <span>{t('当天前')}</span>
                  <InputNumber
                    style={{ width: '100px' }}
                    min={0}
                    max={15}
                    placeholder={t('请输入天数')}
                    value={_order_receive_min_date}
                    onChange={(value) => {
                      handleDayChange(
                        cellProps.index,
                        value,
                        'order_receive_min_date',
                      )
                    }}
                    precision={0}
                  />
                  <span className='gm-margin-right-10'>{t('天')}</span>
                  <TimeSpanPicker
                    style={{ width: '100px' }}
                    date={MToDate(+order_create_min_time)}
                    onChange={(date: Date) => {
                      const min_time = moment(date).add(1, 'ms')
                      const max_time = moment(date)
                      store.setLockStatus(true)
                      handleUpdateListColumn(
                        cellProps.index,
                        'order_create_min_time',
                        dateTMM(min_time.toDate()),
                      )
                      handleUpdateListColumn(
                        cellProps.index,
                        'order_create_max_time',
                        dateTMM(max_time.toDate()),
                      )
                    }}
                  />
                </Flex>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: (
        <HeaderTip
          header={t('默认收货日期')}
          tip={t(
            '如下9月2日的早餐，若设置“当天前1天，08：00”，则9月2日早餐的收货日期为9月1日 08：00',
          )}
          // right
        />
      ),
      accessor: 'receipt_date',
      minWidth: 100,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { default_receive_time, default_receive_date, isEditing } =
                cellProps.original
              const _order_receive_min_time = moment(
                MToDate(+default_receive_time),
              ).format('HH:mm')
              if (!isEditing) {
                return (
                  <span>{`当天前${Number(
                    default_receive_date,
                  )}天，${_order_receive_min_time}`}</span>
                )
              }
              const _default_receive_date =
                default_receive_date === ''
                  ? null
                  : parseFloat(default_receive_date)
              return (
                <Flex justifyStart alignCenter>
                  <span>{t('当天前')}</span>
                  <InputNumber
                    style={{ width: '100px' }}
                    min={0}
                    max={15}
                    placeholder={t('请输入天数')}
                    value={_default_receive_date}
                    onChange={(value) => {
                      handleDayChange(
                        cellProps.index,
                        value,
                        'default_receive_date',
                      )
                    }}
                    precision={0}
                  />
                  <span className='gm-margin-right-10'>{t('天')}</span>
                  <TimeSpanPicker
                    style={{ width: '100px' }}
                    date={MToDate(+default_receive_time)}
                    onChange={(date: Date) => {
                      const min_time = moment(date)

                      handleUpdateListColumn(
                        cellProps.index,
                        'default_receive_time',
                        dateTMM(min_time.toDate()),
                      )
                    }}
                  />
                </Flex>
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: TableXUtil.OperationHeader,
      accessor: 'operation',
      width: TABLE_X.WIDTH_SELECT,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                index,
                original: { isEditing },
              } = cellProps

              return <Action index={index} isEditing={isEditing} />
            }}
          </Observer>
        )
      },
    },
  ]

  // 批量删除
  const handleDeleteMeal = (selected: string[], isSelectAll: boolean) => {
    Delete({
      title: t('删除餐次'),
      children: (
        <>
          <div>{t('确定要删除所选餐次吗？')}</div>
          <div className='gm-text-red gm-padding-top-10'>
            <div>{t('1.存在未进入生产的团餐订单的餐次将无法被删除')}</div>
            <div>{t('2.删除后菜谱中引用的该餐次将不显示')}</div>
            <div>{t('3.删除后餐次相关数据将无法恢复，请谨慎操作')}</div>
          </div>
        </>
      ),
      read: true,
    }).then(() => {
      return store.batchDeleteMealTimes(selected)
    })
  }

  // 批量设置默认收货日期
  const handleSetReceiptDate = (selected: string[], isSelectAll: boolean) => {
    Dialog.render({
      title: t('设置默认收货日期'),
      size: 'md',
      buttons: [
        {
          text: t('取消'),
          onClick: Dialog.hide,
        },
        {
          text: t('确定'),
          onClick: () => {
            return store.batchSetReceiveTime(selected)
          },
          btnType: 'primary',
        },
      ],
      // onHide: Modal.hide,
      children: (
        <Observer>
          {() => {
            const { default_receive_time } = store.create_or_batch_data
            return (
              <Flex justifyStart alignCenter>
                <span>
                  {t(
                    `将选中${selected.length}个餐次默认收货日期修改为：当天，`,
                  )}
                </span>
                <TimeSpanPicker
                  style={{ width: '100px' }}
                  date={default_receive_time}
                  onChange={(date: Date) => {
                    const min_time = moment(date).toDate()
                    store.updateCreateOrBatchData(
                      'default_receive_time',
                      min_time,
                    )
                  }}
                />
              </Flex>
            )
          }}
        </Observer>
      ),
    })
  }

  // 批量设置截止下单时间
  const handleSetEndOrderTime = (selected: string[], isSelectAll: boolean) => {
    Dialog.render({
      title: t('设置截止下单时间'),
      size: 'md',
      buttons: [
        {
          text: t('取消'),
          onClick: Dialog.hide,
        },
        {
          text: t('确定'),
          onClick: () => {
            return store.batchSetEndOrderTime(selected)
          },
          btnType: 'primary',
        },
      ],
      children: (
        <Observer>
          {() => {
            const { order_receive_min_date, order_create_min_time } =
              store.create_or_batch_data
            const _order_receive_min_date =
              order_receive_min_date === ''
                ? null
                : parseFloat(order_receive_min_date)
            return (
              <Flex justifyStart alignCenter>
                <span className='gm-margin-right-10'>
                  {t(`将选中${selected.length}个餐截止下单时间修改为：当天`)}
                </span>
                <InputNumber
                  style={{ width: '100px' }}
                  min={0}
                  max={15}
                  value={_order_receive_min_date}
                  placeholder={t('请输入天数')}
                  onChange={(value: number | null) => {
                    const new_value = value === null ? '' : value + ''
                    store.updateCreateOrBatchData(
                      'order_receive_min_date',
                      new_value,
                    )
                    store.updateCreateOrBatchData(
                      'order_receive_max_date',
                      '60',
                    )
                  }}
                  precision={0}
                />
                <span className='gm-margin-left-10 gm-margin-right-20'>
                  {t('天')}
                </span>
                <TimeSpanPicker
                  style={{ width: '100px' }}
                  date={order_create_min_time}
                  onChange={(date: Date) => {
                    const min_time = moment(date).add(1, 'ms').toDate()
                    const max_time = moment(date).toDate()
                    store.updateCreateOrBatchData(
                      'order_create_min_time',
                      min_time,
                    )
                    store.updateCreateOrBatchData(
                      'order_create_max_time',
                      max_time,
                    )
                  }}
                />
              </Flex>
            )
          }}
        </Observer>
      ),
    })
  }

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('餐次总数'),
                content: menu_period.length,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={<CreateMealTimes />}
    >
      <Table
        isBatchSelect
        id='meal_times_list'
        keyField='service_period_id'
        data={menu_period.slice()}
        columns={columns}
        batchActions={_.without(
          [
            globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_UPDATE_MENU_PERIOD,
            ) && {
              children: (
                <BatchActionDefault>{t('设置默认收货日期')}</BatchActionDefault>
              ),
              onAction: (selected: string[], isSelectAll: boolean) => {
                handleSetReceiptDate(selected, isSelectAll)
              },
            },
            globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_UPDATE_MENU_PERIOD,
            ) && {
              children: (
                <BatchActionDefault>{t('设置截止下单时间')}</BatchActionDefault>
              ),
              onAction: (selected: string[], isSelectAll: boolean) => {
                handleSetEndOrderTime(selected, isSelectAll)
              },
            },
            globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_DELETE_MENU_PERIOD,
            ) && {
              children: <BatchActionDelete>{t('删除餐次')}</BatchActionDelete>,
              onAction: (selected: string[], isSelectAll: boolean) => {
                handleDeleteMeal(selected, isSelectAll)
              },
            },
          ],
          false,
        )}
      />
    </BoxTable>
  )
}

export default observer(List)
