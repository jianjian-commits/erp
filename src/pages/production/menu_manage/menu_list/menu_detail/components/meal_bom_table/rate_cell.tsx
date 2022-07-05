import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import { KCInputNumber, KCSelect } from '@gm-pc/keyboard'
import { TableXUtil } from '@gm-pc/table-x'
import { Flex } from '@gm-pc/react'
import { ListUnit } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { keyboardTableChildCellOptions } from '../../interface'

const { TABLE_X } = TableXUtil

const MealBomRateCell: FC<keyboardTableChildCellOptions> = observer(
  ({ mealIndex, ssuIndex, bomIndex, editStatus }) => {
    const sku =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]?.bom?.processes?.processes[0]?.inputs[bomIndex]?.material
    const [unitList, setUnitList] = useState([])

    useEffect(() => {
      if (sku?.unit_id) {
        ListUnit({ related_unit_id: sku?.unit_id }).then((json) => {
          setUnitList(
            _.map(json.response.units, (un) => ({
              parent_id: un.parent_id,
              text: un.name,
              value: un.unit_id,
              rate: un.rate,
            })),
          )
        })
      }
    }, [sku?.unit_id])

    const handleQuantityChange = (value: number | null) => {
      const new_value = value === null ? '' : value
      store.changeMealBomItem(mealIndex, ssuIndex, bomIndex, {
        quantity: new_value,
      })
    }

    const handleUnitChange = (value: string) => {
      store.changeMealBomItem(mealIndex, ssuIndex, bomIndex, {
        unit_id: value,
      })
    }

    return (
      <Flex alignCenter>
        <KCInputNumber
          value={sku?.quantity}
          onChange={handleQuantityChange}
          min={0}
          disabled={!editStatus?.canEditBom}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
        <KCSelect
          data={unitList}
          disabled={!editStatus?.canEditBom}
          value={sku?.unit_id}
          onChange={handleUnitChange}
        />
        {/* <span className='gm-padding-5'> */}
        {/*  {globalStore.getUnitName(sku?.unit_id)} */}
        {/* </span> */}
      </Flex>
    )
  },
)

export default MealBomRateCell
