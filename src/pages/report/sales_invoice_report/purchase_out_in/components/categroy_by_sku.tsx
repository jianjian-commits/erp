import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Column } from '@gm-pc/table-x'
import {
  BoxTableInfo,
  Flex,
  LoadingChunk,
  RightSideModal,
  Tip,
} from '@gm-pc/react'
import { usePagination } from '@gm-common/hooks'

import Filter from './filter'
import List from './list'
import DetailModal from './detail_modal'
import { CommonColumn } from '../common/column'
import store, { CommonListType } from '../store'
import TableTotalText from '@/common/components/table_total_text'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

import {
  GetPurchaseFormsTaskDataByMerchandise,
  PurchaseFormsType,
} from 'gm_api/src/inventory'

const CategroyBySku = observer(() => {
  const {
    fetchList,
    clear,
    changeFilter,
    getPriceData,
    tableInfoStatistic,
    filter: { warehouse_id },
  } = store
  const [warehouseId, setWarehouseId] = useState(warehouse_id)
  const { pagination, run, loading } = usePagination<any>(
    fetchList(GetPurchaseFormsTaskDataByMerchandise),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useEffectOnce<string | undefined>(run, warehouse_id as string)

  useEffect(() => {
    // tab组件问题，导致return clear并不能及时清理数据，所以提前clear
    clear()
    execMutiWarehouseJudge(run)
    // return clear
  }, [])

  const handeChange = (value: string) => {
    setWarehouseId(value)
    changeFilter('warehouse_id', value)
  }

  const openModal = async (data: CommonListType) => {
    const { sku_id, warehouse_id } = data
    try {
      await getPriceData({
        sku_id,
        warehouse_id,
      })
      RightSideModal.render({
        onHide: RightSideModal.hide,
        children: <DetailModal data={data} />,
        style: {
          width: '600px',
        },
      })
    } catch (err) {
      Tip.danger('系统繁忙，稍后再试～')
      console.log('err', err)
    }
  }

  const column: Column<any>[] = [
    ...CommonColumn,
    {
      Header: t('入库价格走势'),
      accessor: 'detail_trend',
      minWidth: 100,
      Cell: (cellProps) => {
        return (
          <Flex column>
            <a
              onClick={() => openModal(cellProps.original)}
              className='gm-cursor'
            >
              {t('查看详情')}
            </a>
          </Flex>
        )
      },
    },
  ]

  return (
    <LoadingChunk loading={loading}>
      <Filter
        onSearch={run}
        type={PurchaseFormsType.TYPE_MERCHANDISE}
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

export default CategroyBySku
