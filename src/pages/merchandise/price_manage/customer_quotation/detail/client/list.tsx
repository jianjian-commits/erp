import React, { useState, Key } from 'react'
import {
  Card,
  Button,
  Table,
  Modal,
  message,
  PaginationProps,
  TableColumnType,
} from 'antd'
import { t } from 'gm-i18n'
import { DataAddressName } from '@gm-pc/business'
import {
  UnsetCustomerQuotationRelation,
  BulkUnsetCustomerQuotationRelationV2,
} from 'gm_api/src/merchandise'
import { history } from '@/common/service'
import BatchActionBar from '@/common/components/batch_action_bar'
import store, { CustomerItem } from './store'
import { observer } from 'mobx-react'
import baseStore from '../store'
import { PAY_METHOD } from '@/pages/customer/util'
import { formatParamsForPagination } from '@/common/util'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { getSelectItemCount } from '@/pages/merchandise/components/common'
import globalStore from '@/stores/global'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import classNames from 'classnames'

const List = () => {
  const { selectedRowKeys, setSelectedRowKeys, setPaging, paging } = store
  const [isAll, setIsAll] = useState(false)

  const columns: TableColumnType<CustomerItem>[] = [
    {
      title: t('客户名称'),
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (text, record) => (
        <a
          onClick={() => {
            history.push(
              `/customer/society/catering_customer_management/detail?type=updateCustomer&customer_id=${
                record.customer_id
              }&quotation_id=${JSON.stringify(
                store.quotationId,
              )}&service_period_id=${JSON.stringify(
                record.service_period_id,
              )}&create_group_user_id=${JSON.stringify(
                record.create_group_user_id,
              )}&sales_group_user_id=${JSON.stringify(
                record.sales_group_user_id,
              )}&customer_label_id=${JSON.stringify(
                record.customer_label_id[0] || '',
              )}&menu_id=${JSON.stringify(record.menu_id)}`,
            )
          }}
        >
          <TableTextOverflow text={text} />
        </a>
      ),
    },
    {
      title: t('客户编码'),
      dataIndex: 'customized_code',
      key: 'customized_code',
      width: 120,
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('销售经理'),
      dataIndex: 'sales_group_user',
      key: 'sales_group_user',
      width: 120,
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('开户经理'),
      dataIndex: 'create_group_user',
      key: 'create_group_user',
      width: 120,
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('客户标签'),
      dataIndex: 'customer_label',
      key: 'customer_label',
      width: 120,
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('运营时间'),
      dataIndex: 'service_period_id',
      key: 'service_period_id',
      width: 120,
      render: (_, record) => {
        const list = record.service_period_id
          .map(
            (item) =>
              store.listServicePeriod.find((f) => f.value === item)?.text,
          )
          .filter(Boolean)
        return <TableTextOverflow text={list.join('、')} />
      },
    },
    {
      title: t('地理标签'),
      dataIndex: 'addresses',
      key: 'addresses',
      width: 120,
      render: (_, record) => {
        const { attrs = {} } = record
        const address = {
          city_id: attrs.addresses![0].city_id,
          district_id: attrs.addresses![0].district_id,
          street_id: attrs.addresses![0].street_id,
        }
        return <DataAddressName address={address} />
      },
    },
    {
      title: t('结款周期'),
      dataIndex: 'credit_type',
      key: 'credit_type',
      width: 120,
      render: (text) => PAY_METHOD[text] || '-',
    },
    {
      title: t('操作'),
      dataIndex: 'operation',
      key: 'operation',
      align: 'left',
      width: 150,
      render: (_, record) => (
        <a
          className={classNames({
            merchandise_a_disabled: !globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
            ),
          })}
          onClick={() => handleDelete(record)}
        >
          {t('删除')}
        </a>
      ),
    },
  ]

  /** 删除绑定客户 */
  const handleDelete = (record: CustomerItem) => {
    Modal.confirm({
      title: t('删除客户'),
      content: t('您确定要删除这个客户吗？'),
      okText: t('确认'),
      cancelText: t('取消'),
      okType: 'danger',
      onOk: () => {
        UnsetCustomerQuotationRelation({
          relations: [
            {
              customer_id: record.customer_id,
              quotation_id: store.quotationId,
            },
          ],
        }).then(() => {
          message.success(t('删除成功'))
          store.setCount(store.count - 1)
          store.fetchList()
          baseStore.getQuotation()
        })
      },
    })
  }

  /**
   * 批量删除客户
   */
  const handleBatchDelete = () => {
    Modal.confirm({
      title: t('批量删除'),
      content: (
        <>
          {getSelectItemCount(
            !isAll ? store.selectedRowKeys.length : undefined,
          )}
          {t('您确定要删除这些客户吗？')}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        let params: any = {
          paging: store.pagination,
          customer_ids: selectedRowKeys as string[],
          quotation_ids: [store.quotationId],
          need_customer_label: true,
          need_group_users: true,
          need_quotations: true,
          need_service_periods: true,
          level: 2,
        }
        if (isAll) {
          params = {
            ...params,
            ...store.filter,
          }
          delete params.customer_ids
        }
        BulkUnsetCustomerQuotationRelationV2({
          list_customer_request: params,
        }).then(() => {
          message.success(t('正在批量删除, 请稍后刷新查看'))
          globalStore.showTaskPanel('1')
        })
      },
    })
  }

  /**
   * 页码器相关
   */
  const pagination: PaginationProps = {
    total: store.count,
    current: paging.current,
    pageSize: paging.pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    onChange: (page, pageSize) => {
      setPaging({ current: page, pageSize })
      const isResetCurrent = pageSize !== paging.pageSize
      const pageInfo = formatParamsForPagination(page, pageSize)
      store.setPagination({
        ...pageInfo,
        offset: isResetCurrent ? 0 : pageInfo.offset,
      })
      store.fetchList(isResetCurrent)
    },
    showTotal: (total: number) => `共${total}条记录`,
  }

  const rowSelection = {
    onChange: (selectedRowKeys: Key[]) => {
      setIsAll(false)
      setSelectedRowKeys(selectedRowKeys)
    },
    checkStrictly: false,

    /** 已经选择的Key */
    selectedRowKeys,
    /** 跨页用 */
  }

  /** BatchActionBar 取消操作 */
  const handleClose = () => {
    // store.setSelectted([])
    setIsAll(false)
    setSelectedRowKeys([])
  }

  /** 切换全选所有/选择当前页面 */
  const handleToggleSelectAll = (params: boolean) => {
    setIsAll(params)
    setSelectedRowKeys(store.list.map((item) => item.customer_id))
  }

  const disabled = selectedRowKeys.length === 0

  return (
    <Card bordered={false} bodyStyle={{ padding: '16px 18px' }}>
      <BatchActionBar
        onClose={handleClose}
        selected={selectedRowKeys as string[]}
        isSelectAll={isAll}
        toggleSelectAll={handleToggleSelectAll}
        ButtonNode={
          <PermissionJudge
            permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
          >
            <Button disabled={disabled} onClick={handleBatchDelete}>
              {t('删除')}
            </Button>
          </PermissionJudge>
        }
      />
      <Table<CustomerItem>
        loading={store.loading}
        style={{ marginTop: '16px' }}
        rowKey='customer_id'
        columns={columns}
        dataSource={store.list.slice() || []}
        rowSelection={rowSelection}
        pagination={pagination}
      />
    </Card>
  )
}

export default observer(List)
