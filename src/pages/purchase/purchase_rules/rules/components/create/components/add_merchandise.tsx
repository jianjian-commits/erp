import React, { FC, Key, useEffect, useRef, useMemo } from 'react'

import SelectTable, { Pagination } from '@/common/components/select_table'
import ProductImage from '@/common/components/product_image'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { ColumnType } from 'antd/lib/table'
import { getUnitItem, getCategoryNames } from '@/pages/merchandise/util'
import {
  ListBasicPriceV2Request_RequestData,
  Sku,
  Sku_SkuType,
  ListSkuV2,
} from 'gm_api/src/merchandise'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import createStore from '../store'
type Params = {
  category_id: string[]
  q: string
}
interface AddMerchandiseProps {
  rowType: string
}
const AddMerchandise: FC<AddMerchandiseProps> = ({ rowType }) => {
  // @ts-ignore
  const selectTableRef = useRef<SelectTableRef>(null)
  const {
    setSelectedRowKeys,
    setSelectedRow,
    merchandise_selectedRowKeys,
    merchandise_selectedRow,
    getTreeData,
    treeDataMap,
  } = createStore
  useEffect(() => {
    getTreeData()
  }, [])

  const onSelect = (selectedRowKeys: Key[], rowData: Sku[]) => {
    setSelectedRowKeys(selectedRowKeys, 'merchandise')
    setSelectedRow(rowData, 'merchandise')
  }
  const columns: ColumnType<Sku>[] = [
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
        <TableTextOverflow text={getCategoryNames(treeDataMap, text)} />
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
  const fetchList = (paging: Pagination, values: Params | undefined) => {
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
      //   setDisabledList()
      return {
        list: skus,
        count: paging.count,
      }
    })
  }

  const defaultSelectedRowKeys = useMemo(() => {
    return merchandise_selectedRowKeys.slice()
  }, [merchandise_selectedRowKeys.length])

  const defaultSelectedRows = useMemo(() => {
    return merchandise_selectedRow.slice()
  }, [merchandise_selectedRow.length])

  return (
    <>
      <SelectTable<Sku, Params>
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
        tableRef={selectTableRef}
        defaultSelectedRowKeys={defaultSelectedRowKeys || []}
        defaultSelectedRows={defaultSelectedRows || []}
        rowKey='sku_id'
        type={rowType}
        limitCount={100}
        onSearch={fetchList}
        columns={columns}
      />
    </>
  )
}
export default observer(AddMerchandise)
