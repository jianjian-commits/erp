import { t } from 'gm-i18n'
import React from 'react'
import {
  RightSideModal,
  BoxTable,
  BoxTableInfo,
  Button,
  Flex,
  Tip,
} from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { observer, Observer } from 'mobx-react'
import classNames from 'classnames'
import Ssus from './ssus'
import ReceiveTime from './receive_time'
import store, { BatchOrder } from './store'
import { gmHistory } from '@gm-common/router'
import {
  isSsuListValid,
  getSsuListLength,
  checkValidOrder,
  checkValidSsu,
} from './util'
import { CreateOrder, ReqCreateOrder, Order } from 'gm_api/src/order'
import { BatchCreateOrder } from 'gm_api/src/orderlogic'
import globalStore from '@/stores/global'

export default observer(() => {
  const { list, servicePeriod } = store

  const renderModal = (index: number) => {
    RightSideModal.render({
      children: <Ssus index={index} />,
      onHide: RightSideModal.hide,
      noCloseBtn: true,
      style: { width: '1100px' },
    })
  }

  function handleSave() {
    const list = store.list.slice()
    let i = 0
    try {
      for (; i < list.length; i++) {
        const order = list[i]
        checkValidOrder(order)
        checkValidSsu(order.list)
      }
    } catch (error) {
      Tip.danger(`${t('订单序号')}${i + 1}，${error.message}`)
      return Promise.reject(error)
    }

    return BatchCreateOrder({
      orders: list.map((_v, i) => {
        const params = store.getParams(i)
        return params as Order
      }),
    }).then(() => {
      gmHistory.replace('/order/order_manage/list')
      Tip.success('数据处理中,请在任务栏查看进度！')
      globalStore.showTaskPanel('1')
      return null
    })
  }

  async function handleSingleSave(index: number) {
    const order = store.list[index]
    try {
      checkValidSsu(order.list)
    } catch (error) {
      Tip.danger(error.message)
      return Promise.reject(error)
    }

    const params = store.getParams(index)
    return CreateOrder({
      order: params as ReqCreateOrder,
      time_zone: order.info.time_zone!,
    }).then(() => {
      if (store.list.length === 1) {
        gmHistory.replace('/order/order_manage/list')
      } else {
        store.deleteOrderRow(index)
      }
      Tip.success('创建成功')
      return null
    })
  }

  function handleDateChange(index: number, date: Date) {
    store.updateOrderRowItem(
      index,
      'receive_time',
      date ? `${+date}` : undefined,
    )
  }

  function handleDelete(orderIndex: number) {
    if (store.list.length === 1) {
      gmHistory.replace('/order/order_manage/list')
      return
    }
    store.deleteOrderRow(orderIndex)
  }

  return (
    <BoxTable
      info={
        <BoxTableInfo>{`${t('待提交订单列表')}(${t('运营时间：')}${
          servicePeriod?.name || '-'
        })`}</BoxTableInfo>
      }
      action={
        <Button type='primary' onClick={handleSave}>
          {t('全部保存')}
        </Button>
      }
    >
      <Table<BatchOrder>
        data={list.slice()}
        columns={[
          {
            Header: t('序号'),
            id: 'index',
            width: 80,
            Cell: (cellProps) => {
              return <div>{cellProps.index + 1}</div>
            },
          },
          {
            Header: t('商户'),
            minWidth: 150,
            id: 'info.customer.name',
            Cell: (props) => {
              const order = props.original
              if (!order.info.customer) {
                const target = order.excel
                return (
                  <div className='gm-has-error'>
                    (
                    {target?.customer?.customer_code ||
                      target?.customer?.customer_name ||
                      '-'}
                    )无法解析到商户
                  </div>
                )
              }
              return (
                <div>
                  {`${order.info.customer.name}(${order.info.customer?.customized_code})`}
                </div>
              )
            },
          },
          {
            Header: t('商品数'),
            minWidth: 100,
            accessor: 'list.length',
            Cell: (props) => (
              <Observer>
                {() => {
                  const order = props.original
                  if (!order.info.customer || !order.info.service_period) {
                    return <div>-</div>
                  }
                  if (!order.list.length) {
                    return (
                      <div className='gm-has-error'>{t('无法解析到商品')}</div>
                    )
                  }
                  const ssuLength = getSsuListLength(order.list)
                  const invalid = !isSsuListValid(order.list)
                  return (
                    <div
                      className={classNames('gm-cursor', {
                        'gm-has-error': invalid || !ssuLength,
                        'gm-text-primary': !invalid && ssuLength,
                      })}
                      onClick={() => renderModal(props.index)}
                    >
                      <span>
                        {invalid ? t('商品存在异常') : `${ssuLength}${t('种')}`}
                      </span>
                      <span>{t('，修改商品信息')}</span>
                    </div>
                  )
                }}
              </Observer>
            ),
          },
          {
            Header: t('订单金额'),
            minWidth: 60,
            id: 'info.order_price',
            Cell: (props) => (
              <Observer>
                {() => {
                  const orderPrice = store.summary[props.index]
                  return <div>{orderPrice || '-'}</div>
                }}
              </Observer>
            ),
          },
          {
            Header: t('收货时间'),
            width: 370,
            id: 'receive_time',
            Cell: (props) => {
              const order = props.original
              if (!order.info.customer) {
                return <div>-</div>
              }
              if (!order.info.service_period) {
                return (
                  <div className='gm-has-error'>{t('无法匹配到运营时间')}</div>
                )
              }
              return (
                <Flex alignCenter>
                  <Observer>
                    {() => {
                      return (
                        <ReceiveTime
                          value={
                            order.info.receive_time
                              ? new Date(+order.info.receive_time)
                              : undefined
                          }
                          servicePeriod={order.info.service_period! || {}}
                          onChange={handleDateChange.bind(
                            undefined,
                            props.index,
                          )}
                        />
                      )
                    }}
                  </Observer>
                </Flex>
              )
            },
          },
          {
            Header: t('收货人'),
            minWidth: 100,
            id: 'receiver_name',
            accessor: (d: BatchOrder) => {
              const addresses = d.info?.customer?.attrs?.addresses || []
              return addresses[0]?.receiver || '-'
            },
          },
          {
            Header: t('收货地址'),
            minWidth: 200,
            id: 'address',
            accessor: (d: BatchOrder) => {
              const addresses = d.info?.customer?.attrs?.addresses || []
              return addresses[0]?.address || '-'
            },
          },
          {
            width: TableXUtil.TABLE_X.WIDTH_OPERATION,
            id: 'operation',
            Header: TableXUtil.OperationHeader,
            Cell: (props) => (
              <Observer>
                {() => {
                  const order = props.original
                  return (
                    <TableXUtil.OperationCell>
                      {order.info.customer &&
                        order.info.service_period &&
                        isSsuListValid(order.list) &&
                        getSsuListLength(order.list) > 0 && (
                          <a
                            className='gm-hover-primary gm-cursor gm-margin-right-10'
                            onClick={handleSingleSave.bind(
                              undefined,
                              props.index,
                            )}
                          >
                            {t('保存')}
                          </a>
                        )}
                      <a
                        className='gm-hover-primary gm-cursor'
                        onClick={handleDelete.bind(undefined, props.index)}
                      >
                        {t('删除')}
                      </a>
                    </TableXUtil.OperationCell>
                  )
                }}
              </Observer>
            ),
          },
        ]}
      />
    </BoxTable>
  )
})
