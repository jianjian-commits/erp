import React, { FC, ReactElement, useMemo, useState } from 'react'
import { t } from 'gm-i18n'
import {
  Button,
  Dialog,
  FormPanel,
  Popover,
  Tip,
  Flex,
  Affix,
} from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import TableListTips from '@/common/components/table_list_tips'

import { observer, Observer } from 'mobx-react'
import Operation from './components/operation'
import store from './store'
import _ from 'lodash'
import { MenuDetailItemSsuProps } from '@/common/components/quotation_detail/interface'
import DiningCountCell from './components/cell_dining_count'
import ReceiveTimeCell from './components/cell_receive_time'
import { BatchCreateOrderByMenuRequest_Type } from 'gm_api/src/order'
import {
  isValid,
  getWeek2,
  getFormatByTimestamp,
  getTimestamp,
  toFixedOrder,
} from '@/common/util'
import { gmHistory as history } from '@gm-common/router'
import QuotationDetailStore from '@/common/components/quotation_detail/store'
import MenuSummaryDrawer from './components/menu_summary_drawer'
import MenuTimeInfo from './components/menu_time_info'
import classNames from 'classnames'

import globalStore from '@/stores/global'

const StepTwo: FC<{ back: () => void }> = ({ back }) => {
  const { orders, summaryList } = store
  const [active, setActive] = useState<boolean>(true)

  function handleCancel(): void {
    QuotationDetailStore.returnStep = false
    QuotationDetailStore.selectedAll = false
    Dialog.hide()
    back()
  }

  function handleReturnStep(): void {
    QuotationDetailStore.returnStep = true
    Dialog.hide()
    back()
  }

  function handleOrderSave(type: BatchCreateOrderByMenuRequest_Type): void {
    Dialog.hide()
    store.batchCreateOrder(type).then(() => {
      history.push('/order/order_manage/list')
      // 右侧任务弹窗
      globalStore.showTaskPanel('1')
      return null
    })
  }

  function handleSave(): void {
    if (!orders.length) {
      Tip.tip('当前未选择商品，请返回上一步选择下单商品')
      return
    }
    if (_.find(orders, (order) => !isValid(order.receive_time))) {
      Tip.tip(t('请填写完整'))
      return
    }

    Dialog.render({
      title: t('批量新建订单'),
      size: 'md',
      buttons: [
        {
          text: t('取消'),
          onClick: handleCancel,
        },
        {
          text: t('跳过重复订单并创建'),
          onClick: () =>
            handleOrderSave(
              BatchCreateOrderByMenuRequest_Type.TYPE_SKIP_REPEAT,
            ),
          btnType: 'primary',
        },
      ],
      children: (
        <Flex column className='gm-padding-5'>
          <div>
            {t(
              '是否确定新建订单，如遇到所选客户在所选收货日期有重复餐次的订单，则自动跳过，不会重复创建',
            )}
          </div>
          <div>
            {t(
              '如在收货时间为3月1日，已有餐次为早餐的订单，重复选择该客户3月1日早餐的订单，则不会新建成功',
            )}
          </div>
        </Flex>
      ),
    })
  }

  function popupTradeFlow(list: MenuDetailItemSsuProps[]): ReactElement {
    return (
      <div style={{ width: '300px' }}>
        <Table
          data={list}
          columns={[
            {
              Header: t('序号'),
              id: 'index',
              Cell: (cellProps) => {
                return <div>{cellProps.index + 1}</div>
              },
            },
            {
              Header: t('商品名'),
              id: 'name',
              Cell: (cellProps) => {
                return <div>{cellProps.original?.name}</div>
              },
            },
          ]}
        />
      </div>
    )
  }

  const columns: Column[] = useMemo(
    () => [
      {
        Header: t('序号'),
        id: 'index',
        fixed: 'left',
        width: 80,
        Cell: (cellProps) => {
          return <div>{cellProps.index + 1}</div>
        },
      },
      {
        Header: t('就餐日期'),
        accessor: 'menu_date',
        minWidth: 100,
        isKeyboard: true,
        Cell: (cellProps) => {
          const { original } = cellProps
          return (
            <>
              <span>
                {getWeek2(original.menu_time)}&nbsp;
                {`(${getFormatByTimestamp(
                  'MM.DD',
                  getTimestamp(original.menu_time),
                )})`}
              </span>
            </>
          )
        },
      },
      {
        Header: t('餐次'),
        accessor: 'meal_times',
        minWidth: 100,
        Cell: (cellProps) => {
          const { name } = cellProps.original
          return <div>{name}</div>
        },
      },
      {
        Header: t('客户名称'),
        accessor: 'customerName',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <div>
              {cellProps.original?.addresses?.addresses[0]?.name || '-'}
            </div>
          )
        },
      },
      {
        Header: t('商品总数'),
        accessor: 'ssuCount',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <Popover
              type='hover'
              showArrow
              right
              arrowLeft='460px'
              popup={popupTradeFlow(cellProps.original.details)}
              style={{ maxHeight: '250px', overflow: 'auto' }}
            >
              <Button type='link' style={{ textAlign: 'left' }}>
                {cellProps.original.details.length}
              </Button>
            </Popover>
          )
        },
      },
      {
        Header: t('就餐人数'),
        accessor: 'dining_count',
        minWidth: 100,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <DiningCountCell index={cellProps?.index} />
        },
      },
      {
        Header: t('收货日期'),
        accessor: 'receive_time',
        width: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return <ReceiveTimeCell index={cellProps?.index} />
        },
      },
      {
        Header: t('下单金额(元)'),
        accessor: 'total_price',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => (
                <div className='gm-text-left'>
                  {toFixedOrder(cellProps.original.total_price || 0)}
                </div>
              )}
            </Observer>
          )
        },
      },
      {
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        Header: TableXUtil.OperationHeader,
        diyEnable: false,
        id: 'action',
        fixed: 'right',
        diyItemText: '操作',
        Cell: (props) => <Operation index={props.index} />,
      },
    ],
    [],
  )

  const disabled =
    _.filter(orders, (o) => Number(o?.dining_count || 0) !== 0).length !== 0

  // 返回上一步
  const returnButton = (
    <>
      <div className='gm-gap-10' />
      <Button onClick={handleReturnStep}>{t('上一步')}</Button>
    </>
  )
  return (
    <>
      <TableListTips
        tips={[
          t(
            '展现当前待下订单收货时间默认读取上一次的客户在此餐次的收货时间，商品下单数默认等于客户的人数',
          ),
        ]}
      />
      <Flex className='gm-overflow' justifyBetween style={{ height: '83vh' }}>
        <Flex
          nowrap
          column
          style={{
            width: active ? '65vw' : '-webkit-fill-available',
          }}
        >
          <FormPanel title={t('待下单列表')} />
          <Table
            isEdit
            isKeyboard
            isVirtualized
            className='tw-mx-4'
            id='quotation_edit_order'
            data={orders.slice()}
            columns={columns}
            onAddRow={() => _.noop}
          />
        </Flex>
        <MenuSummaryDrawer
          width='27vw'
          height='83vh'
          onActiveChange={(active: boolean) => {
            setActive(active)
          }}
        >
          <FormPanel title={t('菜谱总览')} />
          <div className='gm-overflow'>
            {summaryList.map((item) => (
              <div className='gm-margin-lr-20 tw-mb-3' key={item.menu_time}>
                <MenuTimeInfo summary={item} />
              </div>
            ))}
          </div>
        </MenuSummaryDrawer>
      </Flex>
      <Affix bottom={0}>
        <div
          className={classNames(
            'gm-padding-tb-5 gm-text-center gm-form-group-sticky-box',
          )}
        >
          <Button onClick={handleCancel}>{t('取消')}</Button>
          {returnButton}
          <div className='gm-gap-10' />
          <Button type='primary' onClick={handleSave} disabled={!disabled}>
            {t('确定')}
          </Button>
        </div>
      </Affix>
    </>
  )
}

export default observer(StepTwo)
