/* eslint-disable gm-react-app/no-implict-lodash-each-return */
/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { observer, Observer } from 'mobx-react'
import { Button, message, Modal, Popover, Row } from 'antd'
import { Flex } from '@gm-pc/react'
import { TableList, TableListColumn } from '@gm-pc/business'
import { t } from 'gm-i18n'
import TableTotalText from '@/common/components/table_total_text'
import store from '../store'
import BatchModal from './batch_modal'
import { LeaveOrder, LeaveOrderDetail } from 'gm_api/src/eshop'
import moment from 'moment'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import {
  ExclamationCircleOutlined,
  CaretRightOutlined,
} from '@ant-design/icons'
import MenuPeriodName from './menu_period_name'
import _ from 'lodash'
const { confirm } = Modal
const List = observer(() => {
  const {
    fetchList,
    deleteLeave,
    leave_list,
    filter,
    count,
    selected,
    initModal,
    setSelected,
    moreDeleteLeave,
  } = store
  const [visible, setVisible] = useState<boolean>(false)

  const handleDelete = (leave_order_id: string, serial_no: string) => {
    confirm({
      title: t('删除'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确定删除请假单号${serial_no}`),
      onOk() {
        deleteLeave(leave_order_id).then(() => {
          message.success(t('删除成功'))
          fetchList()
        })
      },
    })
  }

  const columns: TableListColumn<LeaveOrder>[] = [
    {
      Header: t('请假单号'),
      id: 'id',
      minWidth: 90,
      Cell: (cellProps) => {
        return <>{cellProps.original.serial_no || '-'}</>
      },
    },
    {
      Header: t('请假日期'),
      id: 'date',
      minWidth: 180,
      Cell: (cellProps) => {
        const { leave_date_start, leave_date_end } = cellProps.original
        const num = +moment(+leave_date_end!).diff(
          moment(+leave_date_start!),
          'day',
        )
        if (num > 0) {
          return (
            <>
              {moment(+leave_date_start!).format('YYYY-MM-DD') || '-'} ~
              {moment(+leave_date_end!).format('YYYY-MM-DD') || '-'}
            </>
          )
        }

        return <>{moment(+leave_date_end!).format('YYYY-MM-DD') || '-'}</>
      },
    },
    {
      Header: t('请假餐次合计'),
      id: 'num',
      minWidth: 90,
      Cell: (cellProps) => {
        const { leave_order_details, menu_period_desc } =
          cellProps.original || []
        const details: any[] | null | undefined = []
        let numTotal = 0
        const menu = _.groupBy(leave_order_details, 'meal_date')
        if (_.keys(menu).length > 0) {
          _.keys(menu).forEach((item) => {
            numTotal = numTotal + menu[item].length
            details.push({ [item as string]: menu[item] })
          })
        }
        return (
          <Flex alignCenter>
            {numTotal || 0}
            <Popover
              overlayStyle={{ width: '300px' }}
              placement='bottom'
              content={
                <Row>
                  {details && details?.length > 0 ? (
                    <MenuPeriodName
                      details={details}
                      menu_period_desc={menu_period_desc!}
                    />
                  ) : (
                    <>{t('暂无请假餐次')}</>
                  )}
                </Row>
              }
              trigger='hover'
            >
              <CaretRightOutlined
                className='careRightHover'
                style={{ fontSize: '14px', marginLeft: '5px' }}
              />
            </Popover>
          </Flex>
        )
      },
    },
    {
      Header: t('学生姓名'),
      id: 'name',
      minWidth: 90,
      Cell: (cellProps) => {
        const studentId = cellProps.original.student_id
        return <>{store.student_map[studentId!]?.name || '-'}</>
      },
    },
    {
      Header: t('家长姓名'),
      id: 'name',
      minWidth: 90,
      Cell: (cellProps) => {
        const student_id = cellProps.original.student_id
        return <>{store.student_map[student_id!]?.name || '-'}</>
      },
    },
    {
      Header: t('家长联系方式'),
      id: 'name',
      minWidth: 90,
      Cell: (cellProps) => {
        const student_id = cellProps.original.student_id
        return <>{store.student_map[student_id!]?.parent_phone || '-'}</>
      },
    },
    {
      Header: t('备注'),
      id: 'name',
      minWidth: 90,

      Cell: (cellProps) => {
        return (
          <Popover
            placement='bottom'
            content={cellProps.original?.remark || '-'}
            trigger='hover'
            overlayInnerStyle={{ width: '200px' }}
          >
            <span className='remarkOmit'>
              {cellProps.original?.remark || '-'}
            </span>
          </Popover>
        )
      },
    },
    {
      Header: t('操作'),
      id: 'name',
      minWidth: 90,
      Cell: (cellProps) => {
        const { leave_order_id, serial_no } = cellProps.original
        return (
          globalStore.hasPermission(
            Permission.PERMISSION_ESHOP_DELETE_LEAVE_ORDER,
          ) && (
            <a onClick={() => handleDelete(leave_order_id, serial_no!)}>
              {t('删除')}
            </a>
          )
        )
      },
    },
  ]

  // 批量新建请假单
  const handleCreateLeave = () => {
    setVisible(true)
  }
  const handleSetVisible = (params: boolean) => {
    if (!params) {
      initModal()
    }
    setVisible(params)
  }

  const handleSelect = (selected: string[]) => {
    setSelected(selected)
  }

  const batchDelete = () => {
    confirm({
      title: t('删除'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确定删除多条请假单`),
      onOk() {
        moreDeleteLeave().then(() => {
          message.success(t('删除成功'))
          fetchList()
          setSelected([])
        })
      },
    })
  }
  return (
    <div className='leave-list-warp gm-site-card-border-less-wrapper'>
      <TableList
        className='category-table'
        id='leave_list'
        keyField='leave_order_id'
        filter={filter}
        data={leave_list}
        service={fetchList}
        selected={selected}
        isUpdateEffect={false}
        info={
          <Observer>
            {() => {
              return (
                <TableTotalText
                  data={[{ label: t('请假总数'), content: count }]}
                />
              )
            }}
          </Observer>
        }
        action={
          <Button
            type='primary'
            onClick={handleCreateLeave}
            disabled={
              !globalStore.hasPermission(
                Permission.PERMISSION_ESHOP_BATCH_CREATE_LEAVE_ORDER,
              )
            }
          >
            {t('新建批量请假单')}
          </Button>
        }
        batchActionBar={
          selected.length > 0 && (
            <Button onClick={batchDelete} style={{ width: '60px' }}>
              {t('删除')}
            </Button>
          )
        }
        isDiy
        isSelect
        onSelect={handleSelect}
        columns={columns}
        paginationOptions={{
          paginationKey: 'leave_list',
          defaultPaging: { need_count: true },
        }}
      />

      <BatchModal visible={visible} handleSetVisible={handleSetVisible} />
    </div>
  )
})

export default List
