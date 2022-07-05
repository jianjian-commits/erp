import {
  Button,
  Card,
  message,
  PaginationProps,
  Modal,
  Table,
  TableColumnType,
  Space,
} from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import React, { useState } from 'react'
import { List } from '../interface'
import store from '../store'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import { formatParamsForPagination } from '@/common/util'
import { observer } from 'mobx-react'
import { gmHistory as history } from '@gm-common/router'
import '@/pages/financial_manage/settlement_manage/customer_settlement/style.less'
import { Flex, Tip } from '@gm-pc/react'
import moment from 'moment'
import {
  map_SettleSheet_SettleStatus,
  SettleSheet_SettleStatus,
} from 'gm_api/src/finance'

const { confirm } = Modal

export default observer(() => {
  /**
   * 页码器相关
   */
  const pagination: PaginationProps = {
    current: store.paging.current,
    pageSize: store.paging.pageSize,
    total: store.count,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    onChange: (page, pageSize) => {
      store.setPaging({ current: page, pageSize })
      const isResetCurrent = pageSize !== store.paging.pageSize

      const pageInfo = formatParamsForPagination(page, pageSize)
      store.setPagination({
        ...pageInfo,
        offset: isResetCurrent ? 0 : pageInfo.offset,
      })
      store.fetchList(isResetCurrent)
    },
    showTotal: (total) => `共${total}条记录`,
  }

  const goDetail = (id: string) => {
    store.setLoading(true)
    history.push(
      `/financial_manage/settlement_manage/settlement_voucher/detail?settle_sheet_id=${id}`,
    )
  }

  const handleCancellation = (settle_sheet_id: string) => {
    confirm({
      title: t('作废凭证'),
      content: (
        <Flex column>
          <Space className='gm-text-danger'>
            {t('本凭证对应的结款金额将作废，且作废不可撤销!')}
          </Space>
          <Space>{t('确认要作废该凭证吗?')}</Space>
        </Flex>
      ),
      okType: 'primary',
      onOk: () => {
        store.deleteCustomerSettleSheet(settle_sheet_id).then(() => {
          Tip.success('操作成功')
          store.fetchList(true)
        })
      },
    })
  }

  const columns: TableColumnType<List>[] = [
    {
      title: t('结款凭证id'),
      dataIndex: 'settle_sheet_id',
      key: 'settle_sheet_id',
      className: 'gm-order-unit-columns',
      render: (id, record) => {
        return <a onClick={goDetail.bind(null, id)}>{id}</a>
      },
    },
    {
      title: t('自定义凭证号'),
      dataIndex: 'customize_settle_voucher',
      key: 'customize_settle_voucher',
    },
    {
      title: t('结款日期'),
      dataIndex: 'settle_time',
      key: 'settle_time',
      render: (value) => moment(+value).format('YYYY-MM-DD'),
    },
    {
      title: t('结款公司'),
      dataIndex: 'target_name',
      key: 'target_name',
    },
    {
      title: t('结款金额'),
      dataIndex: 'total_price',
      key: 'total_price',
    },
    {
      title: t('凭证状态'),
      dataIndex: 'settle_status',
      key: 'settle_status',
      render: (value) => map_SettleSheet_SettleStatus[value],
    },
    {
      title: t('操作'),
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => {
        return (
          record.settle_status !==
            SettleSheet_SettleStatus.SETTLE_STATUS_DELETED && (
            <a onClick={handleCancellation.bind(null, record.settle_sheet_id)}>
              {t('作废')}
            </a>
          )
        )
      },
    },
  ]

  return (
    <div className='ant-card-self'>
      <Card bordered>
        <Table<List>
          className='gm-padding-top-20'
          size='small'
          rowKey='id'
          columns={columns}
          dataSource={store.dataSource}
          pagination={pagination}
          expandable={{
            childrenColumnName: 'children',
            defaultExpandAllRows: true,
          }}
        />
      </Card>
    </div>
  )
})
