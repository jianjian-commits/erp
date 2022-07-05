import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { usePagination } from '@gm-common/hooks'

import Filter from './filter'
import List from './list'
import { CommonColumn } from '../common/column'
import store from '../store'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

import {
  GetPurchaseFormsTaskDataBySupplier,
  PurchaseFormsType,
} from 'gm_api/src/inventory'
import type { Supplier } from 'gm_api/src/enterprise'
import { BoxTableInfo, LoadingChunk } from '@gm-pc/react'
import { getUnNillText } from '@/common/util'
import TableTotalText from '@gm-pc/business/src/table_list/table_total_text'

const CategroyBySupplier = observer(() => {
  const {
    fetchList,
    clear,
    getAdditionInfo,
    tableInfoStatistic,
    changeFilter,
    filter: { warehouse_id },
  } = store
  const [warehouseId, setWarehouseId] = useState(warehouse_id)
  const { pagination, run, loading } = usePagination<any>(
    fetchList(GetPurchaseFormsTaskDataBySupplier),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  const column: Column<any>[] = [
    {
      Header: t('供应商名称'),
      minWidth: 100,
      Cell: (cellProps) => {
        const { supplier_id } = cellProps.original
        const supplier = getAdditionInfo<Supplier>('suppliers', supplier_id!)
        return getUnNillText(supplier?.name)
      },
    },
    ...CommonColumn,
  ]

  const handeChange = (value: string) => {
    setWarehouseId(value)
    changeFilter('warehouse_id', value)
  }

  useEffectOnce<string | undefined>(run, warehouse_id as string)

  useEffect(() => {
    // tab组件问题，导致return clear并不能及时清理数据，所以提前clear
    clear()
    execMutiWarehouseJudge(run)
    // return clear
  }, [])

  return (
    <LoadingChunk loading={loading}>
      <Filter
        onSearch={run}
        type={PurchaseFormsType.TYPE_SUPPLIER}
        warehouseId={warehouseId}
        onChangeWarehouse={handeChange}
      />
      <List
        run={run}
        loading={loading}
        pagination={pagination}
        columns={column}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: <>{t(' 采购入库商品数量')}</>,
                  content:
                    tableInfoStatistic?.all_purchase_in_stock?.quantity || 0,
                },
                {
                  label: <>{t(' 采购入库金额')}</>,
                  content:
                    tableInfoStatistic?.all_purchase_in_stock?.amount || 0,
                },
                {
                  label: <>{t(' 采购退货出库商品数量')}</>,
                  content:
                    tableInfoStatistic?.all_refund_out_stock?.quantity || 0,
                },
                {
                  label: <>{t(' 采购退货出库金额')}</>,
                  content:
                    tableInfoStatistic?.all_refund_out_stock?.amount || 0,
                },
              ]}
            />
          </BoxTableInfo>
        }
      />
    </LoadingChunk>
  )
})

export default CategroyBySupplier
