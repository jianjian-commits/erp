import { t } from 'gm-i18n'
import React, { FC, useCallback, useMemo } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from '../store'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import MealSkuNameCell from './meal_sku_table/name_cell'
import MealSkuCountCell from './meal_sku_table/count_cell'
import MealSkuUnitCell from './meal_sku_table/unit_cell'

interface MealDetailProps {
  mealIndex: number
}

const { TABLE_X, EditOperation, OperationHeader, OperationCell } = TableXUtil

const MealDetail: FC<MealDetailProps> = observer(({ mealIndex }) => {
  const periodInfos = _.get(store.editMenu, 'periodInfos', [])

  const { menu_period_group_id, detail_skus } = periodInfos[mealIndex]

  const handleAddSku = useCallback(() => {
    store.addMealItem(mealIndex)
  }, [])

  const handleDelSku = (skuIndex: number) => {
    if (detail_skus.length === 1) {
      store.deleteMealItem(mealIndex, skuIndex)
      store.addMealItem(mealIndex)
    } else {
      store.deleteMealItem(mealIndex, skuIndex)
    }
  }

  const handleExpand = () => {
    console.log('handleExpand')
  }

  const columns: Column[] = useMemo(
    () => [
      {
        Header: OperationHeader,
        id: 'operation',
        width: TABLE_X.WIDTH_EDIT_OPERATION + 10,
        Cell: (cellProps) => {
          const isLastItem = cellProps.index === detail_skus.length - 1
          return (
            <OperationCell>
              <EditOperation
                onAddRow={isLastItem ? handleAddSku : undefined}
                onDeleteRow={() => handleDelSku(cellProps.index)}
              />
            </OperationCell>
          )
        },
      },
      {
        Header: t('商品名'),
        accessor: 'unit_id',
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <MealSkuNameCell mealIndex={mealIndex} skuIndex={cellProps.index} />
          )
        },
      },
      {
        Header: t('数量'),
        accessor: 'count',
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <MealSkuCountCell
              mealIndex={mealIndex}
              skuIndex={cellProps.index}
            />
          )
        },
      },
      {
        Header: t('单位'),
        accessor: 'unit',
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <MealSkuUnitCell mealIndex={mealIndex} skuIndex={cellProps.index} />
          )
        },
      },
    ],
    [handleAddSku],
  )

  return (
    <Table
      isKeyboard
      isExpand
      isEdit
      id={'menu_detail_' + menu_period_group_id}
      tiled
      columns={columns}
      onAddRow={handleAddSku}
      data={detail_skus.slice()}
      onExpand={handleExpand}
      hideExpandColumn
    />
  )
})

export default MealDetail
