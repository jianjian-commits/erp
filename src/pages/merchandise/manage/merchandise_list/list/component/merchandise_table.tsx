/**
 * @description 商品列表-列表
 */
import React, { FC, useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { Button, Modal, Tag, Space, message, Divider } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { TableList, TableListColumn } from '@gm-pc/business'
import {
  BulkUpdateSkuV2,
  BulkUpdateSkuV2Request,
  DeleteSkuV2,
  map_Sku_NotPackageSubSkuType,
  Sku,
  Sku_SkuType,
  UpdateSkuV2,
} from 'gm_api/src/merchandise'
import BatchActionBarComponent from '@/common/components/batch_action_bar'
import { DataNode, DataOption } from '@/common/interface'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { formatCascaderData } from '@/common/util'
import { history } from '@/common/service'
import globalStore from '@/stores/global'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'
import BatchEditCategory from '@/pages/merchandise/manage/merchandise_list/list/component/batch_edit_category'
import BatchEditSupplierCo from '@/pages/merchandise/manage/merchandise_list/list/component/batch_edit_supplier'
import BatchEditShelf from '@/pages/merchandise/manage/merchandise_list/list/component/batch_edit_shelf'
import {
  DeleteSkuTip,
  EditSkuSaleTip,
  EditSkuSaleTipRef,
} from '@/pages/merchandise/components/common'
import store from '../store'
import '../style.less'
import ProductImage from '@/common/components/product_image'
import Big from 'big.js'
import { Permission } from 'gm_api/src/enterprise'
import classNames from 'classnames'
import '../../../../style.less'
import PermissionJudge from '@/common/components/permission_judge'

interface MerchandiseTableProps {
  categoryTreeData: DataNode[]
}

const { confirm } = Modal

const MerchandiseTable: FC<MerchandiseTableProps> = observer((props) => {
  const {
    list,
    filter,
    count,
    selected,
    setSelected,
    isAllSelected,
    setIsAllSelected,
    categoryMap,
    getList,
  } = store

  const { categoryTreeData } = props

  const [batchModalState, setBatchModalState] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [categoryOptions, setCategoryOptions] = useState<DataOption[]>([])

  const editSkuSaleTipRef = useRef<EditSkuSaleTipRef>(null)

  useEffect(() => {
    setCategoryOptions(formatCascaderData(categoryTreeData))
  }, [categoryTreeData])

  /** 勾选 */
  const handleSelected = (selected: string[]) => {
    setSelected(selected)
    if (selected.length < store.list.length) {
      setIsAllSelected(false)
    }
  }

  /** 取消选中 */
  const cancelSelect = () => {
    setSelected([])
    setIsAllSelected(false)
  }

  /**
   * @description 全选
   * @param params 是否勾选所有页
   */
  const handleToggleSelectAll = (params: boolean) => {
    setIsAllSelected(params)
    setSelected(_.map(list, (item) => item.sku_id))
  }

  /** 关闭需要填写内容的批量操作弹窗 */
  const handleBatchOperate = (type: string) => {
    setBatchModalState(type)
  }

  /** 关闭需要填写内容的批量操作弹窗 */
  const closeBatchModal = () => {
    setBatchModalState('')
  }

  /**
   * @description 批量删除/启售/停售
   * @param req 请求数据
   * @param title 提示文案
   */
  const confirmBatchOperate = (req: BulkUpdateSkuV2Request, title: string) => {
    const newFilter = {
      ...filter,
      category_id: filter.category_ids
        ? filter.category_ids[filter.category_ids.length - 1]
        : '',
    }

    const params = isAllSelected ? newFilter : { sku_ids: selected }

    BulkUpdateSkuV2({
      filter_params: { ...params, sku_type: Sku_SkuType.NOT_PACKAGE },
      sync_combine_sku_on_sale: editSkuSaleTipRef.current?.isSaleAssociated,
      ...req,
    })
      .then((json) => {
        setIsLoading(false)
        setSelected([])
        setIsAllSelected(false)
        globalStore.showTaskPanel('1')
        message.success(t(`正在${title}，请稍后刷新查看`))
      })
      .catch(() => {
        message.error(t(`${title}任务创建失败`))
      })
  }

  /**
   * @description 启售/停售单个商品
   * @param sku 要启售/停售的商品
   * @param isSale 启售(trun)/停售(false)
   * @param title 提示文案
   */
  const confirmEditSaleStatus = (sku: Sku, isSale: boolean, title: string) => {
    UpdateSkuV2({
      sku: { ...sku, on_sale: isSale },
      sync_combine_sku_on_sale: editSkuSaleTipRef.current?.isSaleAssociated,
    })
      .then((json) => {
        getList()
        message.success(`${title}成功`)
      })
      .catch(() => {
        message.error(`${title}失败`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  /**
   * @description 启售/停售
   * @param isBatch 是否批量
   * @param isSale 启售(trun)/停售(false)
   * @param sku 启售/停售的单个商品
   */
  const handleSaleStatus = (isBatch: boolean, isSale: boolean, sku?: Sku) => {
    const editCount = isAllSelected ? count : selected.length
    const title = `${isBatch ? '批量' : ''}${isSale ? '启售' : '停售'}`
    confirm({
      title: t(title),
      content: (
        <EditSkuSaleTip
          isSingle
          ref={editSkuSaleTipRef}
          count={isBatch ? editCount : 0}
          text={isBatch ? '这些商品' : sku?.name}
          isSale={isSale}
        />
      ),
      okType: 'primary',
      onOk: () => {
        setIsLoading(true)
        if (isBatch) {
          confirmBatchOperate({ on_sale: isSale ? 1 : 2 }, title)
        } else {
          confirmEditSaleStatus(sku!, isSale, title)
        }
      },
    })
  }

  /**
   * @description 删除单个商品
   * @param sku 删除的商品
   * @param title 提示文案
   */
  const confirmDelete = (sku: Sku, title: string) => {
    DeleteSkuV2({ sku_id: sku.sku_id })
      .then((json) => {
        getList()
        message.success(`${title}成功`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  /**
   * @description 删除商品
   * @param isBatch 是否批量
   * @param sku 删除单个商品时要删除的商品
   */
  const handleDelete = (isBatch: boolean, sku?: Sku) => {
    const deleteCount = isAllSelected ? count : selected.length
    const title = `${isBatch ? '批量' : ''}删除`
    confirm({
      title: t(title),
      content: (
        <DeleteSkuTip
          count={isBatch ? deleteCount : 0}
          text={isBatch ? '这些商品' : sku?.name}
        />
      ),
      okType: 'danger',
      okText: t('删除'),
      onOk: () => {
        setIsLoading(true)
        if (isBatch) {
          confirmBatchOperate({ delete: true }, title)
        } else {
          confirmDelete(sku!, title)
        }
      },
    })
  }

  /** 详情 */
  const toDetail = (skuId: string) => {
    history.push(`/merchandise/manage/merchandise_list/detail?sku_id=${skuId}`)
  }

  /**  编辑 */
  const toMerchandiseEdit = (id: string) => {
    history.push(`/merchandise/manage/merchandise_list/create?sku_id=${id}`)
  }

  const columns: TableListColumn<Sku>[] = [
    {
      Header: t('商品图片'),
      id: 'image',
      minWidth: 90,
      Cell: (cellProps) => {
        const {
          original: { repeated_field },
        } = cellProps
        const images = repeated_field?.images || []
        console.log(images, 'images')
        return (
          <ProductImage
            width='40px'
            height='40px'
            url={images[0] && images[0].path}
          />
        )
      },
    },
    {
      Header: t('商品名称'),
      id: 'name',
      headerSort: true,
      minWidth: 120,
      Cell: (cellProps) => {
        const {
          original: { name, sku_id },
        } = cellProps
        return (
          <a onClick={() => toDetail(sku_id)}>
            <TableTextOverflow text={name} />
          </a>
        )
      },
    },
    {
      Header: t('商品编码'),
      id: 'customize_code',
      headerSort: true,
      accessor: 'customize_code',
      minWidth: 120,
      Cell: (cellProps) => {
        const {
          original: { customize_code },
        } = cellProps
        return <TableTextOverflow text={customize_code} />
      },
    },
    {
      Header: t('基本单位'),
      id: 'base_unit',
      minWidth: 120,
      Cell: (cellProps) => {
        const {
          row: {
            original: { base_unit_id },
          },
        } = cellProps
        return globalStore.getUnitName(base_unit_id)
      },
    },
    {
      Header: t('商品类型'),
      id: 'not_package_sub_sku_type',
      headerSort: true,
      hide: globalStore.isLite,
      minWidth: 120,
      Cell: (cellProps) => {
        const {
          original: { not_package_sub_sku_type },
        } = cellProps

        if (not_package_sub_sku_type) {
          return map_Sku_NotPackageSubSkuType[not_package_sub_sku_type] || ''
        } else {
          return ''
        }
      },
    },
    {
      Header: t('商品分类'),
      id: 'category_id',
      headerSort: true,
      minWidth: 140,
      Cell: (cellProps) => {
        const {
          original: { category_id },
        } = cellProps
        const { texts } = getCategoryValue(
          [],
          [category_id as string],
          categoryMap,
        )
        const categories =
          texts.length > 1 ? texts.join('/') : texts.length ? texts[0] : ''
        return <TableTextOverflow text={categories as string} />
      },
    },
    {
      Header: t('价格范围（元）'),
      id: 'sale_price',
      minWidth: 120,
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const {
          original: { max_price, min_price },
        } = cellProps
        return min_price && max_price
          ? `${Big(min_price).toFixed(2)}~${Big(max_price).toFixed(2)}`
          : '-'
      },
    },
    {
      Header: t('标准售价（元）'),
      id: 'min_price',
      minWidth: 120,
      hide: !globalStore.isLite, // 仅在轻巧版下显示
      Cell: (cellProps) => {
        const {
          original: { max_price },
        } = cellProps
        return max_price ? Big(max_price).toFixed(2) : '-'
      },
    },
    {
      Header: t('销售状态'),
      id: 'on_sale',
      minWidth: 120,
      Cell: (cellProps) => {
        const {
          original: { on_sale },
        } = cellProps
        const dom = on_sale ? (
          <Tag color='#87d068' className='tw-w-9 tw-text-center'>
            {t('在售')}
          </Tag>
        ) : (
          <Tag
            color='#eee'
            className='tw-w-9 tw-text-center'
            style={{ color: '#626262' }}
          >
            {t('停售')}
          </Tag>
        )
        return dom
      },
    },
    {
      Header: t('操作'),
      id: 'action',
      minWidth: 200,
      fixed: 'right',
      Cell: (cellProps) => {
        const { original } = cellProps
        const { sku_id, on_sale } = original
        return (
          <Space>
            <a
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_UPDATE_NOT_PACKAGE_SKU_SSU,
                ),
              })}
              onClick={() => {
                toMerchandiseEdit(sku_id)
              }}
            >
              {t('编辑')}
            </a>
            <Divider type='vertical' />
            <a
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_UPDATE_NOT_PACKAGE_SKU_SSU,
                ),
              })}
              onClick={() => handleSaleStatus(false, !on_sale, original)}
            >
              {t(on_sale ? '停售' : '启售')}
            </a>
            <Divider type='vertical' />
            <a
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_DELETE_NOT_PACKAGE_SKU_SSU,
                ),
              })}
              onClick={() => handleDelete(false, original)}
            >
              {t('删除')}
            </a>
          </Space>
        )
      },
    },
  ]

  return (
    <div className='merchandise_table_wrap'>
      <TableList<Sku>
        id='merchandise_table'
        isDiy
        isHeaderSort
        keyField='sku_id'
        data={list}
        filter={filter}
        service={getList}
        columns={columns}
        isUpdateEffect={false}
        isSelect
        selected={selected}
        onSelect={handleSelected}
        className='merchandise_table_list'
        paginationOptions={{
          paginationKey: 'merchandise_table',
          defaultPaging: { need_count: true },
        }}
        batchActionBar={
          <BatchActionBarComponent
            selected={selected}
            onClose={cancelSelect}
            isSelectAll={isAllSelected}
            toggleSelectAll={handleToggleSelectAll}
            count={isAllSelected ? count : selected.length}
            ButtonNode={
              <>
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_MERCHANDISE_UPDATE_NOT_PACKAGE_SKU_SSU
                  }
                >
                  <Space size='middle'>
                    <Button
                      disabled={selected.length === 0}
                      onClick={() => handleSaleStatus(true, true)}
                    >
                      {t('启售')}
                    </Button>
                    <Button
                      disabled={selected.length === 0}
                      onClick={() => handleSaleStatus(true, false)}
                    >
                      {t('停售')}
                    </Button>
                    <Button
                      disabled={selected.length === 0}
                      onClick={() => handleBatchOperate('category')}
                    >
                      {t('修改分类')}
                    </Button>

                    {!globalStore.isLite && (
                      <Button
                        disabled={selected.length === 0}
                        onClick={() => handleBatchOperate('supplier')}
                      >
                        {t('修改供应商协作模式')}
                      </Button>
                    )}
                    {!globalStore.isLite && (
                      <Button
                        disabled={selected.length === 0}
                        onClick={() => handleBatchOperate('shelf')}
                      >
                        {t('修改默认货位')}
                      </Button>
                    )}
                  </Space>
                </PermissionJudge>
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_MERCHANDISE_DELETE_NOT_PACKAGE_SKU_SSU
                  }
                >
                  <Button
                    disabled={selected.length === 0}
                    onClick={() => handleDelete(true)}
                  >
                    {t('删除')}
                  </Button>
                </PermissionJudge>
              </>
            }
          />
        }
      />
      <BatchEditCategory
        isModalVisible={batchModalState === 'category'}
        closeModal={closeBatchModal}
        categoryOption={categoryOptions}
      />
      <BatchEditSupplierCo
        isModalVisible={batchModalState === 'supplier'}
        closeModal={closeBatchModal}
      />
      <BatchEditShelf
        isModalVisible={batchModalState === 'shelf'}
        closeModal={closeBatchModal}
      />
    </div>
  )
})

export default MerchandiseTable
