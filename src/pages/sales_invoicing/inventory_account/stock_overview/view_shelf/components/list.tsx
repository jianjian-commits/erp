import { Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer, useLocalStore, Observer } from 'mobx-react'
import { action, get, set, toJS } from 'mobx'
import React from 'react'
import {
  BoxTable,
  Button,
  Flex,
  InputNumber,
  LevelSelect,
  Dialog,
  ButtonText,
  Tip,
  Price,
  BoxTableProps,
} from '@gm-pc/react'
import store from '../store'

import { TABLE_X } from '@gm-pc/table-x/src/utils'
import { useUnmount } from 'react-use'
import {
  Batch,
  CreateStockSheet,
  OperateType,
  StockSheetDetail,
  StockSheet_SheetStatus,
  StockSheet_SheetType,
} from 'gm_api/src/inventory'
import { getFormatTimeForTable } from '@/common/util'
import Big from 'big.js'
import { SkuForShow } from '@/pages/sales_invoicing/warehousing_data/shelf_manage/interface'
import { UnitValueSet } from 'gm_api/src/merchandise'
import lodash from 'lodash'
import globalStore from '@/stores/global'
import { combineCategoryAndSku } from '@/pages/sales_invoicing/util'

const center = (node: React.ReactNode) => node
const omissionMark = center('-')
const separator = ' '

// const getSsu = (originalRow) => {
//   const unit_id = originalRow.stock?.sku_unit?.unit_id
//   if (!unit_id) return void 0

//   const skuinfos = store.listBatchResponseBySkuID?.additional?.skuinfos
//   if (!skuinfos) return void 0

//   // const sku_id = originalRow.sku_id
//   return {}
//   // const ssu = skuinfos[sku_id].ssu_map?.[unit_id]?.ssu

//   // return ssu
// }

const List: React.FC<SkuForShow & Pick<BoxTableProps, 'pagination'>> = ({
  sku_name,
  sku_customized_code,
  pagination,
}) => {
  const ls = useLocalStore<{
    input: Array<number>
    input2: Array<number>
    base_unit_stock: {
      base_unit: Array<string>
      package_unit: Array<string>
      base_unit_id: Array<string>
      package_unit_id: Array<string>
    }
    shelf_selected: Array<string[]>
    canEdit: boolean
    changeSelectedShelf: (index: number, selected: string[]) => void
    toggleCanEdit: (bool: boolean) => void
    columns: Column<Batch>[]
  }>(() => ({
    input: [],
    input2: [],
    base_unit_stock: {
      base_unit: [],
      package_unit: [],
      base_unit_id: [],
      package_unit_id: [],
    },
    shelf_selected: [],
    changeSelectedShelf(index: number, selected: string[]) {
      set(this.shelf_selected, index, selected)
    },
    canEdit: false,
    toggleCanEdit(bool?: boolean) {
      if (bool !== void 0) {
        this.canEdit = bool
      } else {
        this.canEdit = !this.canEdit
      }
    },
    get columns() {
      const columns_: Column<Batch>[] = [
        { Header: t('批次号'), accessor: 'batch_serial_no' },
        {
          Header: t('供应商'),
          accessor: (originalRow) => {
            if (
              !originalRow.supplier_id ||
              !store.listBatchResponseBySkuID?.additional?.suppliers?.hasOwnProperty(
                originalRow.supplier_id,
              )
            ) {
              return omissionMark
            }
            return center(
              store.listBatchResponseBySkuID.additional.suppliers[
                originalRow.supplier_id
              ].name,
            )
          },
        },
        {
          Header: t('批次均价'),
          accessor: (originalRow) => {
            const {
              stock,
              input_stock: { input },
            } = originalRow
            const { units } = store.listBatchResponseBySkuID?.additional!
            const baseUnit = units![stock!.base_unit?.unit_id!].rate
            const unit = units![input!.unit_id!].rate
            return center(
              Big(unit)
                .div(baseUnit)
                .times(stock!.base_unit?.price!)
                .toFixed(4) + Price.getUnit(),
            )
          },
        },
        {
          Header: t('入库日期'),
          accessor: (originalRow) => {
            return center(
              getFormatTimeForTable(
                'YYYY-MM-DD HH:mm',
                originalRow.in_stock_time,
              ),
            )
          },
        },
        {
          Header: t('生产日期'),
          accessor: (originalRow) => {
            return center(
              getFormatTimeForTable(
                'YYYY-MM-DD HH:mm',
                originalRow.production_time,
              ),
            )
          },
        },
        {
          Header: t('保质期'),
          accessor: (originalRow) => {
            return center(
              getFormatTimeForTable(
                'YYYY-MM-DD HH:mm',
                originalRow.expiry_time,
              ),
            )
          },
        },
        {
          Header: t('账面库存（基本单位）'),
          accessor: (originalRow, index: number) => {
            const unit_id = originalRow.stock?.sku_unit?.unit_id

            if (!unit_id) return omissionMark
            if (+unit_id >= 200000) {
              const quantity = originalRow.stock?.base_unit?.quantity
              const ssu_base_unit = globalStore.getUnit(unit_id)

              if (!quantity) return omissionMark

              const result =
                +Big(quantity).toFixed(4) + separator + ssu_base_unit.text

              set(this.base_unit_stock.base_unit, index, result)
              set(this.base_unit_stock.base_unit_id, index, ssu_base_unit.value)

              return center(result)
            }

            // const ssu = getSsu(originalRow)

            // if (!ssu) return omissionMark

            // const {
            //   ssu_unit_parent_name,
            //   ssu_base_unit_rate,
            //   ssu_unit_parent_id,
            // } = parseSsu(ssu)
            const quantity = originalRow.stock?.base_unit?.quantity
            if (!quantity) return omissionMark

            const result = +Big(quantity).div(1).toFixed(4)
            // separator +
            // ssu_unit_parent_name

            // set(this.base_unit_stock.base_unit, index, result)
            // set(this.base_unit_stock.base_unit_id, index, ssu_unit_parent_id)

            return center(result)
          },
        },
      ]

      if (!this.canEdit) {
        return columns_
      } else {
        return [
          ...columns_,
          {
            Header: t('调拨数（基本单位）'),
            accessor: 'j',
            Cell: (cellProps) => {
              const { index, original } = cellProps
              const base_unit_stock = get(
                this.base_unit_stock.base_unit,
                index,
              ) as string

              if (!base_unit_stock) return omissionMark

              const [counts, units] = base_unit_stock.split(separator)

              return (
                <Flex column style={{ width: '120px' }}>
                  <Observer>
                    {() => (
                      <Flex justifyCenter alignCenter>
                        <InputNumber
                          type='number'
                          value={get(this.input, index)}
                          min={0}
                          max={+(+counts).toFixed(4)}
                          maxLength={30}
                          onChange={action((event) => {
                            const getRate = () => {
                              const unit_id = original.stock?.sku_unit?.unit_id
                              if (!unit_id) return 1

                              const { category_map, sku_map } =
                                store.listBatchResponseBySkuID?.additional!

                              const skuinfos = combineCategoryAndSku(
                                category_map,
                                sku_map,
                              )

                              if (!skuinfos) return 1

                              const sku_id = original.sku_id
                              const ssu =
                                skuinfos[sku_id].ssu_map?.[unit_id]?.ssu
                              if (!ssu) return 1

                              return ssu.unit.rate
                            }

                            set(this.input, index, event)
                            if (event! >= +counts) {
                              set(
                                this.input2,
                                index,
                                (
                                  get(
                                    this.base_unit_stock.package_unit,
                                    index,
                                  ) as string
                                ).split(separator)[0],
                              )
                            } else {
                              set(
                                this.input2,
                                index,
                                +Big(event ?? 0)
                                  .div(getRate())
                                  .toFixed(4),
                              )
                            }
                          })}
                          style={{ width: TABLE_X.WIDTH_NUMBER }}
                        />
                        {units}
                      </Flex>
                    )}
                  </Observer>
                </Flex>
              )
            },
          },
          {
            Header: t('调入货位'),
            accessor: 'l',
            Cell: (cellProps) => {
              const { index } = cellProps

              const base_unit_stock = get(
                this.base_unit_stock.base_unit,
                index,
              ) as string

              if (!base_unit_stock) return omissionMark

              return (
                <Flex column style={{ width: '120px' }}>
                  <Observer>
                    {() => (
                      <LevelSelect
                        onSelect={(value) => {
                          this.changeSelectedShelf(index, value)
                        }}
                        selected={get(this.shelf_selected, index) ?? [].slice()}
                        data={toJS(store.shelfList)}
                        right
                        style={{ width: TABLE_X.WIDTH_SELECT }}
                      />
                    )}
                  </Observer>
                </Flex>
              )
            },
          },
        ]
      }
    },
  }))

  useUnmount(
    action(() => {
      store.listBatchResponseBySkuID = null
    }),
  )

  return (
    <BoxTable
      pagination={pagination}
      info={`${sku_name} ${sku_customized_code}`}
      action={
        <Button type='primary' onClick={() => void ls.toggleCanEdit(true)}>
          {t('调拨')}
        </Button>
      }
    >
      <Table<any>
        loading={!store.listBatchResponseBySkuID}
        data={store.listBatchResponseBySkuID?.batches.slice() ?? []}
        columns={ls.columns}
      />
      {ls.canEdit && (
        <Flex justifyCenter className='gm-margin-20'>
          <Button
            type='primary'
            onClick={() => {
              Dialog.render({
                title: '可视化货位调拨',
                children: (
                  <ButtonText>
                    确认进行调拨吗？ <br />
                    确认后请到仓储管理-调拨单中进行提交审核
                  </ButtonText>
                ),
                buttons: [
                  {
                    text: '取消',
                    onClick() {
                      Dialog.hide()
                    },
                  },
                  {
                    btnType: 'primary',
                    text: '确定',
                    onClick: action(() => {
                      const details: Array<StockSheetDetail> = ls.input
                        .map<StockSheetDetail | boolean>((it, idx) => {
                          if (!it || !ls.shelf_selected[idx]) return false
                          if (
                            Array.isArray(ls.shelf_selected[idx]) &&
                            ls.shelf_selected[idx].length === 0
                          )
                            return false

                          const batch =
                            store.listBatchResponseBySkuID?.batches[idx]
                          if (!batch) return false

                          const {
                            sku_id,
                            shelf_id,
                            sku_unit_id,
                            spu_id,
                            base_unit_id,
                            parent_id,
                          } = batch

                          const 调拨数包装 = ls.input2[idx] as number
                          const sku_unit_id_ =
                            ls.base_unit_stock.package_unit_id[idx]
                          const ssu_unit_parent_id =
                            ls.base_unit_stock.base_unit_id[idx]

                          const input = {
                            price: '0',
                            quantity: it.toString(),
                            unit_id: ssu_unit_parent_id,
                          }

                          const input2 =
                            +base_unit_id >= 200000
                              ? input
                              : {
                                  price: '0',
                                  quantity: 调拨数包装.toString(),
                                  unit_id: sku_unit_id_,
                                }

                          const input_stock: UnitValueSet = {
                            input,
                            input2,
                          }

                          return {
                            amount: '0',
                            create_batches: [],
                            shelf_id,
                            sku_id,
                            sku_unit_id,
                            spu_id,
                            base_unit_id,
                            input_stock,
                            update_batches: [
                              {
                                batch_id: parent_id!,
                                input_stock,
                                operate_type:
                                  OperateType.OPERATE_TYPE_TRANSFER_OUT,
                                shelf_id,
                              },
                              {
                                batch_id: parent_id!,
                                input_stock,
                                operate_type:
                                  OperateType.OPERATE_TYPE_TRANSFER_IN,
                                shelf_id: lodash.last(ls.shelf_selected[idx]),
                              },
                            ],
                          }
                        })
                        .filter(Boolean) as Array<StockSheetDetail>

                      if (details.length === 0) {
                        Tip.tip(t('请完善调拨信息'))
                        Dialog.hide()

                        return void 0
                      }

                      CreateStockSheet({
                        stock_sheet: {
                          sheet_type: StockSheet_SheetType.SHEET_TYPE_TRANSFER,
                          sheet_status:
                            StockSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED,
                          details,
                          total_price: '',
                          remark: '',
                          related_sheet_id: '0',
                        },
                      })
                        .then((json) => {
                          Tip.success(t('提交调拨') + t('成功'))
                          return json
                        })
                        .catch(() => {
                          Tip.danger(t('提交调拨') + t('失败'))
                        })
                      Dialog.hide()
                    }),
                  },
                ],
              })
            }}
          >
            {t('保存')}
          </Button>
        </Flex>
      )}
    </BoxTable>
  )
}

export default observer(List)
