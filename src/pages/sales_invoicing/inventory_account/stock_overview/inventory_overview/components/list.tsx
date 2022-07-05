import React, { useCallback, useEffect, useMemo } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Column, BatchActionEdit, Table, TableXColumn } from '@gm-pc/table-x'
import {
  BoxTable,
  BoxTableInfo,
  Flex,
  Modal,
  Tip,
  BoxTableProps,
} from '@gm-pc/react'

import TableTotalText from '@/common/components/table_total_text'

import { SKU_TYPE_NAME } from '@/pages/sales_invoicing/enum'
import store from '../stores/store'
import globalStore from '@/stores/global'
import { getHeathlyTag } from '@/pages/sales_invoicing/inventory_account/stock_overview/inventory_overview/put_in_storage/list'
import {
  UpdateStockWarning,
  UpdateStockWarningRequest,
  ListSkuStockRequest_PagingField,
} from 'gm_api/src/inventory'

import BatchImportStockSafeModal from '@/pages/sales_invoicing/inventory_account/stock_overview/inventory_overview/components/BatchImportStockSafeModal'
import { useMap } from 'react-use'
import { getSort } from '@/pages/iot/device_management/util'
import { SpDetails, getBaseColumn } from './columns'
import { getUnNillText } from '@/common/util'
import { TableColumns, SkuStockExpand } from '@/pages/sales_invoicing/interface'

const omissionMark = '-'
export interface TableData {
  isInit?: boolean
  isEditing?: boolean
  max_warning?: boolean
  min_warning?: boolean
  max_quantity?: null | number
  min_quantity?: null | number
}

const List: React.FC<
  {
    run: Function
    loading: boolean
    paging: { count?: number }
  } & Pick<BoxTableProps, 'pagination'>
> = observer((props) => {
  const { run, loading, pagination } = props
  const { list } = store
  const isMulti_Houseware_Switch = globalStore.isOpenMultWarehouse
  const data = [
    {
      label: t('商品数'),
      content: pagination?.paging?.count,
    },
  ]

  const [table, { set: set_ }] = useMap<{ [k in string]: TableData }>()

  const getRow = useCallback((id: string) => table[id], [table])

  const set = useCallback(
    (id: string, payload: TableData) => {
      const row = getRow(id)
      set_(id, {
        ...row,
        ...payload,
      })
    },
    [getRow, set_],
  )

  const toggle = (id: string) => {
    const row = getRow(id)
    Object.entries(table)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, v]) => {
        return v.isEditing
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .forEach(([k, _]) => {
        set(k, {
          isEditing: false,
        })
      })

    set(id, {
      isEditing: !row?.isEditing,
    })
  }

  const cancel = (id: string) => {
    const row = getRow(id)
    set(id, {
      isEditing: !row?.isEditing,
      max_warning: void 0,
      min_warning: void 0,
      max_quantity: void 0,
      min_quantity: void 0,
    })
  }

  const save = (sku_id: string) => {
    const { max_quantity, max_warning, min_quantity, min_warning } =
      getRow(sku_id) ?? {}

    if (min_warning && max_warning) {
      if (
        !min_quantity ||
        !max_quantity ||
        (max_quantity as unknown as string) === '' ||
        (min_quantity as unknown as string) === ''
      ) {
        Tip.danger(t('安全库存上限或下限设置为空， 请重新设置'))
        return false
      }

      if (+min_quantity >= +max_quantity) {
        Tip.danger(t('安全库存下限大于或等于安全库存上限， 请重新设置'))
        return false
      }
    }

    const body: UpdateStockWarningRequest = {
      sku_id,
      stock_remain_warning: {
        max_quantity: max_warning ? String(max_quantity) : '0.01',
        max_warning,
        min_quantity: min_warning ? String(min_quantity) : '0.01',
        min_warning,
      },
    }
    UpdateStockWarning(body).then(() => {
      set(sku_id, {
        isInit: false,
        ...(max_warning ? {} : { max_quantity: 0.01 }),
        ...(min_warning ? {} : { min_quantity: 0.01 }),
      })
      toggle(sku_id)

      Tip.success(t('保存成功'))
      // eslint-disable-next-line promise/no-nesting
      run()
    })

    return true
  }

  const hasEditing = useMemo(() => {
    return (
      Object.entries(table)
        .map(([_, v]) => v.isEditing)
        .filter(Boolean).length > 0
    )
  }, [table])

  useEffect(() => {
    list.forEach((it) => {
      const { stock_remain_warning, sku_id } = it
      const { max_warning, min_warning, max_quantity, min_quantity } =
        stock_remain_warning ?? {}

      set(sku_id, {
        isInit: true,
        isEditing: false,
        max_warning: !!max_warning,
        min_warning: !!min_warning,
        max_quantity:
          max_quantity === '0' || !max_quantity ? 0.01 : +max_quantity,
        min_quantity:
          min_quantity === '0' || !min_quantity ? 0.01 : +min_quantity,
      })
    })
  }, [list])

  const ls = {
    hasEditing,
    table,
    toggle,
    save,
    cancel,
    set,
  }

  const handleHide = (refresh: boolean) => {
    Modal.hide()
    if (refresh) {
      run()
    }
  }

  /** 1入按钮时触发
   * 弹出导入文件窗口
   */
  const handleImport = (selected: string[], isSelectedAll: boolean) => {
    Modal.render({
      title: t('批量导入安全库存'),
      children: (
        <BatchImportStockSafeModal
          onHide={handleHide}
          selected={selected}
          isSelectedAll={isSelectedAll}
        />
      ),
      onHide: Modal.hide,
      style: {
        width: '600px',
      },
    })
  }

  const columnSkuDetail: Column<SkuStockExpand>[] = [
    {
      Header: t('自定义编码'),
      Cell: (cellProps) => {
        if (!cellProps.original?.skuInfo?.sku) return omissionMark
        const {
          skuInfo: {
            sku: { customize_code },
          },
        } = cellProps.original
        return customize_code
      },
    },

    {
      Header: t('商品名称'),
      Cell: (cellProps) => {
        if (!cellProps.original?.skuInfo?.sku) return omissionMark
        const {
          skuInfo: {
            sku: { name, sku_id },
          },
          expire_type,
        } = cellProps.original
        return (
          <Flex>
            <div>
              <a
                className='gm-text-primary gm-cursor'
                href={`#/sales_invoicing/inventory_account/stock_overview/inventory_overview/put_in_storage?sku_id=${sku_id}`}
              >
                {name}
              </a>
            </div>
            {getHeathlyTag(expire_type ?? 0)}
          </Flex>
        )
      },
    },
    {
      Header: t('是否包材'),
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        if (!cellProps.original?.skuInfo?.sku) return omissionMark
        const {
          skuInfo: {
            sku: { sku_type },
          },
        } = cellProps.original
        return SKU_TYPE_NAME[sku_type]
      },
    },
    {
      Header: t('商品分类'),
      id: ListSkuStockRequest_PagingField.SKU_CATEGORY,
      Cell: (cellProps) => {
        if (!cellProps.original?.skuInfo?.category_infos) return omissionMark
        const {
          skuInfo: { category_infos },
        } = cellProps.original

        return category_infos
          ?.map((it) => it.category_name)
          .filter(Boolean)
          .join('/')
      },
    },
    {
      Header: t('基本单位'),
      Cell: (cellProps: TableColumns<SkuStockExpand>) => {
        const { base_unit_name } = cellProps.original
        return getUnNillText(base_unit_name)
      },
    },
  ]

  const columns = isMulti_Houseware_Switch
    ? columnSkuDetail.concat(SpDetails)
    : columnSkuDetail.concat(
        getBaseColumn(ls, getRow) as TableXColumn<SkuStockExpand>,
      )

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText data={data} />
        </BoxTableInfo>
      }
    >
      <Table
        isBatchSelect={!globalStore.isLite}
        isDiy
        id='inventory_overview'
        keyField='sku_id'
        fixedSelect
        data={list.slice()}
        onHeadersSort={(des) => {
          store.handleChangeFilter('sort', getSort(des))
          run()
        }}
        columns={columns}
        loading={loading}
        batchActions={[
          {
            children: (
              <BatchActionEdit>{t('批量设置安全库存')}</BatchActionEdit>
            ),
            onAction(selected: string[], isSelectedAll: boolean) {
              handleImport(selected, isSelectedAll)
            },
          },
        ]}
      />
    </BoxTable>
  )
})

export default List
