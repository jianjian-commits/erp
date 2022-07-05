import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { TableList, TableListColumn } from '@gm-pc/business'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import TableTotalText, {
  TotalTextOptions,
} from '@/common/components/table_total_text'
import { Space, Button, Modal, message } from 'antd'
import { t } from 'gm-i18n'
import store from '../store'
import _ from 'lodash'
import { AdvancedOrder } from 'gm_api/src/eshop'
import moment from 'moment'
import { toFixedOrder } from '@/common/util'
import { ADVANCE_ORDER } from '../enum'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import { useGMLocation } from '@gm-common/router'
const { confirm } = Modal

const List: FC = observer(() => {
  const location = useGMLocation<{ q: string }>()
  const {
    filter,
    list,
    getPrepayOrder,
    selected,
    setSelected,
    setFilter,
    updateFilter,
  } = store

  useEffect(() => {
    if (location.query.q) {
      setFilter('q', location.query.q)
    }
    updateFilter()
  }, [])

  const handleDelete = (id: string) => {
    confirm({
      title: t('删除'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确认删除单号为${id}的订单吗？`),
      onOk() {
        store.deleteAdvance(id).then(() => {
          message.success(t('删除成功'))
          store.getPrepayOrder()
        })
      },
    })
  }

  const handleRefun = (id: string) => {
    confirm({
      title: t('删除'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确认退款单号为${id}的订单吗？`),
      onOk() {
        store.refunAdvance(id).then(() => {
          message.success(t('退款成功'))
          store.getPrepayOrder()
        })
      },
    })
  }
  const columns: TableListColumn<AdvancedOrder>[] = [
    {
      Header: t('预付单号'),
      id: 'order_id',
      width: 130,
      Cell: (d) => {
        return (
          <a
            href={`#/order/group_meal/prepay_order/detail?advanced_order_id=${d.original.advanced_order_id}`}
          >
            {d.original.serial_no}
          </a>
        )
      },
    },
    {
      Header: t('订餐日期'),
      id: 'order_date',
      width: 130,
      Cell: (d) => {
        return (
          <span>
            {moment(+d.original.meal_date_start!).format('YYYY-MM-DD')}-
            <br />
            {moment(+d.original.meal_date_end!).format('YYYY-MM-DD')}
          </span>
        )
      },
    },
    {
      Header: t('学校'),
      id: 'school',
      Cell: (d) => {
        return <span>{d.original.student?.school_name!}</span>
      },
    },
    {
      Header: t('班级'),
      id: 'class',
      Cell: (d) => {
        return <span>{d.original.student?.class_name!}</span>
      },
    },
    {
      Header: t('学生姓名'),
      id: 'student_name',
      Cell: (d) => {
        return <span>{d.original.student?.name!}</span>
      },
    },
    {
      Header: t('家长姓名'),
      id: 'order_id',
      Cell: (d) => {
        return <span>{d.original.student?.parent_name!}</span>
      },
    },
    {
      Header: t('家长联系方式'),
      id: 'order_id',
      width: 130,
      Cell: (d) => {
        return <span>{d.original.student?.parent_phone!}</span>
      },
    },

    {
      Header: t('预付金额'),
      id: 'amount',
      Cell: (d) => {
        return (
          <span>
            {toFixedOrder(d.original.amount!)}
            {t('元')}
          </span>
        )
      },
    },
    {
      Header: t('未就餐金额'),
      id: 'no_eat_amount',
      Cell: (d) => {
        return (
          <span>
            {toFixedOrder(d.original.no_eat_amount!)}
            {t('元')}
          </span>
        )
      },
    },

    {
      Header: t('实退金额'),
      id: 'refund_amount',
      Cell: (d) => {
        return (
          <span>
            {toFixedOrder(d.original.refund_amount!)}
            {t('元')}
          </span>
        )
      },
    },
    {
      Header: t('状态'),
      id: 'amount',
      Cell: (d) => {
        return <span>{ADVANCE_ORDER[d.original.state!]}</span>
      },
    },

    {
      Header: t('操作'),
      id: 'action',
      width: 140,
      Cell: (d) => {
        return (
          <Space>
            <a
              href={`#/order/group_meal/prepay_order/detail?advanced_order_id=${d.original.advanced_order_id}`}
            >
              {t('查看')}
            </a>
            {globalStore.hasPermission(
              Permission.PERMISSION_ESHOP_DELETE_ADVANCED_ORDER,
            ) && (
              <a onClick={() => handleDelete(d.original.advanced_order_id!)}>
                {t('删除')}
              </a>
            )}
            {d.original.state === 4 &&
              globalStore.hasPermission(
                Permission.PERMISSION_ESHOP_UPDATE_ADVANCED_ORDER_REFUND,
              ) && (
                <a onClick={() => handleRefun(d.original.advanced_order_id!)}>
                  {t('退款')}
                </a>
              )}
          </Space>
        )
      },
    },
  ]
  const handleSelected = (selected: string[]) => {
    setSelected(selected)
    // if (selected.length < store.list.length) {
    //   setIsAllSelected(false)
    // }
  }
  /** 取消选中 */
  // const cancelSelect = () => {
  //   setSelected([])
  //   setIsAllSelected(false)
  // }

  // const handleToggleSelectAll = (parmas: boolean) => {
  //   setIsAllSelected(parmas)
  //   setSelected(_.map(list, (item) => item.advanced_order_id!))
  // }

  // 批量删除
  const handleSaleStatus = () => {
    confirm({
      title: t('删除'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确认删除这些预订单吗？`),
      onOk() {
        store.moreDeleteAdvance().then(() => {
          message.success(t('删除成功'))
          store.getPrepayOrder()
          setSelected([])
        })
      },
    })
  }

  return (
    <div style={{ padding: '0 10px' }}>
      <TableList
        id='prepay_order'
        keyField='advanced_order_id'
        isSelect
        isDiy
        columns={columns}
        data={list}
        filter={filter}
        selected={selected}
        service={getPrepayOrder}
        onSelect={handleSelected}
        batchActionBar={
          selected.length === 0 ? (
            <Observer>
              {() => (
                <TableTotalText
                  data={
                    [
                      { label: t('订单总数'), content: store.count },
                      {
                        label: t('下单金额'),
                        content: toFixedOrder(store.total_count),
                      },
                    ] as TotalTextOptions[]
                  }
                />
              )}
            </Observer>
          ) : (
            <>
              <Button style={{ width: '80px' }} onClick={handleSaleStatus}>
                {t('删除')}
              </Button>
            </>
          )
        }
        paginationOptions={{
          paginationKey: 'prepay_order',
          defaultPaging: { need_count: true },
        }}
      />
    </div>
  )
})
export default List
