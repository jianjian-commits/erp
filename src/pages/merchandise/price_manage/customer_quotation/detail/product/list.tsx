import React, { useState, useRef, Key, createContext, useEffect } from 'react'
import {
  Table,
  Button,
  Divider,
  Card,
  Modal,
  Tag,
  message,
  PaginationProps,
  TableColumnType,
  Space,
  Select,
  Dropdown,
  Menu,
} from 'antd'
import { t } from 'gm-i18n'
import store from './store'
import BatchActionBar from '@/common/components/batch_action_bar'
import { toJS } from 'mobx'
import {
  BasicPriceItem_PRICINGFORMULA,
  BasicPriceItem_PRICINGTYPE,
  BatchCalculatePricingFormula,
  BulkUpdateBasicPriceV2,
  DeltaUpdateBasicPriceV2ByPricingFormula,
  DeltaUpdateBasicPriceV2ByPricingFormulaRequest,
  DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo,
  GetSkuReferencePricesResponse_ReferencePrices,
  Sku,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
// import PermissionJudge from '@/common/components/permission_judge'
// import { Permission } from 'gm_api/src/enterprise'
import { observer } from 'mobx-react'
import { formatParamsForPagination, list2MapSeveralKey } from '@/common/util'
import {
  ChildrenType,
  DataType,
} from '@/pages/merchandise/price_manage/customer_quotation/data'
import baseStore from '../store'
import globalStore from '@/stores/global'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import './style.less'
import {
  BatchOffShelf,
  BatchOffShelfRef,
  DeleteSkuInQuotation,
  getSelectItemCount,
} from '@/pages/merchandise/components/common'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { getMinOrderNumberUnit } from '@/pages/merchandise/util'
import ProductImage from '@/common/components/product_image'

import FormulartModal, {
  CurrentSetFormValues,
  FormularlRef,
  PresetFormValues,
} from '@/pages/merchandise/components/formular_modal/formular_modal'
import _ from 'lodash'
import EditProductModal, {
  EditProductModalRef,
} from '@/pages/merchandise/components/edit_product_modal'
import { parseFormula } from '@/common/components/formula/calculator'
import { Formula_Type } from '@/pages/merchandise/enum'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import classNames from 'classnames'
import ReferencePriceMap from '@/pages/merchandise/price_manage/customer_quotation/components/reference_price_map'
import Filter from '@/svg/filter.svg'

export const selectSkuIdsContext = createContext<ChildrenType[]>([])

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
    skuMap,
    selected,
    priceOf,
  } = store

  const modalRef = useRef<EditProductModalRef>(null)
  const presetFormularModalRef = useRef<FormularlRef>(null)

  const batchOffShelfRef = useRef<BatchOffShelfRef>(null)

  const [isAll, setIsAll] = useState<boolean>(false)
  /** 当前编辑的商品 */
  const [editSku, setEditSku] = useState<Sku>({
    sku_id: '',
    base_unit_id: '',
    name: '',
    customize_code: '',
    sku_type: 0,
    dispatch_type: 0,
    loss_ratio: '',
  })

  const rowSelection = {
    onChange: (
      selectedRowKeys: Key[],
      selectedRows: (DataType | ChildrenType)[],
    ) => {
      // 移除父商品
      const items = selectedRows.filter((f) => !f.items) as ChildrenType[]
      store.setSelected(items)
      setIsAll(false)
      setSelectedRowKeys(selectedRowKeys)
    },
    checkStrictly: false,

    /** 已经选择的Key */
    selectedRowKeys,
    /** 跨页用 */
  }

  /**
   * 页码器相关
   */
  const pagination: PaginationProps = {
    current: paging.current,
    pageSize: paging.pageSize,
    total: count,
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
      store.fetchList(undefined, isResetCurrent)
    },
    showTotal: (total) => `共${total}条记录`,
  }

  /** BatchActionBar 取消操作 */
  const handleClose = () => {
    store.setSelected([])
    setIsAll(false)
    setSelectedRowKeys([])
  }

  /** 切换全选所有/选择当前页面 */
  const handleToggleSelectAll = (params: boolean) => {
    setIsAll(params)
    setSelectedRowKeys(list.map((item) => item.id))
    let selectedList: ChildrenType[] = []
    list.forEach((item) => {
      if (item.items) selectedList = [...selectedList, ...item.items]
    })

    store.setSelected(selectedList)
  }

  /** 删除 */
  const handleDelete = (record: ChildrenType | DataType) => {
    // 根据record.children 来判断是删除单个还是多个
    if (record.items) {
      Modal.confirm({
        title: t('删除'),
        content: <DeleteSkuInQuotation skuName={record.name} />,
        okText: t('删除'),
        okType: 'danger',
        cancelText: t('取消'),
        onOk: async () => {
          await store.handleDeleteItems(record.id)
          store.setCount(store.count - 1)
          baseStore.getQuotation()

          store.fetchList()
          message.success(t('删除成功'))
        },
      })
    } else {
      Modal.confirm({
        title: t('删除'),
        content: <DeleteSkuInQuotation />,
        okText: t('删除'),
        okType: 'danger',
        cancelText: t('取消'),
        onOk: async () => {
          const { id, parentId } = record as ChildrenType
          const items = toJS(list.find((f) => f.id === parentId))
          if (!items) return

          // 当前商品只有一个商品条目时，删除整个商品
          if (items.items.length === 1) {
            await store.handleDeleteItems(parentId)
            store.setCount(store.count - 1)
            baseStore.getQuotation()
          } else {
            await store.onSubmit(
              items.items.filter((f) => f.id !== id),
              parentId,
            )
          }
          store.fetchList()
          message.success(t('删除成功'))
        },
      })
    }
  }

  /** 二次确认中已选择的商品条目数量，全选时候取空，判断为所有 */
  const itemCount = isAll ? undefined : store.selected.length

  /**
   * 批量上架
   */
  const handleBatchUpdate = () => {
    Modal.confirm({
      title: t('批量上架'),
      content: (
        <>
          {getSelectItemCount(itemCount)}
          {t('确定要上架这些商品销售条目吗？')}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ on_shelf: 1 }).then(() => {
          message.success(t('正在批量上架, 请稍后刷新查看'))
        })
      },
    })
  }

  /**
   * 批量下架
   */
  const handleBatchSoldout = () => {
    Modal.confirm({
      title: t('批量下架'),
      content: (
        <BatchOffShelf ref={batchOffShelfRef} itemCount={itemCount || 0} />
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ on_shelf: 2 }).then(() => {
          message.success(t('正在批量下架, 请稍后刷新查看'))
        })
      },
    })
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = () => {
    Modal.confirm({
      title: t('批量删除'),
      content: (
        <>
          {getSelectItemCount(itemCount)}
          {t('确定要删除这些商品销售条目吗？')}
        </>
      ),
      okText: t('删除'),
      okType: 'danger',
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ delete: true }).then(() => {
          message.success(t('正在批量删除, 请稍后刷新查看'))
        })
      },
    })
  }

  /**
   * 批量修改
   * @param on_shelf 上下架
   * @param isDelete 删除
   */
  const onBatchUpdate = (params: any) => {
    if (isAll) {
      params.filter_params = {
        ...store.filter,
        quotation_id: baseStore.quotation_id,
        sku_type: Sku_SkuType.NOT_PACKAGE,
        category_id:
          store.filter.category_id === '00'
            ? undefined
            : store.filter.category_id,
      }
    } else {
      params.basic_price_id = store.selected.map((item) => ({
        quotation_id: baseStore.quotation_id,
        sku_id: item.parentId,
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

  /**
   * @description: 批量设置预设公式
   * @param {*}
   * @return {*}
   */
  const handleBatchPresetFormular = () => {
    presetFormularModalRef.current &&
      presetFormularModalRef.current.handleOpen('preset')
  }

  /**
   * @description: 批量设置公式定价
   * @param {*}
   * @return {*}
   */
  const handleBatchCurrentFormular = () => {
    presetFormularModalRef.current &&
      presetFormularModalRef.current.handleOpen('currentSet')
  }

  /** 编辑单个商品价格条目 */
  const editSkuPriceItems = async (record: DataType) => {
    await setEditSku(skuMap[record.id])
    if (modalRef.current) {
      modalRef.current.handleOpen(record)
    }
  }

  /** 提交编辑 */
  const onSubmit = (
    data: ChildrenType[],
    skuId: string,
    quotationId: string,
  ) => {
    return store.onSubmit(data, skuId).then(async () => {
      await store.fetchList()
      dispatchEvent(
        new CustomEvent(
          'force_update|merchandise/price_manage/customer_quotation/components/reference_price_map/index.tsx',
        ),
      )
    })
  }

  /**
   * @description: 提交预设公式
   * @param {PresetFormValues} data
   * @return {*}
   */
  const onPresetSubmit = (
    data: PresetFormValues,
    onClose: (...args: any) => any,
  ) => {
    return store.onPresetSubmit(isAll, data).then((res) => {
      message.success(t('正在批量预设定价公式, 请稍后刷新查看'))
      onClose()
      globalStore.showTaskPanel('1')
    })
  }

  /**
   * @description: 提交公式定价
   * @param {*}
   * @return {*}
   */
  const onFormulaAffectSubmit = (
    modifyList: Required<DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo>[],
    formulaParams: CurrentSetFormValues,
    deleteRow: string[],
    onClose: (...args: any) => any,
  ) => {
    const modifyMap = list2MapSeveralKey(modifyList, [
      'order_unit_id',
      'sku_id',
    ])

    const { pricing_type, formula_text, rangePriceList, formular_type } =
      formulaParams
    const request = {
      chosen_all: isAll,
      quotation_id: baseStore.quotation_id,
      basic_price_item_infos: isAll
        ? modifyList
        : selected
            .filter((s) => !deleteRow.includes(s.id))
            .map((item) => {
              return {
                sku_id: item.parentId,
                order_unit_id: item.order_unit_id,
                price: Object.keys(modifyMap).includes(
                  item.order_unit_id + item.parentId,
                )
                  ? `${modifyMap[item.order_unit_id + item.parentId].price}`
                  : '',
              }
            }),
      ...(formular_type === Formula_Type.PRESET
        ? {}
        : {
            pricing_type: pricing_type,
            ...(pricing_type === BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL
              ? {
                  formula: formula_text,
                }
              : {
                  price_intervals: {
                    price_intervals: rangePriceList.map((item) => ({
                      begin: `${item.min}`,
                      end: `${item.max}`,
                      formula_text: item.formula,
                    })),
                    reference_price_type: rangePriceList[0].type,
                  },
                }),
          }),
    }

    BatchCalculatePricingFormula({ request }).then((res) => {
      message.success(t('正在批量进行公式定价, 请稍后刷新查看'))
      onClose()
      globalStore.showTaskPanel('1')
    })
  }

  /**
   * @description 子表
   * @deprecated
   */
  const expandedRowRender = (record: DataType) => {
    const columns: TableColumnType<ChildrenType>[] = [
      { title: '', width: 70, render: () => '' },

      {
        title: (
          <>
            <span className='gm-text-red'>*</span>
            {t('下单单位')}
          </>
        ),
        dataIndex: 'order_unit_id',
        key: 'order_unit_id',
        width: 250,
        // align: 'center',
        render: (_, row) => {
          const { units, order_unit_id } = row
          return units.find((f) => f.value === order_unit_id)?.label || '-'
        },
      },
      {
        title: (
          <>
            <span className='gm-text-red'>*</span>
            {t('商品单价')}
          </>
        ),
        key: 'fee_unit_price',
        // align: 'center',
        width: 200,
        dataIndex: 'fee_unit_price',
        render: (_, record) => {
          const { fee_unit_price, units } = record
          return (
            <>
              {fee_unit_price.val}
              {t('元')}/
              {units.find((f) => f.value === fee_unit_price.unit_id)?.label ||
                '-'}
            </>
          )
        },
      },
      {
        title: t('最小起订数'),
        dataIndex: 'minimum_order_number',
        key: 'minimum_order_number',
        // align: 'center',

        width: 200,
        render: (_, row) => {
          const { units, minimum_order_number, order_unit_id } = row

          return (
            <>
              {minimum_order_number}
              {getMinOrderNumberUnit(units, order_unit_id)}
            </>
          )
        },
      },
      {
        title: t('状态'),
        dataIndex: 'on_shelf',
        key: 'on_shelf',
        align: 'center',
        width: 100,
        render: (text) => {
          return (
            <Tag color={text ? '#87d068' : '#ccc'}>
              {text ? t('上架') : t('下架')}
            </Tag>
          )
        },
      },
      {
        title: t('操作'),
        dataIndex: 'operation',
        key: 'operation',
        width: 120,
        render: (_, record) => (
          <a onClick={() => handleDelete(record)}>{t('删除')}</a>
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

  const disabled = store.selectedRowKeys.length === 0

  const columns: TableColumnType<DataType | ChildrenType>[] = [
    {
      title: (
        <>
          <span className='gm-text-red'>*</span>
          {t('价格类型')}
        </>
      ),
      dataIndex: 'current_price',
      key: 'current_price',
      width: 250,
      render: (_, record) => {
        const { name, items, customize_code = '', images } = record
        if (items) {
          return (
            <div className='gm-order-unit-tr-colspan'>
              <ProductImage url={images?.path} />
              <TableTextOverflow text={name + ' ID:' + customize_code} />
            </div>
          )
        }
        const { current_price } = record as ChildrenType
        return current_price ? '时价' : '非时价'
      },
    },
    {
      title: (
        <>
          <span className='gm-text-red'>*</span>
          {t('下单单位')}
        </>
      ),
      width: 250,
      dataIndex: 'order_unit_id',
      key: 'order_unit_id',
      render: (_, record) => {
        const { items } = record

        if (items) return
        const { units, order_unit_id } = record as ChildrenType
        return units.find((f) => f.value === order_unit_id)?.label || '-'
      },
      className: 'gm-order-unit-columns tw-pl-5',
    },
    {
      title: t('商品单价'),
      key: 'fee_unit_price',
      width: 200,
      dataIndex: 'fee_unit_price',
      render: (_, record) => {
        if (record.items) return
        const {
          fee_unit_price,
          units,
          current_price,
          parentId,
          order_unit_id,
        } = record as ChildrenType
        if (current_price) return '-'
        return (
          <>
            {fee_unit_price.val}
            {t('元')}/
            {units.find((f) => f.value === fee_unit_price.unit_id)?.label ||
              '-'}
            <div
              id={`ReferencePriceMap-list-${priceOf}-${parentId}-${fee_unit_price.unit_id}-${order_unit_id}`}
              className='tw-inline-flex tw-items-center'
            />
          </>
        )
      },
    },
    {
      title: (
        <div className='tw-flex tw-items-center tw-justify-between'>
          <span>
            {(() => {
              switch (priceOf) {
                case 'in_stock_reference_prices':
                  return '最近入库价'
                case 'purchase_reference_prices':
                  return '最近采购价'
                case 'quotation_reference_prices':
                  return '最近报价'
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
                    label: '最近报价',
                  },
                  {
                    key: 'purchase_reference_prices',
                    label: '最近采购价',
                  },
                  {
                    key: 'in_stock_reference_prices',
                    label: '最近入库价',
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
      render: (_, record) => {
        if (record.items) return
        const { fee_unit_price, units, order_unit_id, parentId } =
          record as ChildrenType
        return (
          <>
            <ReferencePriceMap
              quotation={baseStore.quotation || baseStore.parentQuotation}
              list={store.list.reduce(
                (pre, cur, i) => [
                  ...pre,
                  ...cur.items.map((item) => {
                    return {
                      sku_id: cur.id!,
                      unit_id: item.fee_unit_price.unit_id,
                      order_unit_id: item.order_unit_id,
                    }
                  }),
                ],
                [] as any[],
              )}
              type={store.priceOf}
              arrowSelector={`#ReferencePriceMap-list-${priceOf}-${parentId}-${fee_unit_price.unit_id}-${order_unit_id}`}
              record={{
                ...record,
                parentId: (record as ChildrenType).parentId,
              }}
            />
          </>
        )
      },
    },
    {
      title: t('定价公式'),
      key: 'formula_text',
      width: 200,
      dataIndex: 'formula_text',
      render: (_, record) => {
        if (record.items) return
        const { formula_text, current_price } = record as ChildrenType
        if (current_price) return '-'
        return (
          <TableTextOverflow
            text={parseFormula(formula_text)
              .map((item) => item.content)
              .join('')}
          />
        )
      },
    },
    {
      title: t('最小起订数'),
      dataIndex: 'minimum_order_number',
      key: 'minimum_order_number',
      width: 200,
      render: (_, record) => {
        if (record.items) return
        const { order_unit_id, units, minimum_order_number, current_price } =
          record as ChildrenType
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
      title: t('状态'),
      dataIndex: 'on_shelf',
      key: 'on_shelf',
      width: 100,
      render: (text, record) => {
        if (record.items) return
        return (
          <Tag color={text ? '#87d068' : '#ccc'}>
            {text ? t('上架') : t('下架')}
          </Tag>
        )
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
      render: (_val, record) => {
        const { items } = record
        const isParentNode = !_.isNil(items)
        return (
          <>
            {isParentNode && (
              <>
                <a
                  className={classNames({
                    merchandise_a_disabled: !globalStore.hasPermission(
                      Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
                    ),
                  })}
                  onClick={() => editSkuPriceItems(record as DataType)}
                >
                  {t('编辑')}
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
              {t('删除')}
            </a>
          </>
        )
      },
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
    <Card bordered={false} className='search-table'>
      <BatchActionBar
        onClose={handleClose}
        selected={store.selected.map((item) => item.id)}
        isSelectAll={isAll}
        toggleSelectAll={handleToggleSelectAll}
        ButtonNode={
          <PermissionJudge
            permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
          >
            <Space size='middle'>
              <Button disabled={disabled} onClick={handleBatchUpdate}>
                {t('上架')}
              </Button>
              <Button disabled={disabled} onClick={handleBatchSoldout}>
                {t('下架')}
              </Button>
              <Button disabled={disabled} onClick={handleBatchDelete}>
                {t('删除')}
              </Button>
              <Button disabled={disabled} onClick={handleBatchPresetFormular}>
                {t('预设公式')}
              </Button>
              <Button disabled={disabled} onClick={handleBatchCurrentFormular}>
                {t('公式定价')}
              </Button>
            </Space>
          </PermissionJudge>
        }
      />
      <div className='reset-ant-table-row-bgc'>
        <Table
          childrenColumnName='items'
          loading={store.loading}
          rowKey='id'
          style={{ marginTop: '16px' }}
          columns={columns as TableColumnType<DataType>[]}
          expandable={{
            defaultExpandAllRows: true,
            expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys,
          }}
          rowSelection={rowSelection}
          dataSource={list}
          pagination={pagination}
          onRow={(record) => {
            if (_.has(record, 'on_shelf')) {
              const on_shelf = record.on_shelf ? 1 : 2
              if (filter.on_shelf !== 0 && on_shelf !== filter.on_shelf) {
                return {
                  style: { display: 'none' },
                }
              }
            }
            return {}
          }}
        />
      </div>
      <EditProductModal
        onSubmit={onSubmit}
        sku={editSku}
        quotation={baseStore.quotation}
        priceOf={priceOf}
        modalRef={modalRef}
      />
      <selectSkuIdsContext.Provider value={isAll ? [] : store.selected}>
        <FormulartModal
          modalRef={presetFormularModalRef}
          handlePresetOK={onPresetSubmit}
          handleFormulaAffect={onFormulaAffectSubmit}
        />
      </selectSkuIdsContext.Provider>
    </Card>
  )
}

export default observer(List)
