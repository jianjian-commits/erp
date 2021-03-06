import React, { useState, useRef, Key, useEffect } from 'react'
import {
  Table,
  Button,
  Divider,
  Card,
  Modal,
  Tag,
  message,
  Space,
  Select,
  Dropdown,
  Menu,
} from 'antd'
import { t } from 'gm-i18n'
import { ColumnType } from 'antd/lib/table'
import store from './store'
import BatchActionBar from '@/common/components/batch_action_bar'
import { toJS } from 'mobx'
import {
  BasicPriceItem_PRICINGFORMULA,
  BulkUpdateBasicPriceV2,
  Quotation,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { observer } from 'mobx-react'
import { formatParamsForPagination } from '@/common/util'
import {
  ChildrenType,
  DataType,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import baseStore from '../store'
import globalStore from '@/stores/global'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import { getMinOrderNumberUnit } from '@/pages/merchandise/util'
import {
  BatchOffShelf,
  BatchOffShelfRef,
  DeleteSkuInQuotation,
  getSelectItemCount,
} from '@/pages/merchandise/components/common'
import TableTextOverflow from '@/common/components/table_text_overflow'
import EditProductModal, {
  EditProductModalRef,
} from '@/pages/merchandise/components/edit_product_modal'
import SyncBasicPriceModal, {
  SyncBasicPriceModalRef,
} from '@/pages/merchandise/manage/merchandise_list/detail/price_sheet/sync_basic_price_modal'
import { parseFormula } from '@/common/components/formula/calculator'
import classNames from 'classnames'
import ReferencePriceMap from '@/pages/merchandise/price_manage/customer_quotation/components/reference_price_map'
import Filter from '@/svg/filter.svg'

const List = () => {
  const {
    filter,
    count,
    list,
    expandedRowKeys,
    setExpandedRowKeys,
    selectedRowKeys,
    setSelectedRowKeys,
    paging,
    setPaging,
    quotationMap,
    priceOf,
  } = store

  const modalRef = useRef<EditProductModalRef>(null)
  const syncModalRef = useRef<SyncBasicPriceModalRef>(null)

  const [isAll, setIsAll] = useState<boolean>(false)
  const [editQuotation, setEditQuotation] = useState<Quotation>({
    quotation_id: '',
    type: 0,
  })

  const batchOffShelfRef = useRef<BatchOffShelfRef>(null)

  const rowSelection = {
    onChange: (
      selectedRowKeys: Key[],
      selectedRows: (DataType | ChildrenType)[],
    ) => {
      let items: ChildrenType[] = []
      selectedRows.forEach((f) => {
        items = [...items, ...f.items]
      })
      store.setSelected(items)
      setIsAll(false)
      setSelectedRowKeys(selectedRowKeys)
    },
    checkStrictly: false,

    /** ???????????????Key */
    selectedRowKeys,
    /** ????????? */
  }

  /**
   * ???????????????
   */
  const pagination = {
    total: count,
    current: paging.current,
    pageSize: paging.pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,

    onChange: (page: number, pageSize?: number) => {
      setPaging({ current: page, pageSize: pageSize || 10 })
      const isResetCurrent = pageSize !== paging.pageSize

      const pageInfo = formatParamsForPagination(page, pageSize)
      store.setPagination({
        ...pageInfo,
        offset: isResetCurrent ? 0 : pageInfo.offset,
      })
      store.fetchList(undefined, isResetCurrent)
    },
    showTotal: (total: number) => `???${total}?????????`,
  }

  /** BatchActionBar ???????????? */
  const handleClose = () => {
    store.setSelected([])
    setIsAll(false)
    setSelectedRowKeys([])
  }

  /** ??????????????????/?????????????????? */
  const handleToggleSelectAll = (params: boolean) => {
    setIsAll(params)
    setSelectedRowKeys(list.map((item) => item.id))
    let selectedList: ChildrenType[] = []
    list.forEach((item) => {
      if (item.items) selectedList = [...selectedList, ...item.items]
    })
    store.setSelected(selectedList)
  }

  /** ?????? */
  const handleDelete = (record: ChildrenType | DataType) => {
    // ??????record.children ????????????????????????????????????
    if (record.items) {
      Modal.confirm({
        title: t('??????'),
        content: <DeleteSkuInQuotation skuName={record.name} />,
        okText: t('??????'),
        cancelText: t('??????'),
        onOk: async () => {
          await store.handleDeleteItems(record.id)
          store.fetchList()
          baseStore.getQuotationCount()
          message.success(t('????????????'))
        },
      })
    } else {
      Modal.confirm({
        title: t('??????'),
        content: <DeleteSkuInQuotation skuName={record.name} />,
        okText: t('??????'),
        cancelText: t('??????'),
        onOk: async () => {
          const { id, parentId } = record as ChildrenType
          const items = toJS(list.find((f) => f.id === parentId))
          if (!items) return

          // ????????????????????????????????????????????????????????????
          if (items.items.length === 1) {
            await store.handleDeleteItems(parentId)
          } else {
            await store.onSubmit(
              items.items.filter((f) => f.id !== id),
              parentId,
            )
          }
          store.fetchList()
          message.success(t('????????????'))
        },
      })
    }
  }

  /** ???????????????????????????????????????????????????????????????????????????????????? */
  const itemCount = isAll ? undefined : store.selected.length

  /**
   * ????????????
   */
  const handleBatchUpdate = () => {
    Modal.confirm({
      title: t('????????????'),
      content: (
        <>
          {getSelectItemCount(itemCount)}
          {t('?????????????????????????????????????????????')}
        </>
      ),
      okText: t('??????'),
      cancelText: t('??????'),
      onOk: () => {
        onBatchUpdate({ on_shelf: 1 }).then(() => {
          message.success(t('??????????????????, ?????????????????????'))
        })
      },
    })
  }

  /**
   * ????????????
   */
  const handleBatchSoldout = () => {
    Modal.confirm({
      title: t('????????????'),
      content: (
        <BatchOffShelf ref={batchOffShelfRef} itemCount={itemCount || 0} />
      ),
      okText: t('??????'),
      cancelText: t('??????'),
      onOk: () => {
        onBatchUpdate({ on_shelf: 2 }).then(() => {
          message.success(t('??????????????????, ?????????????????????'))
        })
      },
    })
  }

  /**
   * ????????????
   */
  const handleBatchDelete = () => {
    Modal.confirm({
      title: t('????????????'),
      content: (
        <>
          {getSelectItemCount(itemCount)}
          {t('?????????????????????????????????????????????')}
        </>
      ),
      okText: t('??????'),
      cancelText: t('??????'),
      onOk: () => {
        onBatchUpdate({ delete: true }).then(() => {
          message.success(t('??????????????????, ?????????????????????'))
        })
      },
    })
  }

  /**
   * ????????????
   * @param on_shelf ?????????
   * @param isDelete ??????
   */
  const onBatchUpdate = (params: any) => {
    if (isAll) {
      params.filter_params = {
        ...store.filter,
        sku_id: baseStore.skuId,
        sku_type: Sku_SkuType.NOT_PACKAGE,
      }
    } else {
      params.basic_price_id = store.selected.map((item) => ({
        sku_id: baseStore.skuId,
        quotation_id: item.parentId,
        unit_id: item.order_unit_id,
      }))
    }

    return BulkUpdateBasicPriceV2({
      ...params,
      sync_combine_sku_on_shelf: batchOffShelfRef.current?.isShelfAssociated,
    }).then(() => {
      globalStore.showTaskPanel('1')
    })
  }

  /** ????????????????????????????????? */
  const editSkuPriceItems = async (record: DataType) => {
    await setEditQuotation(quotationMap[record.id])
    if (modalRef.current) {
      modalRef.current.handleOpen(record)
    }
  }

  /** ???????????????????????? */
  const syncBasicPrice = (record: DataType) => {
    syncModalRef.current &&
      syncModalRef.current.handleOpen(
        record.basic_price_id!,
        record.sku_id!,
        record.id,
      )
  }

  /** ???????????? */
  const onSubmit = (
    data: ChildrenType[],
    skuId: string,
    quotationId: string,
  ) => {
    return store.onSubmit(data, quotationId).then(() => {
      store.fetchList()
    })
  }

  const disabled = store.selected.length === 0

  /** ?????? */
  const expandedRowRender = (record: DataType) => {
    const columns: ColumnType<ChildrenType>[] = [
      { title: '', width: 63, render: () => '' },
      {
        title: (
          <>
            <span className='gm-text-red'>*</span>
            {t('????????????')}
          </>
        ),
        dataIndex: 'current_price',
        key: 'current_price',
        width: 250,
        render: (_, row) => {
          const { current_price } = row
          return current_price ? '??????' : '?????????'
        },
      },
      {
        title: (
          <>
            <span className='gm-text-red'>*</span>
            {t('????????????')}
          </>
        ),
        dataIndex: 'order_unit_id',
        key: 'order_unit_id',
        width: 200,
        render: (_, row) => {
          const { units, order_unit_id } = row
          return units.find((f) => f.value === order_unit_id)?.label || '-'
        },
      },
      {
        title: (
          <>
            <span className='gm-text-red'>*</span>
            {t('????????????')}
          </>
        ),
        key: 'fee_unit_price',
        width: 200,
        dataIndex: 'fee_unit_price',
        render: (_, record, index) => {
          const { fee_unit_price, units, current_price, parentId } = record
          if (current_price) return '-'
          return (
            <>
              {fee_unit_price.val}
              {t('???')}/
              {units.find((f) => f.value === fee_unit_price.unit_id)?.label ||
                '-'}
              <div
                id={`ReferencePriceMap-pricesheet-${parentId}-${index}`}
                className='tw-inline-flex tw-items-center'
              />
            </>
          )
        },
      },
      {
        title: <></>,
        key: 'priceOf',
        width: 200,
        dataIndex: 'priceOf',
        render: (_, record, index) => {
          const { fee_unit_price, units, order_unit_id, id, parentId } =
            record as ChildrenType
          return (
            <>
              <ReferencePriceMap
                quotation={quotationMap[parentId]}
                list={[
                  {
                    sku_id: baseStore.sku.sku_id,
                    // uint64 unit_id        = 2; // ?????????????????? fee_unit_id.unit_id
                    // uint64 order_unit_id  = 3; // ???????????? order_unit_id
                    unit_id: fee_unit_price.unit_id,
                    order_unit_id: order_unit_id,
                  },
                ]}
                type={priceOf}
                record={{ ...record, parentId: baseStore.sku.sku_id }}
                arrowSelector={`#ReferencePriceMap-pricesheet-${parentId}-${index}`}
                // onClickTrend={() => {
                //   setRecord(record)
                //   switch (priceOf) {
                //     case 'quotation_reference_prices':
                //       if (quotation.type === Quotation_Type.PERIODIC)
                //         return (store.view = SubView.Reference)
                //       else return (store.view = SubView.Reference2)
                //     case 'purchase_reference_prices':
                //       return (store.view = SubView.Purchase)
                //     case 'in_stock_reference_prices':
                //       return (store.view = SubView.StockIn)
                //     default:
                //   }
                // }}
              />
            </>
          )
        },
      },
      {
        title: (
          <>
            <span className='gm-text-red'>*</span>
            {t('????????????')}
          </>
        ),
        dataIndex: 'formula_text',
        key: 'formula_text',
        width: 180,
        render: (_, record) => {
          const { formula_text, pricing_formula, current_price } = record
          if (current_price) return '-'
          const text =
            pricing_formula ===
            BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_NONE
              ? '-'
              : parseFormula(formula_text)
                  .map((item) => item.content)
                  .join('')
          return <TableTextOverflow text={text} />
        },
      },
      {
        title: t('???????????????'),
        dataIndex: 'minimum_order_number',
        key: 'minimum_order_number',
        width: 150,
        render: (_, row) => {
          const { units, minimum_order_number, order_unit_id, current_price } =
            row
          if (current_price) return '-'

          return (
            <>
              {minimum_order_number}
              {getMinOrderNumberUnit(units, order_unit_id)}
            </>
          )
        },
      },
      {
        title: t('??????'),
        dataIndex: 'on_shelf',
        key: 'on_shelf',
        width: 100,
        filteredValue: ['true'],
        render: (text) => {
          return (
            <Tag color={text ? '#87d068' : '#ccc'}>
              {text ? t('??????') : t('??????')}
            </Tag>
          )
        },
      },
      {
        title: t('??????'),
        dataIndex: 'operation',
        key: 'operation',
        width: 160,
        render: (_, record) => (
          <a
            className={classNames({
              merchandise_a_disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
              ),
            })}
            onClick={() => handleDelete(record)}
          >
            {t('??????')}
          </a>
        ),
      },
    ]

    return (
      <Table
        rowKey='id'
        rowClassName='table-expandedRow-color'
        columns={columns}
        dataSource={record.items}
        pagination={false}
        showHeader={false}
        onRow={(record) => {
          const on_shelf = record.on_shelf ? 1 : 2
          if (filter.on_shelf !== 0 && on_shelf !== filter.on_shelf) {
            return {
              style: { display: 'none' },
            }
          }
          return {}
        }}
      />
    )
  }

  const columns: ColumnType<DataType>[] = [
    {
      title: (
        <>
          <span className='gm-text-red'>*</span>
          {t('????????????')}
        </>
      ),
      dataIndex: 'current_price',
      key: 'current_price',
      width: 250,
      render: (_, record) => {
        const { name } = record
        return <TableTextOverflow text={name} maxLength={40} />
      },
    },
    {
      title: t('????????????'),
      width: 200,
      dataIndex: 'order_unit_id',
      key: 'order_unit_id',
      onCell: () => ({ colSpan: 3 }),
    },
    {
      title: t('????????????'),
      key: 'fee_unit_price',
      width: 200,
      dataIndex: 'fee_unit_price',
      onCell: () => ({ colSpan: 0 }),
    },
    {
      title: (
        <div className='tw-flex tw-items-center tw-justify-between'>
          <span>
            {(() => {
              switch (priceOf) {
                case 'in_stock_reference_prices':
                  return '???????????????'
                case 'purchase_reference_prices':
                  return '???????????????'
                case 'quotation_reference_prices':
                  return '????????????'
                default:
                  return '-'
              }
            })()}
          </span>
          <Dropdown
            trigger='click'
            overlay={
              <Menu selectedKeys={[store.priceOf]}>
                {[
                  {
                    key: 'quotation_reference_prices',
                    label: '????????????',
                  },
                  {
                    key: 'purchase_reference_prices',
                    label: '???????????????',
                  },
                  {
                    key: 'in_stock_reference_prices',
                    label: '???????????????',
                  },
                ].map((item) => {
                  return (
                    <Menu.Item
                      key={item.key}
                      onClick={() => {
                        store.priceOf = item.key
                      }}
                    >
                      {item.label}
                    </Menu.Item>
                  )
                })}
              </Menu>
            }
          >
            <span className='b-framework-info-down hover:tw-bg-gray-200 tw-cursor-pointer'>
              <Filter style={{ width: 16, height: 16 }} />
            </span>
          </Dropdown>
        </div>
      ),
      key: 'priceOf',
      width: 200,
      dataIndex: 'priceOf',
    },
    {
      title: t('????????????'),
      key: 'fee_unit_price',
      width: 180,
      dataIndex: 'fee_unit_price',
      onCell: () => ({ colSpan: 0 }),
    },
    {
      title: t('???????????????'),
      dataIndex: 'minimum_order_number',
      key: 'minimum_order_number',
      width: 150,
    },
    {
      title: t('??????'),
      dataIndex: 'on_shelf',
      key: 'on_shelf',
      width: 100,
    },
    {
      title: t('??????'),
      dataIndex: 'operation',
      key: 'operation',
      width: 160,
      render: (_, record) => (
        <>
          <a
            className={classNames({
              merchandise_a_disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
              ),
            })}
            onClick={() => editSkuPriceItems(record)}
          >
            {t('??????')}
          </a>
          <Divider type='vertical' />
          {count > 1 && (
            <>
              <a
                className={classNames({
                  merchandise_a_disabled: !globalStore.hasPermission(
                    Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
                  ),
                })}
                onClick={() => syncBasicPrice(record)}
              >
                {t('??????')}
              </a>
              <Divider type='vertical' />
            </>
          )}
          <a
            className={classNames({
              merchandise_a_disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
              ),
            })}
            onClick={() => handleDelete(record)}
          >
            {t('??????')}
          </a>
        </>
      ),
    },
  ]

  useEffect(() => {
    const onPriceOfChange = (e: CustomEvent<typeof priceOf>) => {
      store.priceOf = e.detail
    }
    addEventListener(
      'EDIT_PRODUCT_MODAL|PRICEOF_CHANGE',
      onPriceOfChange as EventListener,
    )
    return () => {
      removeEventListener(
        'EDIT_PRODUCT_MODAL|PRICEOF_CHANGE',
        onPriceOfChange as EventListener,
      )
    }
  }, [])

  return (
    <>
      <Card bordered={false} bodyStyle={{ padding: '16px 24px' }}>
        <BatchActionBar
          onClose={handleClose}
          selected={store.selected.map((item) => item.id)}
          isSelectAll={isAll}
          toggleSelectAll={handleToggleSelectAll}
          ButtonNode={
            <>
              <PermissionJudge
                permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
              >
                <Space size='middle'>
                  <Button disabled={disabled} onClick={handleBatchUpdate}>
                    {t('??????')}
                  </Button>
                  <Button disabled={disabled} onClick={handleBatchSoldout}>
                    {t('??????')}
                  </Button>
                  <Button disabled={disabled} onClick={handleBatchDelete}>
                    {t('??????')}
                  </Button>
                </Space>
              </PermissionJudge>
            </>
          }
        />
        <Table
          rowKey='id'
          loading={store.loading}
          style={{ marginTop: '16px' }}
          columns={columns}
          expandable={{
            defaultExpandAllRows: true,
            expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys,
            expandedRowRender,
          }}
          rowSelection={rowSelection}
          dataSource={list}
          pagination={pagination}
        />
        <EditProductModal
          onSubmit={onSubmit}
          quotation={editQuotation}
          sku={baseStore.sku}
          modalRef={modalRef}
          priceOf={priceOf}
        />
        <SyncBasicPriceModal modalRef={syncModalRef} />
      </Card>
    </>
  )
}

export default observer(List)
