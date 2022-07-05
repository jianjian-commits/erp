import { t } from 'gm-i18n'
import React, { FC, useCallback, useMemo } from 'react'
import { Observer, observer } from 'mobx-react'
import store from '../store'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'

import { getSsusExpanded } from '../util'
import MealSsuNameCell from './meal_ssu_table/name_cell'
import MealSsuRemarkCell from './meal_ssu_table/remark_cell'
import { EditStatusProps, MenuDetailItem, Ingredient } from '../interface'
import { initEditStatus } from '../init_data'
import CellPrice from './meal_ssu_table/cell_price'
import { Flex, Price, Select } from '@gm-pc/react'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import _ from 'lodash'

const { TABLE_X, EditOperation, OperationHeader, OperationCell } = TableXUtil

const MealDetail: FC<{
  mealIndex: number
  editStatus: EditStatusProps
}> = observer(({ mealIndex, editStatus = initEditStatus }) => {
  const {
    details: { service_period_infos },
  } = store.editMenu
  const { menu_period_group_id, details } = service_period_infos[mealIndex]
  const { canAddSsu, canDeleteSsu } = editStatus

  const handleAddSsu = useCallback(() => {
    if (!canAddSsu) return
    store.addMealSsu(mealIndex)
  }, [mealIndex, canAddSsu])

  const handleDelSsu = useCallback(
    (ssuIndex: number) => {
      if (!canDeleteSsu) return
      if (details.length === 1) {
        store.deleteMealSsu(mealIndex, ssuIndex)
        store.addMealSsu(mealIndex)
      } else {
        store.deleteMealSsu(mealIndex, ssuIndex)
      }
    },
    [canDeleteSsu, details.length, mealIndex],
  )

  const handleExpand = () => {
    console.log('handleExpand')
  }

  const columns = useMemo<Column<MenuDetailItem>[]>(
    () => [
      {
        Header: OperationHeader,
        id: 'operation',
        width: TABLE_X.WIDTH_EDIT_OPERATION + 10,
        show: editStatus.canEditSsu,
        Cell: (cellProps) => {
          return (
            <OperationCell>
              <EditOperation
                onAddRow={handleAddSsu}
                onDeleteRow={() => handleDelSsu(cellProps.index)}
              />
            </OperationCell>
          )
        },
      },
      {
        Header: t('商品名'),
        accessor: 'sku_id',
        isKeyboard: true,
        width: TABLE_X.WIDTH_SEARCH + 10,
        Cell: (cellProps) => {
          return (
            <MealSsuNameCell
              editStatus={editStatus}
              mealIndex={mealIndex}
              ssuIndex={cellProps.index}
            />
          )
        },
      },
      {
        Header: t('单价/单位'),
        accessor: 'units',
        minWidth: 200,
        Cell: (cellProps) => {
          const original = cellProps.original
          const isCombine = original.sku_type === Sku_SkuType.COMBINE
          if (isCombine) {
            return (
              <Observer>
                {() => (
                  <Flex>
                    {original.price}
                    {Price.getUnit()}/{original.unit?.text}
                  </Flex>
                )}
              </Observer>
            )
          }
          return (
            <Observer>
              {() => (
                <Flex alignCenter>
                  <CellPrice
                    value={original.price}
                    onChange={(value) =>
                      store.changeMealSsu(mealIndex, cellProps.index, {
                        price: value,
                      })
                    }
                  />
                  /
                  <Select
                    style={{ minWidth: 100 }}
                    data={original.units}
                    value={original.fee_unit_id}
                    onChange={(val) => {
                      store.changeMealSsu(mealIndex, cellProps.index, {
                        fee_unit_id: val,
                      })
                    }}
                  />
                </Flex>
              )}
            </Observer>
          )
        },
      },
      {
        Header: t('备注'),
        accessor: 'remark',
        isKeyboard: true,
        width: 80,
        Cell: (cellProps) => {
          return (
            <MealSsuRemarkCell
              editStatus={editStatus}
              mealIndex={mealIndex}
              ssuIndex={cellProps.index}
            />
          )
        },
      },
    ],
    [handleAddSsu, editStatus, handleDelSsu, mealIndex],
  )

  const subColumns = useMemo<Column<Ingredient>[]>(
    () => [
      {
        Header: t('原料名'),
        accessor: 'name',
        width: 80,
      },
      {
        Header: t('单价/单位'),
        accessor: 'rate',
        Cell: (cellProps) => {
          const original = cellProps.original
          return (
            <Observer>
              {() => (
                <Flex alignCenter>
                  <CellPrice
                    style={{ width: 100 }}
                    value={original.price}
                    onChange={(value) => {
                      store.changeMealChildItem(
                        mealIndex,
                        original.skuIndex,
                        cellProps.index,
                        { price: value },
                      )
                    }}
                  />
                  /
                  <Select
                    style={{ minWidth: 100 }}
                    data={original.units}
                    value={original.fee_unit_id}
                    onChange={(val) => {
                      const unit = _.find(
                        original.units,
                        (item) => item.value === val,
                      )
                      if (unit) {
                        store.changeMealChildItem(
                          mealIndex,
                          original.skuIndex,
                          cellProps.index,
                          { fee_unit_id: val, unit },
                        )
                      }
                    }}
                  />
                </Flex>
              )}
            </Observer>
          )
        },
      },
      {
        Header: t('配比'),
        accessor: 'ration',
        isKeyboard: true,
        Cell: (cellProps) => {
          const { original } = cellProps
          return (
            <Observer>
              {() => (
                <Flex className='tw-whitespace-nowrap' alignCenter>
                  <KCPrecisionInputNumber
                    style={{ width: 120 }}
                    precisionType='salesInvoicing'
                    value={original.ratio}
                    onChange={(val) => {
                      store.changeMealChildItem(
                        mealIndex,
                        original.skuIndex,
                        cellProps.index,
                        { ratio: val },
                      )
                    }}
                  />
                  {original.unit?.label}
                </Flex>
              )}
            </Observer>
          )
        },
      },
    ],
    [],
  )

  return (
    <Table
      isKeyboard
      isExpand
      isEdit
      id={'menu_detail_' + menu_period_group_id}
      tiled
      columns={columns}
      onAddRow={handleAddSsu}
      data={details.slice()}
      expanded={getSsusExpanded(details)}
      onExpand={handleExpand}
      hideExpandColumn
      SubComponent={(row) => {
        const { index } = row
        return (
          <Table
            isKeyboard
            isSub
            isEdit
            id={'menu_detail_meal_detail' + index}
            tiled
            columns={subColumns}
            // 净菜菜谱
            data={row.original.ingredientsInfo || []}
          />
        )
      }}
    />
  )
})

MealDetail.displayName = 'MealDetail'

export default MealDetail
