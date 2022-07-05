import { useGMLocation } from '@gm-common/router'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { Flex } from '@gm-pc/react'
import { TABLE_X } from '@gm-pc/table-x/src/utils'
import { t } from 'gm-i18n'
import { Batch, ListBatch } from 'gm_api/src/inventory'
import { toJS } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import store, { PDetail } from '../../stores/detail_store'

interface Props {
  data: PDetail
  index: number
}

const TransferBatchCell: FC<Props> = observer((props) => {
  const location = useGMLocation<{ sheet_id: string }>()
  const { sheet_id } = location.query
  const { index, data } = props
  const {
    sku_id,
    unit_id,
    batch_selected_single,
    shelf_id,
    exist_inventory_can_search,
  } = data
  const {
    receiptDetail: { warehouse_id },
  } = store
  const batch_id = batch_selected_single?.batch_id
  const batch_serial_no = batch_selected_single?.batch_serial_no
  const [transferBatchList, setList] = useState<Batch[]>([])

  const state = useLocalObservable(() => ({
    currentValue: {
      value: '',
      text: '',
    },
    setValue(selected: any) {
      this.currentValue = {
        value: selected?.batch_id ?? '',
        text: selected?.batch_serial_no ?? '',
      }
    },
  }))

  const handleBatch = (batches: any) => {
    return batches
      .map((item: any) => {
        return {
          ...item,
          value: item?.batch_id ?? '',
        }
      })
      .sort((a: any, b: any) => a.in_stock_time - b.in_stock_time)
  }

  useEffect(() => {
    async function fetchListBatch() {
      const res = await ListBatch({
        shelf_ids: [shelf_id as string],
        sku_id,
        // sku_unit_id: unit_id,
        remaining: 1,
        batch_level: 2,
        paging: { limit: 999 },
        with_additional: true,
        warehouse_id: warehouse_id || undefined,
      })
      const { batches } = res.response
      const sortBatches = handleBatch(batches)
      setList(sortBatches)
      state.setValue({
        batch_id: sortBatches[0]?.batch_id ?? '',
        batch_serial_no: sortBatches[0]?.batch_serial_no ?? '',
      })
      store.changeProductDetailsItem(index, {
        batch_selected_single: sortBatches[0] as Batch,
      })
    }
    if (
      sku_id &&
      // unit_id &&
      shelf_id &&
      (!sheet_id || exist_inventory_can_search)
    ) {
      fetchListBatch()
      // if (!isFirstMount) {
      //   setMount(true)
      // }
    }

    // 根据商品名和规格的变动自动请求批次接口ListBatch
  }, [
    exist_inventory_can_search,
    index,
    sheet_id,
    shelf_id,
    sku_id,
    state,
    unit_id,
  ])

  useEffect(() => {
    if (batch_id) {
      state.setValue({
        batch_id,
        batch_serial_no,
      })
    }

    // 清空商品清空数据
    if (!sku_id) {
      setList([])
      state.setValue({
        value: '',
        text: '',
      })
    }
  }, [batch_id, batch_serial_no, sku_id, state])

  const handleSelect = (selected: any) => {
    store.changeProductDetailsItem(index, {
      batch_selected_single: selected ?? {},
    })
    state.setValue(selected)
  }

  const renderProductItem = (item: any) => {
    return <div>{item.batch_serial_no}</div>
  }

  return !shelf_id ? (
    <div>-</div>
  ) : (
    <Flex row alignCenter>
      <KCMoreSelect
        style={{
          width: TABLE_X.WIDTH_SEARCH,
        }}
        data={transferBatchList.slice() as any}
        selected={state.currentValue}
        onSelect={handleSelect}
        placeholder={t('请输入商品名搜索')}
        renderListFilter={(data) => data}
        renderListItem={renderProductItem}
      />
    </Flex>
  )
})

export default TransferBatchCell
