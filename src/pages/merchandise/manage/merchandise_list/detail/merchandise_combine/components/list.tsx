import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { TableList, TableListColumn } from '@gm-pc/business'
import productDefaultImg from '@/img/product-default-gm.png'

import {
  BulkUpdateSkuV2,
  BulkUpdateSkuV2Request,
  Sku,
  Sku_SkuType,
  UpdateSkuV2,
} from 'gm_api/src/merchandise'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { Button, Space, Tag, Modal, message, Card } from 'antd'
import store from '../store'
import BatchActionBarComponent from '@/common/components/batch_action_bar'
import _ from 'lodash'
import globalStore from '@/stores/global'
import { EditSkuSaleTip } from '@/pages/merchandise/components/common'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { gmHistory as history } from '@gm-common/router'
import HintComponent from '@/pages/merchandise/components/hint'
import classNames from 'classnames'
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
    ingredientMap,
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

  const handleColse = () => {
    setSelected([])
    setIsAllSelected(false)
  }

  /** 组合商品详情 */
  const toCombineDetail = (id: string) => {
    history.push(`/merchandise/manage/combine/detail?sku_id=${id}`)
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
   * @description 批量/启售/停售
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

  const columns: TableListColumn<Sku>[] = [
    {
      Header: t('商品图片'),
      id: 'image',
      minWidth: 120,
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
              // width: '100%',
              height: '40px',
            }}
          />
        )
      },
    },
    {
      Header: t('组合商品名称'),
      id: 'name',
      minWidth: 200,
      Cell: (cellProps) => {
        const { name, sku_id, ingredients } = cellProps.original

        let isAllOnSale = true

        if (ingredients?.ingredients && ingredients.ingredients.length) {
          _.forEach(ingredients.ingredients, (ingredientItem) => {
            isAllOnSale = isAllOnSale && !!ingredientItem.on_sale
          })
        }

        return (
          <span>
            <a onClick={() => toCombineDetail(sku_id)}>
              <TableTextOverflow text={name} />
            </a>
            {!isAllOnSale && (
              <HintComponent type='1' content={t('1、存在停售的子商品')} />
            )}
          </span>
        )
      },
    },
    {
      Header: t('组成商品'),
      id: 'customize_code',
      accessor: 'customize_code',
      minWidth: 200,
      Cell: (cellProps) => {
        const {
          original: { ingredients },
        } = cellProps
        const skus: string[] = []
        if (ingredients?.ingredients) {
          _.forEach(ingredients?.ingredients, (ingredientItem) => {
            const { sku_id } = ingredientItem
            if (sku_id && ingredientMap[sku_id]) {
              skus.push(ingredientMap[sku_id].name)
            }
          })
        }

        return <TableTextOverflow text={skus.join('、')} />
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
            style={{ color: '#626262' }}
            className='tw-w-9 tw-text-center'
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
      minWidth: 100,
      Cell: (cellProps) => {
        const { original } = cellProps
        const { on_sale } = original
        return (
          <Space size='middle'>
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
          </Space>
        )
      },
    },
  ]

  return (
    <Card
      className='gm-site-card-border-less-wrapper-165'
      bodyStyle={{ padding: '0 24px' }}
    >
      <TableList<Sku>
        id='merchandise_combie_list'
        keyField='sku_id'
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
              <PermissionJudge
                permission={Permission.PERMISSION_PRODUCTION_UPDATE_COMBINE_SSU}
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
            }
          />
        }
      />
    </Card>
  )
})

export default ListV2
