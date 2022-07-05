import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { usePagination } from '@gm-common/hooks'

import Filter from './filter'
import List from './list'
import { purchaseColumns } from '../common/column'
import store from '../store'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

import {
  GetPurchaseFormsTaskDataByPurchaser,
  PurchaseFormsType,
} from 'gm_api/src/inventory'
import { BoxTableInfo, LoadingChunk } from '@gm-pc/react'
import TableTotalText from '@gm-pc/business/src/table_list/table_total_text'
import { t } from 'gm-i18n'

const CategroyByPurchaser = observer(() => {
  const {
    fetchList,
    clear,
    changeFilter,
    tableInfoStatistic,
    filter: { warehouse_id },
  } = store
  const [warehouseId, setWarehouseId] = useState(warehouse_id)
  const { pagination, run, loading } = usePagination<any>(
    fetchList(GetPurchaseFormsTaskDataByPurchaser),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  const column = purchaseColumns

  const handeChange = (value: string) => {
    setWarehouseId(value)
    changeFilter('warehouse_id', value)
  }

  useEffectOnce<string | undefined>(run, warehouse_id as string)
  useEffect(() => {
    // tab组件问题，导致return clear并不能及时清理数据，所以提前clear
    clear()
    execMutiWarehouseJudge(run)
  }, [])

  return (
    <LoadingChunk loading={loading}>
      <Filter
        onSearch={run}
        type={PurchaseFormsType.TYPE_PURCHASER}
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
              ]}
            />
          </BoxTableInfo>
        }
      />
    </LoadingChunk>
  )
})

export default CategroyByPurchaser
