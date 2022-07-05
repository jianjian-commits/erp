import {
  BoxTable,
  BoxTableInfo,
  Button,
  Confirm,
  Flex,
  Tip,
} from '@gm-pc/react'
import { diyTableXHOC, fixedColumnsTableXHOC, TableX } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import store from '../store'
import TableTotalText from '@/common/components/table_total_text'
import Settlement from './settlement'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { formatSecond } from '@/pages/sales_invoicing/util'
import _ from 'lodash'

const Table = diyTableXHOC(fixedColumnsTableXHOC(TableX))

const ListRight = observer((props: { onRefresh: () => any }) => {
  const handleUnSettlement = () => {
    Confirm({
      children: t(
        '反结转支持作废并删除最近一次的结转单据，同时解除对该账期内出入库单据的锁定限制，支持再次修改也支持在该时间段内添加历史出入库单据。是否立即进行反结转操作？',
      ),
      title: t('反结转'),
    }).then(() => {
      // eslint-disable-next-line promise/no-nesting
      store.handleUnSettle().then(() => props.onRefresh())
    })
  }

  const handleSettlement = () => {
    Confirm({
      children: <Settlement />,
      title: t('结转'),
      size: 'md',
    }).then(() => {
      if (_.trim(store.fiscal_list.name)) {
        // eslint-disable-next-line promise/no-nesting
        store.handleSubmit().then(() => {
          props.onRefresh()
        })
      } else {
        Tip.danger(t('账期名称不能为空'))
      }
    })
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_INVENTORY_SHEET}
    >
      <Button className='gm-margin-left-10' onClick={handleUnSettlement}>
        {t('反结转')}
      </Button>
      <Button
        type='primary'
        className='gm-margin-left-10'
        onClick={handleSettlement}
      >
        {t('结转')}
      </Button>
    </PermissionJudge>
  )
})

const List = observer((props: { onFetchList: () => any; loading: boolean }) => {
  const { list, groupUsers } = store

  useEffect(() => {
    store.fetchListGroupUser()
  }, [])

  const _columns = useMemo(
    () => [
      {
        Header: t('账单编号'),
        accessor: 'serial_no',
        minWidth: 100,
      },
      {
        Header: t('开始时间'),
        accessor: 'begin_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { begin_time } = cellProps.row.original
          return begin_time === '0' ? '-' : formatSecond(begin_time)
        },
      },
      {
        Header: t('结束时间'),
        accessor: 'end_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { end_time } = cellProps.row.original
          return formatSecond(end_time)
        },
      },
      {
        Header: t('账期名称'),
        accessor: 'name',
        minWidth: 100,
      },
      {
        Header: t('操作人'),
        accessor: 'creator_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { creator_id } = cellProps.row.original
          return (
            <Observer>
              {() => {
                return <>{groupUsers?.[creator_id]?.username ?? ''}</>
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('操作时间'),
        accessor: 'update_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { update_time } = cellProps.row.original
          return formatSecond(update_time)
        },
      },
      {
        Header: t('备注'),
        accessor: 'remark',
        minWidth: 100,
      },
      {
        Header: t('操作'),
        accessor: 'sale_price',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { create_time, end_time } = cellProps.row.original
          return (
            <Flex column>
              <a
                href={`#/financial_manage/fiscal_period_settlement/fiscal_period_settlement/fiscal_period_detail?create_time=${create_time}&end_time=${end_time}`}
                className='gm-cursor'
              >
                查看详情
              </a>
            </Flex>
          )
        },
      },
    ],
    [groupUsers],
  )

  return (
    <BoxTable
      action={<ListRight onRefresh={props.onFetchList} />}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('订单总数'),
                content: store.summary.orderCount,
              },
            ]}
          />
        </BoxTableInfo>
      }
    >
      <Table id='processor_check_id' data={list.slice()} columns={_columns} />
    </BoxTable>
  )
})
export default List
