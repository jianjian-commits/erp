import React, { FC, Key, useState } from 'react'
import { TableColumnType } from 'antd'
import {
  ListSkuV2,
  Sku_SkuType,
  Sku,
  ListBasicPriceV2Request_RequestData,
} from 'gm_api/src/merchandise'
import { BatchMerchandiseParams } from '../../interface'
import ProductImage from '@/common/components/product_image'
import { getCategoryNames, getUnitItem } from '@/pages/merchandise/util'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { t } from 'gm-i18n'
import SelectTable, { Pagination } from '@/common/components/select_table'
import baseStore from '../../../../store'
import store from '../store'
import _ from 'lodash'
import { observer } from 'mobx-react'

interface BatchModalProps {
  disabledList: string[]
}

const BatchModal: FC<BatchModalProps> = ({ disabledList }) => {
  const { category_map } = baseStore
  const { seSelectSkuList } = store

  const onSelect = (__: Key[], rowData: Sku[]) => {
    seSelectSkuList(rowData)
  }
  const columns: TableColumnType<Sku>[] = [
    {
      title: t('商品图片'),
      key: 'image',
      dataIndex: 'image',
      render: (__, record) => {
        const { repeated_field } = record
        const image = repeated_field?.images![0]
        return <ProductImage url={image?.path || ''} />
      },
    },
    {
      title: t('商品编码'),
      key: 'customize_code',
      dataIndex: 'customize_code',
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('商品名称'),
      key: 'name',
      dataIndex: 'name',
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('商品分类'),
      key: 'category_id',
      dataIndex: 'category_id',
      render: (text) => (
        <TableTextOverflow text={getCategoryNames(category_map, text)} />
      ),
    },
    {
      title: t('基本单位'),
      key: 'base_unit_id',
      dataIndex: 'base_unit_id',
      width: 150,
      render: (text) => getUnitItem(text)?.name || '-',
    },
  ]
  const fetchList = (
    paging: Pagination,
    values: BatchMerchandiseParams | undefined,
  ) => {
    const req = {
      filter_params: {
        ...values,
        sku_type: Sku_SkuType.NOT_PACKAGE,
        category_id:
          values &&
          values.category_id &&
          values.category_id[values.category_id.length - 1],
      },
      request_data: ListBasicPriceV2Request_RequestData.SKU,
      paging,
      sort_by: { field: 6, desc: true },
    }
    return ListSkuV2(req).then((json) => {
      const { paging, skus = [] } = json.response
      return {
        list: skus,
        count: paging.count,
      }
    })
  }
  return (
    <>
      <SelectTable<Sku, BatchMerchandiseParams>
        filter={[
          {
            name: 'category_id',
            type: 'categoryCascader',
            allowClear: true,
          },
          {
            name: 'q',
            placeholder: t('请输入商品名称/编码'),
            type: 'input',
          },
        ]}
        selectedKey='name'
        onSelect={onSelect}
        // defaultSelectedRowKeys={merchandiseKey.slice() || []}
        // defaultSelectedRows={merchandiseList.slice() || []}
        rowKey='sku_id'
        // 限制
        disabledList={disabledList}
        limitCount={100}
        onSearch={fetchList}
        columns={columns}
      />
    </>
  )
}
export default observer(BatchModal)
