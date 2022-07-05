/* eslint-disable react-hooks/exhaustive-deps */
import React, { Key, useState } from 'react'
import {
  Tag,
  Button,
  Table,
  Pagination,
  Card,
  Divider,
  message,
  Modal,
  Space,
} from 'antd'
import { Flex } from '@gm-pc/react'
import {
  BoundCombineDataType,
  BoundCombineChildrenType,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/combine/interface'
import store from '../store'
import BatchActionBarComponent from '@/common/components/batch_action_bar'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { t } from 'gm-i18n'
import HintComponent from '@/pages/merchandise/components/hint'
import { observer } from 'mobx-react'
import _ from 'lodash'
import TableTextOverflow from '@/common/components/table_text_overflow'
import globalStore from '@/stores/global'
import { ColumnType } from 'antd/lib/table'
import { formatParamsForPagination } from '@/common/util'
import {
  DeleteCombineInQuotation,
  EditShelfStatus,
  getSelectItemCount,
} from '@/pages/merchandise/components/common'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import '../../../style.less'
import classNames from 'classnames'

const PirceCombine = observer(() => {
  const {
    paging,
    quotationLoading,
    quotationList,
    quotationTotal,
    quotationListSelectedRowKeys,
    setPaging,
    setQuotationTotal,
    setPagination,
    onBatchUpdate,
    deleteMerchandise,
    ChangeStatus,
    setQuotationListSelectedRowKeys,
    setQuotationListSelectedRows,
    getQuotationList,
  } = store

  // 是否全选
  const [isAll, setIsAll] = useState<boolean>(Boolean)

  const columns: ColumnType<BoundCombineDataType>[] = [
    {
      title: t('商品名称'),
      key: 'name',
      dataIndex: 'name',
      width: 150,
      render: (text, record) => {
        const { isAllOnSale, isAllOnShelf } = record
        const tips: string[] = []
        if (!isAllOnSale) {
          tips.push('存在停售的子商品')
        }
        if (!isAllOnShelf) {
          tips.push('存在下架的子商品')
        }
        return (
          <>
            <TableTextOverflow text={text} />

            {!!tips.length && (
              <HintComponent
                type='1'
                content={() => {
                  return _.map(tips, (tipItem, index) => (
                    <p>
                      {index + 1}、{tipItem}
                    </p>
                  ))
                }}
              />
            )}
          </>
        )
      },
    },
    {
      title: t('所属报价单'),
      dataIndex: 'quotation',
      key: 'quotation',
      width: 150,
      render: (text: string) => <TableTextOverflow text={text} />,
    },
    {
      title: t('商品单价'),
      key: 'totalPrice',
      dataIndex: 'totalPrice',
      width: 150,
      render: (text: string, record: BoundCombineDataType) => {
        const { base_unit_id } = record
        const unitName = globalStore.getUnitName(base_unit_id)
        return t(`${text}元/${unitName || '-'}`)
      },
    },
    {
      title: t('商品数量'),
      dataIndex: 'base_unit_id',
      key: 'base_unit_id',
      width: 150,
      render: (_, record) => {
        const unitName = globalStore.getUnitName(record.base_unit_id) || ''
        return unitName ? `1${unitName}` : '-'
      },
    },
    {
      title: t('状态'),
      dataIndex: 'on_shelf',
      key: 'on_shelf',
      align: 'center',
      width: 100,
      render: (text: boolean) => {
        return (
          <>
            {text ? (
              <Tag color='#87d068' className='tw-w-9 tw-text-center'>
                {t('上架')}
              </Tag>
            ) : (
              <Tag color='#ccc' className='tw-w-9 tw-text-center'>
                {t('下架')}
              </Tag>
            )}
          </>
        )
      },
    },
    {
      title: t('操作'),
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (_, record) => {
        return (
          <>
            <a
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
                ),
              })}
              onClick={() => handleChangeStatus(record)}
            >
              {!record.on_shelf ? t('上架') : t('下架')}
            </a>
            <Divider type='vertical' />
            <a
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
                ),
              })}
              onClick={() => handleDelMerchanise(record)}
            >
              {t('删除')}
            </a>
          </>
        )
      },
    },
  ]

  /** 组成商品 */
  const expandedRowRender = (data: BoundCombineDataType) => {
    const columns = [
      { title: '', width: 84, render: () => '' },
      {
        title: t('商品名称'),
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (text: string, record: BoundCombineChildrenType) => {
          const { on_sale } = record
          return (
            <>
              {!on_sale && (
                <Tag color='#f2f2f2' style={{ color: '#434343' }}>
                  {t('停售')}
                </Tag>
              )}
              <TableTextOverflow text={text} />
            </>
          )
        },
      },
      {
        title: t('所属报价单'),
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: () => '',
      },
      {
        title: t('商品单价'),
        key: 'price',
        dataIndex: 'price',
        width: 150,
        render: (text: string, record: BoundCombineChildrenType) =>
          t(`${text}元/${record.priceUnitName}`),
      },
      {
        title: t('商品数量'),
        dataIndex: 'ratio',
        key: 'ratio',
        width: 150,
        render: (text: string, record: BoundCombineChildrenType) => (
          <div>{t(`${text}${record.orderUnitName.split('（')[0]}`)}</div>
        ),
      },
      {
        title: t('状态'),
        dataIndex: 'on_shelf',
        key: 'on_shelf',
        align: 'center',
        width: 100,
        render: (text: boolean) => {
          return (
            <>
              {text ? (
                <Tag color='#87d068' className='tw-w-9 tw-text-center'>
                  {t('上架')}
                </Tag>
              ) : (
                <Tag color='#ccc' className='tw-w-9 tw-text-center'>
                  {t('下架')}
                </Tag>
              )}
            </>
          )
        },
      },
      {
        title: t('操作'),
        dataIndex: 'action',
        width: 120,
        key: 'action',
        render: () => '',
      },
    ]

    return (
      <Table
        key='sku_id'
        rowKey='sku_id'
        rowClassName={(record) => {
          if (record.on_sale) {
            return 'table-expandedRow-color'
          } else {
            return 'table-expandedRow-color off-sale-sku'
          }
        }}
        dataSource={data.items}
        columns={columns as any[]}
        showHeader={false}
        pagination={false}
      />
    )
  }

  // 多选
  const rowSelection = {
    columnWidth: 60,
    onChange: (
      selectedRowKeys: Key[],
      selectedRows: BoundCombineDataType[],
    ) => {
      setQuotationListSelectedRows(selectedRows)
      setIsAll(false)
      setQuotationListSelectedRowKeys(selectedRowKeys)
    },
    checkStrictly: false,

    /** 已经选择的Key */
    selectedRowKeys: quotationListSelectedRowKeys,
    /** 跨页用 */
  }

  const handleColse = () => {
    setQuotationListSelectedRowKeys([])
    setQuotationListSelectedRows([])
    setIsAll(false)
  }
  const handleToggleSelectAll = (params: boolean) => {
    setIsAll(params)

    setQuotationListSelectedRowKeys(
      _.map(quotationList, (item) => item?.quotation_id!),
    )
    setQuotationListSelectedRows(quotationList)
  }

  const itemCount = isAll ? undefined : quotationListSelectedRowKeys.length
  /** 批量上架 */
  const batchGround = () => {
    Modal.confirm({
      title: t('批量上架'),
      content: (
        <>
          {getSelectItemCount(itemCount)}
          {t('确定要批量上架这些报价单中的组合商品吗？')}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ on_shelf: 1, isAll }).then(() => {
          message.success('正在批量上架，请稍后刷新查看')
          globalStore.showTaskPanel('1')
          setQuotationListSelectedRowKeys([])
          setQuotationListSelectedRows([])
        })
      },
    })
  }

  /** 批量下架 */
  const batchUndercarriage = () => {
    Modal.confirm({
      title: t('批量下架'),
      content: (
        <>
          {getSelectItemCount(itemCount)}
          {t('确定要批量下架这些报价单中的组合商品吗')}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ on_shelf: 2, isAll }).then(() => {
          message.success('正在批量下架，请稍后刷新查看')
          globalStore.showTaskPanel('1')
          setQuotationListSelectedRowKeys([])
          setQuotationListSelectedRows([])
        })
      },
    })
  }

  /** 批量删除 */
  const batchDelete = () => {
    Modal.confirm({
      title: t('批量删除'),
      content: (
        <>
          {getSelectItemCount(itemCount)}
          {t('确定要删除这些销售条目吗？')}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ delete: true, isAll }).then(() => {
          message.success('正在批量删除，请稍后刷新查看')
          globalStore.showTaskPanel('1')
          setQuotationListSelectedRowKeys([])
          setQuotationListSelectedRows([])
        })
      },
    })
  }

  /** 改变组合商品的状态 */
  const handleChangeStatus = (record: BoundCombineDataType) => {
    const { on_shelf, name, quotation } = record
    Modal.confirm({
      title: t(`${!on_shelf ? '上架' : '下架'}`),
      content: (
        <EditShelfStatus
          onShelf={!!on_shelf}
          quotation={quotation || ''}
          combineName={name}
        />
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        ChangeStatus(record).then(() => {
          getQuotationList()
          message.success(t(`${!record.on_shelf ? '上架' : '下架'}成功`))
        })
      },
    })
  }
  /** 删除组合商品 */
  const handleDelMerchanise = (record: BoundCombineDataType) => {
    Modal.confirm({
      title: t('删除'),
      content: <DeleteCombineInQuotation combineName={record.name} />,
      okText: t('删除'),
      okType: 'danger',
      cancelText: t('取消'),
      onOk: () => {
        deleteMerchandise(record).then(() => {
          setQuotationTotal(quotationTotal - 1)
          getQuotationList()
          message.success(t('删除成功'))
        })
      },
    })
  }

  /** 分页功能 */
  const handlePaginationChange = (page: number, pageSize: number) => {
    setQuotationListSelectedRowKeys([])
    setQuotationListSelectedRows([])
    setPaging({ current: page, pageSize: pageSize || 10 })
    const isResetCurrent = pageSize !== paging?.pageSize
    const pageInfo = formatParamsForPagination(page, pageSize)
    setPagination({
      ...pageInfo,
      offset: isResetCurrent ? 0 : pageInfo.offset,
    })

    getQuotationList(isResetCurrent)
  }

  return (
    <Card bordered={false}>
      <BatchActionBarComponent
        selected={quotationListSelectedRowKeys as string[]}
        onClose={handleColse}
        isSelectAll={isAll}
        toggleSelectAll={handleToggleSelectAll}
        count={quotationTotal}
        ButtonNode={
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
            >
              <Space size='middle'>
                <Button
                  onClick={batchGround}
                  disabled={quotationListSelectedRowKeys.length === 0}
                >
                  {t('上架')}
                </Button>
                <Button
                  onClick={batchUndercarriage}
                  disabled={quotationListSelectedRowKeys.length === 0}
                >
                  {t('下架')}
                </Button>

                <Button
                  onClick={batchDelete}
                  disabled={quotationListSelectedRowKeys.length === 0}
                >
                  {t('删除')}
                </Button>
              </Space>
            </PermissionJudge>
          </>
        }
      />
      <Table<BoundCombineDataType>
        style={{ marginTop: '16px' }}
        className='combine-expandable-table'
        loading={quotationLoading}
        columns={columns as any}
        key='quotation_id'
        rowKey='quotation_id'
        expandable={{
          expandedRowRender,
        }}
        rowSelection={rowSelection}
        pagination={false}
        dataSource={quotationList}
      />
      <Flex alignCenter justifyEnd className='tw-h-10 tw-bg-white tw-w-full'>
        <Pagination
          className='tw-text-right tw-mr-1'
          total={quotationTotal}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          current={paging.current}
          pageSize={paging.pageSize}
          showSizeChanger
          showQuickJumper
          onChange={handlePaginationChange}
          showTotal={(total) => t(`共${total}条记录`)}
        />
      </Flex>
    </Card>
  )
})

export default PirceCombine
