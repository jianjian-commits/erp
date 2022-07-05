import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { TableList, TableListColumn } from '@gm-pc/business'
import productDefaultImg from '@/img/product-default-gm.png'
import {
  BulkUpdateSkuV2,
  BulkUpdateSkuV2Request,
  DeleteSkuV2,
  Ingredient,
  Sku,
  Sku_SkuType,
  UpdateSkuV2,
} from 'gm_api/src/merchandise'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { Button, Space, Tag, Modal, message, Divider } from 'antd'
import store from '../store'
import BatchActionBarComponent from '@/common/components/batch_action_bar'
import _ from 'lodash'
import globalStore from '@/stores/global'
import {
  DeleteSkuTip,
  EditSkuSaleTip,
} from '@/pages/merchandise/components/common'
import { gmHistory as history } from '@gm-common/router'
import TableTextOverflow from '@/common/components/table_text_overflow'
import HintComponent from '@/pages/merchandise/components/hint'
import classNames from 'classnames'
import '../../../style.less'

const { confirm } = Modal
const ListV2: FC = observer(() => {
  const {
    list,
    filter,
    count,
    isAllSelected,
    selected,
    setSelected,
    setIsAllSelected,
    getCombineList,
  } = store

  const [isLoading, setIsLoading] = useState<boolean>(false)
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

  /**
   * @description 批量删除/启售/停售
   * @param req 请求数据
   * @param title 提示文案
   */
  const confirmBatchOperate = (req: BulkUpdateSkuV2Request, title: string) => {
    const params = isAllSelected ? filter : { sku_ids: selected }
    BulkUpdateSkuV2({
      filter_params: { ...params, sku_type: Sku_SkuType.COMBINE },
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
      sku: { ...sku, on_sale: isSale, production_unit: undefined },
    })
      .then((json) => {
        getCombineList()
        message.success(`${title}成功`)
      })
      .catch(() => {
        // message.error(`${title}失败`)
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
          count={isBatch ? editCount : 0}
          text={isBatch ? '这些组合商品' : sku?.name}
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
        getCombineList()
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
    history.push(`/merchandise/manage/combine/detail?sku_id=${skuId}`)
  }

  /**  编辑 */
  const toCombineEdit = (id: string) => {
    history.push(`/merchandise/manage/combine/create?sku_id=${id}`)
  }

  /** 获取提示文本 */
  const getTips = (ingredients: Ingredient[] | undefined) => {
    if (!ingredients) {
      return []
    }
    let isAllOnSale = true
    _.forEach(ingredients, (ingredientItem) => {
      isAllOnSale = isAllOnSale && !!ingredientItem.on_sale
    })

    return isAllOnSale
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
        const src = images[0]
          ? `https://qncdn.guanmai.cn/${images[0].path}?imageView2/3/w/60`
          : productDefaultImg
        return (
          <img
            data-id='initMatchImagesImage'
            src={src}
            style={{
              maxWidth: '40px',
              maxHeight: '40px',
              width: '100%',
              height: '100%',
            }}
          />
        )
      },
    },
    {
      Header: t('组合商品名称'),
      id: 'name',
      minWidth: 150,
      Cell: (cellProps) => {
        const { name, sku_id, ingredients } = cellProps.original
        const isAllOnSale = getTips(ingredients?.ingredients)
        return (
          <span>
            <a onClick={() => toDetail(sku_id)}>
              <TableTextOverflow text={name} />
            </a>

            {!isAllOnSale && (
              <HintComponent type='1' content='存在停售的子商品' />
            )}
          </span>
        )
      },
    },
    {
      Header: t('商品编码'),
      id: 'customize_code',
      accessor: 'customize_code',
      minWidth: 150,
      Cell: (cellProps) => {
        const { customize_code } = cellProps.original
        return <TableTextOverflow text={customize_code} />
      },
    },
    {
      Header: t('下单单位'),
      id: 'base_unit_id',
      minWidth: 120,
      Cell: (cellProps) => {
        const {
          original: { base_unit_id },
        } = cellProps
        const unit = globalStore.getUnit(base_unit_id)
        return unit?.text || '-'
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
      fixed: 'right',
      minWidth: 200,
      Cell: (cellProps) => {
        const { original } = cellProps
        const { sku_id, on_sale } = original
        return (
          <Space>
            <a
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_UPDATE_COMBINE_SSU,
                ),
              })}
              onClick={() => {
                toCombineEdit(sku_id)
              }}
            >
              {t('编辑')}
            </a>
            <Divider type='vertical' />

            <Space>
              <a
                className={classNames({
                  merchandise_a_disabled: !globalStore.hasPermission(
                    Permission.PERMISSION_PRODUCTION_UPDATE_COMBINE_SSU,
                  ),
                })}
                onClick={() => handleSaleStatus(false, !on_sale, original)}
              >
                {t(on_sale ? '停售' : '启售')}
              </a>

              <Divider type='vertical' />
            </Space>
            <a
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_DELETE_COMBINE_SSU,
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
    <div className='gm-site-card-border-less-wrapper-106 combine_table_list'>
      <TableList<Sku>
        id='merchandise_combie_list'
        keyField='sku_id'
        isDiy
        isSelect
        data={list}
        filter={filter}
        service={getCombineList}
        columns={columns}
        isUpdateEffect={false}
        selected={selected}
        onSelect={handleSelected}
        paginationOptions={{
          paginationKey: 'merchandise_combie_list',
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
                    Permission.PERMISSION_PRODUCTION_UPDATE_COMBINE_SSU
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
                  </Space>
                </PermissionJudge>
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_PRODUCTION_DELETE_COMBINE_SSU
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
    </div>
  )
})

export default ListV2
