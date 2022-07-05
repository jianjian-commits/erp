import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import { ProductSummaryItem } from './interface'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/lib/table/interface'
import useProductData, { Options } from './service/use_product_data'

/**
 * 按商品汇总 tab 页
 */
const ProductSummary: React.VFC<Options> = (props) => {
  const { data } = useProductData(props)
  const columns = useMemo<ColumnsType<ProductSummaryItem>>(() => {
    return [
      {
        title: t('商品编码'),
        dataIndex: 'customizeCode',
      },
      {
        title: t('商品名称'),
        dataIndex: 'skuName',
      },
      {
        title: t('商品分类'),
        dataIndex: 'category',
      },
      {
        title: t('下单单位'),
        dataIndex: 'orderUnit',
      },
      {
        title: t('定价单位'),
        dataIndex: 'feeUnit',
      },
      {
        title: t('下单数'),
        dataIndex: 'orderQuantity',
      },
      {
        title: t('出库数'),
        dataIndex: 'outstockQuantity',
      },
      {
        title: t('出库单位'),
        dataIndex: 'outstockUnit',
      },
      {
        title: t('商品单价（均值）'),
        dataIndex: 'skuPriceAverage',
      },
      {
        title: t('下单金额'),
        dataIndex: 'orderAmount',
      },
      {
        title: t('出库金额'),
        dataIndex: 'outstockAmount',
      },
    ]
  }, [])

  return (
    <Table<ProductSummaryItem>
      size='small'
      rowKey='skuId'
      dataSource={data}
      columns={columns}
      pagination={false}
    />
  )
}

export default ProductSummary
