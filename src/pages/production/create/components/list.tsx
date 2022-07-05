import React, { FC, useRef } from 'react'
import { t } from 'gm-i18n'

import { observer, Observer } from 'mobx-react'

import store from '../store'
import CellSkuSelector from './cell_sku_selector'
import CellOrderAmount from './cell_order_amount'
import CellUnitSelector from './cell_unit_selector'
import { ProductDetailInfo, ProductPlanType } from '../interface'
import EllipsesText from '@/pages/production/bom_management/components/bom_list/components/ellipsed_text'
import { toJS } from 'mobx'
import { Button, Space, Table } from 'antd'
import { CopyOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/lib/table'
import BatchImportModal from './batch_import_modal'
import _ from 'lodash'

const List: FC<ProductPlanType> = () => {
  const batchImportRef = useRef<{ setVisible: (v: boolean) => void }>()
  const { taskInfo } = store
  const { product_details } = taskInfo
  const handleAddItem = () => {
    store.addProductItem()
  }

  const handleImport = () => {
    batchImportRef?.current!.setVisible(true)
  }

  const handleAddSKu = async (data: any) => {
    store.batchImportProductItem(data.selectedRows)
    await store.getListBomSku()
    batchImportRef?.current!.setVisible(false)
  }

  const Footer = () => (
    <Space size='middle'>
      <span className='footer-color' onClick={handleAddItem}>
        <PlusCircleOutlined className='tw-mr-1' />
        {t('添加一行')}
      </span>
      <span style={{ color: '#777777' }}>|</span>
      <span className='footer-color' onClick={handleImport}>
        <CopyOutlined className='tw-mr-1' />
        {t('批量添加商品')}
      </span>
    </Space>
  )

  const columns: ColumnsType<ProductDetailInfo> = [
    {
      title: t('商品名称'),
      width: 300,
      render: (__, ___, index) => <CellSkuSelector index={index} />,
    },
    {
      title: t('商品编码'),
      width: 200,
      render: (_, __, index) => (
        <Observer>
          {() => <div>{product_details?.[index].customized_code || '-'}</div>}
        </Observer>
      ),
    },
    {
      title: t('分类'),
      width: 240,
      render: (_, __, index) => (
        <Observer>
          {() => <div>{product_details?.[index].category_name || '-'}</div>}
        </Observer>
      ),
    },
    {
      title: t('数量'),
      width: 200,
      render: (__, ___, index) => {
        return <CellOrderAmount index={index} />
      },
    },
    {
      title: t('商品BOM'),
      render: (__, ___, index) => {
        return (
          <Observer>
            {() => {
              const { bomInfo } = product_details?.[index]!
              return bomInfo ? (
                <EllipsesText text={bomInfo.name}>
                  <a
                    href={`#/production/bom_management/${'produce'}/detail?revision=${
                      bomInfo.revision
                    }&bom_id=${bomInfo.bom_id}&sku_id=${bomInfo.sku_id}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {bomInfo.name}
                  </a>
                </EllipsesText>
              ) : (
                <span>-</span>
              )
            }}
          </Observer>
        )
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      align: 'center',
      render: (_, __, index) => {
        return (
          <Button
            type='link'
            style={{ border: 'none', background: '#FFF' }}
            disabled={product_details!.length === 1}
            onClick={() => store.deleteProductItem(index)}
          >
            {t('删除')}
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <Table
        dataSource={toJS(product_details)}
        columns={columns}
        pagination={false}
        footer={Footer}
        className='gm-margin-15'
      />
      <BatchImportModal
        defaultSelectedRowKeys={_.map(product_details, (v) => v.sku_id)}
        onOk={handleAddSKu}
        ref={batchImportRef}
      />
    </>
  )
}

export default observer(List)
