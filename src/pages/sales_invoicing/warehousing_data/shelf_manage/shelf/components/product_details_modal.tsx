import React from 'react'
import { usePagination } from '@gm-common/hooks'
import store from '../store'
import { useEffectOnce } from 'react-use'
import List from './list'
import { PagingReq } from '@gm-common/hooks/src/types'
import { SkuForShow } from '@/pages/sales_invoicing/warehousing_data/shelf_manage/interface'

interface Params {
  paging?: PagingReq
}

const ProductDetailsModal: React.FC<SkuForShow> = (props) => {
  // FIXME: usePagination 类型定义有问题
  const { pagination, run } = usePagination<Params & { sku_id: string }>(
    store.getAllBatchBySkuId as any,
    {
      paginationKey: 'ProductDetailsModal',
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffectOnce(() => {
    run({ sku_id: props.sku_id })
  })

  return (
    <>
      <List {...props} pagination={pagination} />
    </>
  )
}

export default ProductDetailsModal
