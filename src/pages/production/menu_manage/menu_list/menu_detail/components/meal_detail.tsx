import { t } from 'gm-i18n'
import React, { FC, useCallback, useMemo } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'

import { getSsusExpanded } from '../util'
import { MealDetailProps } from '../interface'
import MealSsuNameCell from './meal_ssu_table/name_cell'
import MealSsuPriceCell from './meal_ssu_table/price_cell'
import MealBomNameCell from './meal_bom_table/name_cell'
import MealBomRateCell from './meal_bom_table/rate_cell'

const { TABLE_X, EditOperation, OperationHeader, OperationCell } = TableXUtil

const MealDetail: FC<MealDetailProps> = observer(
  ({ mealIndex, editStatus }) => {
    const {
      details: { service_period_infos },
    } = store.editMenu
    const { menu_period_group_id, details } = service_period_infos[mealIndex]
    const { canAddBom, canAddSsu, canDeleteBom, canDeleteSsu } = editStatus

    const handleAddSsu = useCallback(() => {
      if (!canAddSsu) return
      store.addMealItem(mealIndex)
    }, [])

    const handleAddBom = useCallback((ssuIndex) => {
      if (!canAddBom) return
      store.addMealBomItem(mealIndex, ssuIndex)
    }, [])

    const handleDelSsu = (ssuIndex: number) => {
      if (!canDeleteSsu) return
      if (details.length === 1) {
        store.deleteMealItem(mealIndex, ssuIndex)
        store.addMealItem(mealIndex)
      } else {
        store.deleteMealItem(mealIndex, ssuIndex)
      }
    }

    const handleDelBom = (ssuIndex: number, bomIndex: number) => {
      if (!canDeleteBom) return
      if (details.length === 1) {
        store.deleteMealBom(mealIndex, ssuIndex, bomIndex)
        store.addMealBomItem(mealIndex, ssuIndex)
      } else {
        store.deleteMealBom(mealIndex, ssuIndex, bomIndex)
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
          accessor: 'unit_id',
          isKeyboard: true,
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
          Header: t('价格'),
          accessor: 'price',
          Cell: (cellProps) => {
            return (
              <MealSsuPriceCell
                editStatus={editStatus}
                mealIndex={mealIndex}
                ssuIndex={cellProps.index}
              />
            )
          },
        },
      ],
      [handleAddSsu],
    )

    const subColumns: Column[] = useMemo(
      () => [
        {
          Header: OperationHeader,
          id: 'operation',
          width: TABLE_X.WIDTH_OPERATION,
          show: editStatus.canEditBom,
          Cell: (cellProps) => {
            return (
              <OperationCell>
                <EditOperation
                  onAddRow={() =>
                    handleAddBom(cellProps.original?.material?.ssuIndex)
                  }
                  onDeleteRow={() =>
                    handleDelBom(
                      cellProps.original?.material?.ssuIndex,
                      cellProps.index,
                    )
                  }
                />
              </OperationCell>
            )
          },
        },
        {
          Header: t('原料名'),
          accessor: 'unit_id',
          isKeyboard: true,
          Cell: (cellProps) => {
            return (
              <MealBomNameCell
                editStatus={editStatus}
                mealIndex={mealIndex}
                ssuIndex={cellProps.original?.material?.ssuIndex}
                bomIndex={cellProps.index}
              />
            )
          },
        },
        {
          Header: t('配比'),
          accessor: 'price',
          Cell: (cellProps) => {
            return (
              <MealBomRateCell
                editStatus={editStatus}
                mealIndex={mealIndex}
                ssuIndex={cellProps.original?.material?.ssuIndex}
                bomIndex={cellProps.index}
              />
            )
          },
        },
      ],
      [handleAddBom],
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
        SubComponent={({ index }) => {
          const { bom, unit_id, ssu_id } = details[index]
          const { inputs } = bom.processes.processes[0]
          return (
            <Table
              isKeyboard
              isSub
              isEdit
              id={'menu_detail_meal_detail' + unit_id + ssu_id}
              tiled
              columns={subColumns}
              onAddRow={handleAddBom}
              data={inputs.slice()}
            />
          )
        }}
      />
    )
  },
)

export default MealDetail
