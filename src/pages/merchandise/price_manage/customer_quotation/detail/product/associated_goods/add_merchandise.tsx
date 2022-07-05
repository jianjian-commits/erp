import React, { useState, Key } from 'react'
import { Button } from 'antd'
import SelectTable, { Pagination } from '@/common/components/select_table'
import {
  ListSkuForBindingQuotation,
  ListBasicPriceV2Request_RequestData,
  Sku,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import { t } from 'gm-i18n'
import store from './store'
import baseStore from '../../store'
import { getUnitItem, getCategoryNames } from '@/pages/merchandise/util'
import { ColumnType } from 'antd/lib/table'
import ProductImage from '@/common/components/product_image'
import TableTextOverflow from '@/common/components/table_text_overflow'
import productStore from '../store'

type Params = {
  category_id: string[]
  q: string
}
interface AddMerchandiseProps {
  next: () => void
  handleClose: () => void
}
/** 商品List */
const AddMerchandise = (props: AddMerchandiseProps) => {
  const { next, handleClose } = props
  const [selectedRows, setSelectedRows] = useState<Sku[]>(store.selectedRows)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(
    store.selectedRowKeys,
  )

  const [disabledList, setDisabledList] = useState<string[]>([])

  const columns: ColumnType<Sku>[] = [
    {
      title: t('商品图片'),
      key: 'image',
      dataIndex: 'image',
      render: (_, record) => {
        const { repeated_field } = record
        const image = repeated_field?.images![0]
        return <ProductImage url={image?.path || ''} />
      },
    },
    {
      title: t('商品名称'),
      key: 'name',
      dataIndex: 'name',
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('商品编码'),
      key: 'customize_code',
      dataIndex: 'customize_code',
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('商品分类'),
      key: 'category_id',
      dataIndex: 'category_id',
      render: (text) => (
        <TableTextOverflow
          text={getCategoryNames(productStore.treeDataMap, text)}
        />
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

  const handleNext = () => {
    store.setSelectedInfo(selectedRowKeys, selectedRows)
    if (typeof next === 'function') next()
  }

  const handleCancel = () => {
    if (typeof handleClose === 'function') handleClose()
    setSelectedRowKeys([])
    setSelectedRows([])
  }

  const onSelect = (selectedRowKeys: Key[], rowData: Sku[]) => {
    setSelectedRowKeys(selectedRowKeys)
    setSelectedRows(rowData)
  }

  const fetchList = (paging: Pagination, values: Params | undefined) => {
    const req = {
      filter_params: {
        ...values,
        quotation_id: baseStore.quotation_id,
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
    return ListSkuForBindingQuotation(req).then((json) => {
      const { bound_sku_ids = [], paging, skus = [] } = json.response
      setDisabledList(bound_sku_ids)
      return {
        list: skus,
        count: paging.count,
      }
    })
  }

  return (
    <>
      <SelectTable<Sku, Params>
        filter={[
          {
            name: 'category_id',
            type: 'categoryCascader',
          },
          {
            name: 'q',
            placeholder: t('请输入商品名称/别名/编码'),
            type: 'input',
          },
        ]}
        selectedKey='name'
        onSelect={onSelect}
        disabledList={disabledList}
        defaultSelectedRowKeys={store.selectedRowKeys}
        defaultSelectedRows={store.selectedRows}
        rowKey='sku_id'
        limitCount={50}
        onSearch={fetchList}
        columns={columns}
      />
      <div className='gm-modal-footer'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button
          type='primary'
          onClick={handleNext}
          disabled={selectedRowKeys.length === 0}
        >
          {t('下一步')}
        </Button>
      </div>
    </>
  )
}

export default AddMerchandise
