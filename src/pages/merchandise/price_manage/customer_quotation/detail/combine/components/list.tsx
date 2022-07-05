/* eslint-disable react-hooks/exhaustive-deps */
import React, { Key, useEffect, useState } from 'react'
import {
  Tag,
  Button,
  Table,
  Pagination,
  Card,
  Divider,
  Modal,
  message,
  Space,
} from 'antd'
import { Flex } from '@gm-pc/react'
import { BoundCombineDataType, BoundCombineChildrenType } from '../interface'
import BatchActionBarComponent from '@/common/components/batch_action_bar'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { t } from 'gm-i18n'
import HintComponent from '@/pages/merchandise/components/hint'
import _ from 'lodash'
import ProductImage from '@/common/components/product_image'
import TableTextOverflow from '@/common/components/table_text_overflow'
import globalStore from '@/stores/global'
import baseStore from '../../store'
import { ColumnType } from 'antd/lib/table'
import { formatParamsForPagination } from '@/common/util'
import {
  DeleteCombineInQuotation,
  EditShelfStatus,
  getSelectItemCount,
} from '@/pages/merchandise/components/common'
import store from '../store'
import { observer } from 'mobx-react'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import classNames from 'classnames'

const PirceCombine = () => {
  const {
    loading,
    paging,
    combineSkuList,
    combineTotal,
    combineListSelectedRowKeys,
    getCombineSkuList,
    clearStore,
    setPaging,
    onBatchUpdate,
    setPagination,
    setCombineListSelectedRowKeys,
    setCombineListSelectedRows,
    setCount,
    deleteMerchandise,
    ChangeStatus,
  } = store

  // 是否全选
  const [isAll, setIsAll] = useState<boolean>(false)

  useEffect(() => {
    return () => clearStore()
  }, [])

  const columns: ColumnType<BoundCombineDataType>[] = [
    {
      title: t('商品图片'),
      key: 'category_id',
      width: 150,
      render: (_, record) => {
        const { repeated_field } = record
        const images = repeated_field?.images || []

        return <ProductImage url={images[0] && images[0].path} />
      },
    },
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
      title: t('组成商品'),
      dataIndex: 'combineSkus',
      key: 'combineSkus',
      width: 150,
      render: (text: string) => <TableTextOverflow text={text} />,
    },
    {
      title: t('商品单价'),
      key: 'totalPrice',
      dataIndex: 'totalPrice',
      width: 100,
      render: (text: string) => t(`${text}元`),
    },
    {
      title: t('商品数量'),
      dataIndex: 'base_unit_id',
      key: 'base_unit_id',
      width: 100,
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

  /** 改变组合商品的状态 */
  const handleChangeStatus = (record: BoundCombineDataType) => {
    const { on_shelf, quotation, name } = record
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
          getCombineSkuList()
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
          setCount(combineTotal - 1)
          baseStore.getQuotation()
          getCombineSkuList()
          message.success(t('删除成功'))
        })
      },
    })
  }
  /** 组成商品 */
  const expandedRowRender = (data: BoundCombineDataType) => {
    const columns = [
      { title: '', width: 70, render: () => '' },

      {
        title: t('商品图片'),
        key: 'name',
        width: 150,
        render: () => '',
      },
      {
        title: t('组合商品名称'),
        key: 'name',
        width: 150,
        render: () => '',
      },
      {
        title: t('组成商品'),
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
        title: t('商品单价'),
        key: 'price',
        dataIndex: 'price',
        width: 100,
        render: (text: string, record: BoundCombineChildrenType) =>
          t(`${text}元/${record.priceUnitName}`),
      },
      {
        title: t('商品数量'),
        dataIndex: 'ratio',
        key: 'ratio',
        width: 100,
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
    onChange: (
      selectedRowKeys: Key[],
      selectedRows: BoundCombineDataType[],
    ) => {
      setCombineListSelectedRows(selectedRows)
      setIsAll(false)
      setCombineListSelectedRowKeys(selectedRowKeys)
    },
    checkStrictly: false,

    /** 已经选择的Key */
    selectedRowKeys: combineListSelectedRowKeys,

    /** 跨页用 */
  }

  /** 关闭切换的头部 */
  const handleClose = () => {
    setCombineListSelectedRows([])
    setCombineListSelectedRowKeys([])
    setIsAll(false)
  }

  /** 切换 */
  const handleToggleSelectAll = (params: boolean) => {
    setIsAll(params)
    setCombineListSelectedRowKeys(_.map(combineSkuList, (item) => item.sku_id))
    setCombineListSelectedRows(combineSkuList)
  }

  /** 分页功能 */
  const handlePaginationChange = (page: number, pageSize: number) => {
    setCombineListSelectedRowKeys([])
    setCombineListSelectedRows([])
    setPaging({ current: page, pageSize: pageSize || 10 })
    const isResetCurrent = pageSize !== paging.pageSize
    const pageInfo = formatParamsForPagination(page, pageSize)
    setPagination({
      ...pageInfo,
      offset: isResetCurrent ? 0 : pageInfo.offset,
    })

    getCombineSkuList(isResetCurrent)
  }

  const itemCount = isAll ? undefined : combineListSelectedRowKeys.length
  /** 批量上架 */
  const batchGround = () => {
    Modal.confirm({
      title: t('批量上架'),
      content: (
        <>
          {getSelectItemCount(itemCount)}
          {t('确定要上架这些组合商品吗？')}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ on_shelf: 1, isAll }).then(() => {
          message.success('正在批量上架，请稍后刷新查看')
          globalStore.showTaskPanel('1')
          setCombineListSelectedRowKeys([])
          setCombineListSelectedRows([])
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
          {t('确定要批量下架这些报价单中的组合商品吗？')}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ on_shelf: 2, isAll }).then(() => {
          message.success('正在批量下架，请稍后刷新查看')
          globalStore.showTaskPanel('1')
          setCombineListSelectedRowKeys([])
          setCombineListSelectedRows([])
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
      okText: t('删除'),
      okType: 'danger',
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ delete: true, isAll }).then(() => {
          message.success('正在批量删除，请稍后刷新查看')
          globalStore.showTaskPanel('1')
          setCombineListSelectedRowKeys([])
          setCombineListSelectedRows([])
        })
      },
    })
  }
  return (
    <Card bordered={false}>
      <BatchActionBarComponent
        selected={combineListSelectedRowKeys as string[]}
        onClose={handleClose}
        isSelectAll={isAll}
        toggleSelectAll={handleToggleSelectAll}
        count={combineTotal}
        ButtonNode={
          <PermissionJudge
            permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
          >
            <Space size='middle'>
              <Button
                onClick={batchGround}
                disabled={combineListSelectedRowKeys.length === 0}
              >
                {t('上架')}
              </Button>
              <Button
                onClick={batchUndercarriage}
                disabled={combineListSelectedRowKeys.length === 0}
              >
                {t('下架')}
              </Button>
              <Button
                onClick={batchDelete}
                disabled={combineListSelectedRowKeys.length === 0}
              >
                {t('删除')}
              </Button>
            </Space>
          </PermissionJudge>
        }
      />
      <Table<BoundCombineDataType>
        style={{ marginTop: '16px' }}
        loading={loading}
        columns={columns as any}
        rowKey='sku_id'
        expandable={{
          expandedRowRender,
        }}
        rowSelection={rowSelection}
        pagination={false}
        dataSource={combineSkuList}
      />
      <Flex alignCenter justifyEnd className='tw-h-10 tw-bg-white tw-w-full'>
        <Pagination
          className='tw-text-right tw-mr-1'
          current={paging.current}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          pageSize={paging.pageSize}
          total={combineTotal}
          onChange={handlePaginationChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => t(`共${total}条记录`)}
        />
      </Flex>
    </Card>
  )
}

export default observer(PirceCombine)
