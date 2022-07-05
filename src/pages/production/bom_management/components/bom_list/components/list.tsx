import { getSort } from '@/pages/iot/device_management/util'
import { DeletedProduct } from '@/pages/sales_invoicing/components'
import globalStore from '@/stores/global'
import { gmHistory as history } from '@gm-common/router'
import { Delete, Flex } from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { message, Tag } from 'antd'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import {
  BomType,
  ListBomRequest_PagingField,
  map_BomType,
} from 'gm_api/src/production'
import _ from 'lodash'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { FC } from 'react'
import { BomExpand } from '../interface'
import store from '../store'
import EllipsesText from './ellipsed_text'

/**
 * 列表搜索条件的属性
 */
interface Query {
  /** BOM的种类 */
  type?: BomType
  /** 搜索时执行的动作 */
  onSearch: () => Promise<any>
  /** 删除时执行的动作 */
  onSearchDelete: (list: any[], num: number) => Promise<any>
  /** 是否在关联BOM页 */
  isRelationBom?: boolean
}

/**
 * BOM信息列表的组件函数
 */
const BomInfoList: FC<Query> = ({
  type,
  onSearch,
  onSearchDelete,
  isRelationBom,
}) => {
  const { bomList } = store
  const isPack = type === BomType.BOM_TYPE_PACK

  /**
   * 处理删除按钮点击的事件
   * 确认并删除BOM
   * @return {Promise<void>} 包含删除动作的请求
   */
  const handleDeleteBom = (bomId: string) => {
    const TipName = isPack ? '包装' : '生产'
    Delete({
      title: t(`删除${TipName}BOM`),
      read: t(`我已阅读以上提示，确认删除${TipName}BOM`),
      children: (
        <div>
          {t(`删除${TipName}BOM后只影响未生成的计划，已生成的计划不受影响`)}
        </div>
      ),
    }).then(async () => {
      if (await store.deleteBom(bomId)) {
        message.success(t('删除成功'))
        onSearchDelete(bomList, 1)
      }
      return null
    })
  }

  /**
   * 定义列表的栏
   */
  const Columns: Column<BomExpand>[] = [
    {
      Header: t('BOM名称'),
      fixed: 'left',
      width: 200,
      id: 'bom_id',
      diyEnable: false,
      Cell: ({ original }) => {
        const {
          name,
          haveDeleteMaterial,
          sku_id,
          revision,
          bom_id,
          type,
          isDefault,
        } = original
        const isPack = type === BomType.BOM_TYPE_PACK
        const typeUrl = isPack ? 'pack' : 'produce'
        return (
          <Flex>
            <EllipsesText text={name}>
              {isDefault && (
                <span>
                  <Tag color='blue'>{t('默认')}</Tag>
                </span>
              )}
              {isRelationBom ? (
                name
              ) : (
                <a
                  href={`#/production/bom_management/${typeUrl}/detail?revision=${revision}&bom_id=${bom_id}&sku_id=${sku_id}&isPack=${isPack}`}
                >
                  {name}
                </a>
              )}
            </EllipsesText>
            {haveDeleteMaterial && (
              <DeletedProduct tip={t('该bom下有物料已被删除')} />
            )}
          </Flex>
        )
      },
    },
    {
      Header: t('BOM编码'),
      width: 175,
      id: 'customized_code',
      diyEnable: false,
      Cell: ({ original }) => <EllipsesText text={original.customized_code} />,
    },
    {
      Header: t('生产产线'),
      width: 175,
      id: 'production_line',
      Cell: ({ original }) => {
        return <div>{original.production_line || '-'}</div>
      },
    },
    {
      Header: t('商品名称'),
      width: 175,
      id: 'spu_id',
      Cell: ({ original }) => (
        <EllipsesText text={original.skuInfo?.sku?.name!}>
          <a
            href={`#/merchandise/manage/merchandise_list/detail?sku_id=${original.sku_id}`}
          >
            {original.skuInfo?.sku?.name!}
          </a>
        </EllipsesText>
      ),
    },
    {
      Header: t('商品分类'),
      width: 175,
      id: 'category',
      Cell: ({ original }) => (
        <EllipsesText
          text={_.map(
            original.skuInfo?.category_infos,
            (v) => v.category_name,
          ).join('/')}
        />
      ),
    },
    {
      Header: t('BOM包材'),
      id: 'packSku',
      width: 175,
      hide: !isPack,
      Cell: ({ original }) => (
        <EllipsesText
          text={_.map(original.packMaterials, (v) => v.name).join(',') || '-'}
        />
      ),
    },
    {
      Header: t('BOM类型'),
      width: 90,
      hide: isPack,
      id: 'type',
      Cell: ({ original }) => map_BomType[original.type],
    },
    {
      Header: t('工序'),
      width: 175,
      hide: isPack && isRelationBom,
      id: 'process',
      Cell: ({ original }) => (
        <EllipsesText text={original?.processTemplateName!} />
      ),
    },
    {
      Header: t('原料'),
      minWidth: 175,
      id: 'materials',
      Cell: ({ original }) => (
        <EllipsesText
          text={_.map(original.materials, (v) => v.name).join(',')}
        />
      ),
    },
    {
      Header: t('更新时间'),
      hide: isRelationBom,
      headerSort: true,
      id: ListBomRequest_PagingField.UPDATE_TIME,
      minWidth: 170,
      Cell: ({ original }) =>
        moment(new Date(+original.update_time!)).format('YYYY-MM-DD HH:mm'),
    },
    {
      Header: TableXUtil.OperationHeader,
      width: 150,
      fixed: 'right',
      hide: isRelationBom,
      diyItemText: t('操作'),
      accessor: 'operation',
      Cell: ({ original }) => {
        const { type, bom_id, sku_id, revision, isDefault } = original
        const typeUrl = type === BomType.BOM_TYPE_PACK ? 'pack' : 'produce'
        return (
          <Flex>
            <a
              onClick={() =>
                history.push(
                  `/production/bom_management/${typeUrl}/detail?revision=${revision}&bom_id=${bom_id}&sku_id=${sku_id}`,
                )
              }
              className='gm-margin-right-5'
            >
              {t('详情')}
            </a>
            {globalStore.hasPermission(
              type === BomType.BOM_TYPE_PACK
                ? Permission.PERMISSION_PRODUCTION_UPDATE_PACK_BOM
                : Permission.PERMISSION_PRODUCTION_UPDATE_BOM,
            ) && (
              <a
                onClick={() =>
                  history.push(
                    `/production/bom_management/${typeUrl}/create?type=${type}&bomId=${bom_id}`,
                  )
                }
                className='gm-margin-right-5'
              >
                {t('编辑')}
              </a>
            )}

            {!isDefault &&
              globalStore.hasPermission(
                type === BomType.BOM_TYPE_PACK
                  ? Permission.PERMISSION_PRODUCTION_DELETE_PACK_BOM
                  : Permission.PERMISSION_PRODUCTION_DELETE_BOM,
              ) && <a onClick={() => handleDeleteBom(bom_id)}>{t('删除')}</a>}
          </Flex>
        )
      },
    },
  ]

  return (
    <Table
      columns={Columns}
      data={bomList}
      isDiy={!isRelationBom}
      onHeadersSort={(des) => {
        store.updateFilter('sort_by', getSort(des))
        onSearch()
      }}
    />
  )
}

export default observer(BomInfoList)
