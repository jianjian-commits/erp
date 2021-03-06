import React, { useCallback, useEffect, useMemo } from 'react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Observer, observer } from 'mobx-react'
import {
  TableX,
  subTableXHOC,
  TableXUtil,
  Column,
  TableXColumn,
  BatchActionEdit,
  expandTableXHOC,
  fixedColumnsTableXHOC,
  batchActionSelectTableXHOC,
  diyTableXHOC,
} from '@gm-pc/table-x'
import {
  BoxTable,
  BoxTableInfo,
  Flex,
  InputNumber,
  Modal,
  Price,
  Select,
  Tip,
} from '@gm-pc/react'

import TableTotalText from '@/common/components/table_total_text'
import { getEndlessPrice, toFixedSalesInvoicing } from '@/common/util'

import { SKU_TYPE_NAME } from '@/pages/sales_invoicing/enum'
import { changeLogNum, showUnitText } from '@/pages/sales_invoicing/util'
import store from '../store'
import { getHeathlyTag } from '@/pages/sales_invoicing/inventory_account/stock_overview/inventory_overview/put_in_storage/list'
import { SkuStockExpand } from '@/pages/sales_invoicing/interface'
import {
  SkuUnitStock,
  UpdateStockWarning,
  UpdateStockWarningRequest,
  ListSkuStockRequest_PagingField,
} from 'gm_api/src/inventory'
import { SsuInfo } from 'gm_api/src/merchandise'
import {
  OperationCellRowEdit,
  OperationHeader,
} from '@gm-pc/table-x/src/components/operation'
import BatchImportStockSafeModal from '@/pages/sales_invoicing/inventory_account/stock_overview/inventory_overview/components/BatchImportStockSafeModal'
import { useMap } from 'react-use'
import { getSort } from '@/pages/iot/device_management/util'

const SelectTable = expandTableXHOC(
  fixedColumnsTableXHOC(batchActionSelectTableXHOC(diyTableXHOC(TableX))),
)

const SubTable = subTableXHOC(TableX)

const omissionMark = '-'

export interface TableData {
  isInit?: boolean
  isEditing?: boolean
  max_warning?: boolean
  min_warning?: boolean
  max_quantity?: null | number
  min_quantity?: null | number
}

const List: React.FC<{
  run: Function
  loading: boolean
  paging: { count?: number }
}> = observer((props) => {
  const { run, loading, paging } = props
  const { list } = store
  const data = [
    {
      label: t('????????????'),
      content: paging?.count,
    },
    {
      label: t('???????????????'),
      content: 0 + '???',
    },
    {
      label: t('???????????????'),
      content: 0 + '???',
    },
    {
      label: t('??????????????????'),
      content: 0 + '???',
    },
    {
      label: t('??????????????????'),
      content: 0 + '???',
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
        Tip.danger(t('?????????????????????????????????????????? ???????????????'))
        return false
      }

      if (+min_quantity >= +max_quantity) {
        Tip.danger(t('?????????????????????????????????????????????????????? ???????????????'))
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

      Tip.success(t('????????????'))
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

  /**
   * ????????????????????????????????????????????????
   * ???????????????????????????????????????
   * @param {boolean} refresh ?????????????????????true???????????????????????????
   */
  const handleHide = (refresh: boolean) => {
    Modal.hide()
    if (refresh) {
      run()
    }
  }

  /** 1??????????????????
   * ????????????????????????
   */
  const handleImport = (selected: string[], isSelectedAll: boolean) => {
    Modal.render({
      title: t('????????????????????????'),
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

  const columnSkuDetail: Array<TableXColumn<SkuStockExpand>> = [
    {
      Header: t('???????????????'),
      Cell: (cellProps: { row: { original: any } }) => {
        if (!cellProps.row.original?.skuInfo?.sku) return omissionMark
        const {
          skuInfo: {
            sku: { customize_code },
          },
        } = cellProps.row.original
        return customize_code
      },
    },

    {
      Header: t('????????????'),
      Cell: (cellProps) => {
        if (!cellProps.row.original?.skuInfo?.sku) return omissionMark
        const {
          skuInfo: {
            sku: { name, sku_id },
          },
          expire_type,
        } = cellProps.row.original
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
      Header: t('????????????'),
      Cell: (cellProps: { row: { original: any } }) => {
        if (!cellProps.row.original?.skuInfo?.sku) return omissionMark
        const {
          skuInfo: {
            sku: { sku_type },
          },
        } = cellProps.row.original
        return SKU_TYPE_NAME[sku_type]
      },
    },
    {
      Header: t('????????????'),
      id: ListSkuStockRequest_PagingField.SKU_CATEGORY,
      headerSort: true,
      Cell: (cellProps) => {
        if (!cellProps.row.original?.skuInfo?.category_infos)
          return omissionMark
        const {
          skuInfo: { category_infos },
        } = cellProps.row.original

        return category_infos?.map((it) => it.category_name).join('/')
      },
    },
    {
      Header: t('????????????'),
      minWidth: ls.hasEditing ? 1.5 : 1,
      Cell: (cellProps) => {
        if (!cellProps.row.original.stock_remain_warning) return omissionMark
        const { stock_remain_warning, base_unit_name, stock, sku_id, skuInfo } =
          cellProps.row.original

        const { max_warning, min_warning, max_quantity, min_quantity } =
          stock_remain_warning
        const row = getRow(sku_id)
        return (
          <Observer>
            {() => {
              const quantity = toFixedSalesInvoicing(
                Big(stock?.base_unit?.quantity ?? '0'),
              )

              const isOutMax = +quantity > +(max_quantity ?? 0)
              const isOutMin = +quantity < +(min_quantity ?? 0)

              if (!row?.isEditing) {
                return (
                  <>
                    <div
                      style={{
                        backgroundColor: min_warning && isOutMin ? 'red' : '',
                        marginBottom: '5px',
                      }}
                    >
                      {min_warning
                        ? `?????????${min_quantity}${base_unit_name}`
                        : t('??????????????????')}
                    </div>
                    <div
                      style={{
                        marginBottom: '1px',
                        backgroundColor: max_warning && isOutMax ? 'red' : '',
                      }}
                    >
                      {max_warning
                        ? `?????????${max_quantity}${base_unit_name}`
                        : t('??????????????????')}
                    </div>
                  </>
                )
              }

              return (
                <div>
                  <Flex
                    alignCenter
                    style={{
                      marginBottom: '5px',
                    }}
                  >
                    <div
                      style={{
                        marginRight: '3px',
                      }}
                    >
                      <span
                        style={{
                          paddingRight: '2px',
                        }}
                      >
                        {t('??????: ')}
                      </span>
                      <Select
                        value={row?.min_warning ? 1 : 0}
                        data={[
                          {
                            value: 0,
                            text: '?????????',
                          },
                          {
                            value: 1,
                            text: '??????',
                          },
                        ]}
                        onChange={(v) => {
                          ls.set(sku_id, {
                            min_warning: !!v,
                          })
                        }}
                      />
                    </div>
                    {row?.min_warning && (
                      <div>
                        <InputNumber
                          style={{
                            width: 50,
                          }}
                          defaultValue={0.01}
                          min={0}
                          precision={2}
                          value={row?.min_quantity ?? 0.01}
                          onChange={(value) => {
                            ls.set(sku_id, {
                              min_quantity:
                                value === null
                                  ? ('' as unknown as null)
                                  : value,
                            })
                          }}
                        />
                        <span
                          style={{
                            paddingLeft: '5px',
                          }}
                        >
                          {base_unit_name}
                        </span>
                      </div>
                    )}
                  </Flex>
                  <Flex alignCenter>
                    <div
                      style={{
                        marginRight: '3px',
                      }}
                    >
                      <span
                        style={{
                          paddingRight: '2px',
                        }}
                      >
                        {t('??????: ')}
                      </span>
                      <Select
                        value={row?.max_warning ? 1 : 0}
                        data={[
                          {
                            value: 0,
                            text: '?????????',
                          },
                          {
                            value: 1,
                            text: '??????',
                          },
                        ]}
                        onChange={(v) => {
                          ls.set(sku_id, {
                            max_warning: !!v,
                          })
                        }}
                      />
                    </div>
                    {row?.max_warning && (
                      <div>
                        <InputNumber
                          style={{
                            width: 50,
                          }}
                          min={0}
                          precision={2}
                          defaultValue={0.01}
                          value={row?.max_quantity ?? 0.01}
                          onChange={(value) => {
                            ls.set(sku_id, {
                              max_quantity:
                                value === null
                                  ? ('' as unknown as null)
                                  : value,
                            })
                          }}
                        />
                        <span
                          style={{
                            paddingLeft: '5px',
                          }}
                        >
                          {base_unit_name}
                        </span>
                      </div>
                    )}
                  </Flex>
                </div>
              )
            }}
          </Observer>
        )
      },
    },
    {
      // Header: t('????????????'),
      Header: t('????????????'),
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          stock: { base_unit },
          base_unit_name,
        } = cellProps.row.original
        return (
          toFixedSalesInvoicing(Big(base_unit.quantity)) + `${base_unit_name}`
        )
      },
    },
    {
      // Header: t('????????????'),
      Header: t('????????????'),
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          stock: {
            base_unit: { price },
          },
        } = cellProps.row.original
        return getEndlessPrice(Big(price), true) + Price.getUnit()
      },
    },
    {
      // Header: t('????????????'),
      Header: t('???????????????'),
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          stock: { base_unit },
        } = cellProps.row.original
        return (
          changeLogNum({
            unit: base_unit,
            type: 'goodsValue',
          }) + Price.getUnit()
        )
      },
    },
    {
      id: 'action',
      fixed: 'right',
      diyEnable: true,
      diyItemText: t('??????'),
      width: TableXUtil.TABLE_X.WIDTH_OPERATION,
      Header: OperationHeader,
      Cell: (cellProps) => {
        const { sku_id } = cellProps.original

        return (
          <Observer>
            {() => {
              const row = getRow(sku_id)
              return (
                <OperationCellRowEdit
                  isEditing={!!row?.isEditing}
                  onClick={() => {
                    ls.toggle(sku_id)
                  }}
                  onCancel={() => {
                    ls.cancel(sku_id)
                  }}
                  onSave={() => {
                    ls.save(sku_id)
                  }}
                />
              )
            }}
          </Observer>
        )
      },
    },
  ]

  const columnsSpuDetail: Array<
    Column<
      SkuUnitStock & {
        ssu_info: SsuInfo
        ssu_base_unit_name: string
        operation: string
      }
    >
  > = [
    {
      Header: t('??????'),
      Cell: (cellProps) => {
        const {
          ssu_info,
          sku_id,
          sku_unit_id,
          ssu_base_unit_name,
          expire_type,
        } = cellProps.row.original
        const showText = showUnitText(ssu_info, ssu_base_unit_name)
        return (
          <Flex>
            <div>
              <a
                className='gm-text-primary gm-cursor'
                href={`#/sales_invoicing/inventory_account/stock_overview/inventory_overview/put_in_storage?sku_id=${sku_id}&sku_unit_id=${sku_unit_id}`}
              >
                {showText}
              </a>
            </div>
            {getHeathlyTag(expire_type)}
          </Flex>
        )
      },
    },
    {
      Header: t('????????????(????????????)'),
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          stock: { base_unit },
          base_unit_name,
        } = cellProps.row.original
        return (
          toFixedSalesInvoicing(Big(base_unit.quantity)) + `${base_unit_name}`
        )
      },
    },
    /** ?????????????????????????????? */
    // {
    //   Header: t('????????????(????????????(??????))'),
    //   Cell: (cellProps: { row: { original: any } }) => {
    //     const {
    //       stock: { sku_unit },
    //       ssu_info,
    //     } = cellProps.row.original
    //     let unit_name = '-'
    //     if (ssu_info) unit_name = ssu_info?.ssu?.unit?.name
    //     return ssu_info
    //       ? toFixedSalesInvoicing(Big(sku_unit.quantity)) + `${unit_name}`
    //       : unit_name
    //   },
    // },
    {
      Header: t('????????????'),
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          stock: {
            base_unit: { price },
          },
        } = cellProps.row.original
        return getEndlessPrice(Big(price), true) + Price.getUnit()
      },
    },
    {
      Header: t('????????????'),
      Cell: (cellProps: { row: { original: any } }) => {
        const {
          stock: { base_unit },
        } = cellProps.row.original
        return (
          changeLogNum({
            unit: base_unit,
            type: 'goodsValue',
          }) + Price.getUnit()
        )
      },
    },
    {
      Header: t('??????????????????'),
      accessor: 'operation',
      Cell: (cellProps: { row: { original: any } }) => {
        const { sku_id, sku_unit_id } = cellProps.row.original
        return (
          <TableXUtil.OperationCell>
            <TableXUtil.OperationDetail
              href={`#/sales_invoicing/inventory_account/commodity_ledger?sku_id=${sku_id}&unit_id=${sku_unit_id}`}
            />
          </TableXUtil.OperationCell>
        )
      },
    },
  ]

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText data={data} />
        </BoxTableInfo>
      }
    >
      <SelectTable
        id='inventory_overview'
        keyField='sku_id'
        data={list.slice()}
        onHeadersSort={(des) => {
          store.handleChangeFilter('sort', getSort(des))
          run()
        }}
        columns={columnSkuDetail}
        loading={loading}
        batchActions={[
          {
            children: (
              <BatchActionEdit>{t('????????????????????????')}</BatchActionEdit>
            ),
            onAction(selected: string[], isSelectedAll: boolean) {
              handleImport(selected, isSelectedAll)
            },
          },
        ]}
        SubComponent={({ original }) => (
          <Observer>
            {() => (
              <SubTable
                data={(
                  (original as SkuStockExpand).unit_stock_list ?? []
                ).slice()}
                columns={columnsSpuDetail as unknown as any}
              />
            )}
          </Observer>
        )}
      />
    </BoxTable>
  )
})

export default List
