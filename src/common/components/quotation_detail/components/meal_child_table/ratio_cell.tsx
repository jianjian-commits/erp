import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import store from '../../store'
import { KCInputNumber, KCSelect } from '@gm-pc/keyboard'
import { TableXUtil } from '@gm-pc/table-x'
import { Flex } from '@gm-pc/react'
import { ListUnit } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { KeyboardTableChildCellOptions } from '../../interface'
import globalStore from '@/stores/global'

const { TABLE_X } = TableXUtil

const MealBomRateCell: FC<KeyboardTableChildCellOptions> = observer(
  ({ mealIndex, ssuIndex, bomIndex }) => {
    const ssu =
      store.editMenu?.details?.service_period_infos[mealIndex]?.details[
        ssuIndex
      ]?.ssu_ingredients?.ssu_ratios[bomIndex]
    const [unitList, setUnitList] = useState([])

    useEffect(() => {
      if (ssu?.unit?.unit_id) {
        ListUnit({ related_unit_id: ssu?.unit?.parent_id }).then((json) => {
          const list = _.map(json.response.units, (un) => ({
            parent_id: un.parent_id,
            text: un.name,
            value: un.unit_id,
            rate: un.rate,
          }))
          setUnitList(list)
          return json
        })
      }
    }, [ssu?.unit?.parent_id])

    const handleQuantityChange = (value: number | null) => {
      store.changeMealChildItem(
        mealIndex,
        ssuIndex,
        bomIndex,
        {
          ratio: value,
        },
        false,
      )
    }

    const handleUnitChange = (value: string) => {
      store.changeMealChildItem(
        mealIndex,
        ssuIndex,
        bomIndex,
        {
          use_unit_id: value,
        },
        true,
      )
    }

    return (
      <Flex alignCenter>
        <KCInputNumber
          value={ssu?.ratio}
          onChange={handleQuantityChange}
          min={0}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
          precision={globalStore.dp}
        />
        <KCSelect
          data={unitList}
          value={ssu?.use_unit_id}
          onChange={handleUnitChange}
        />
        {/* <span className='gm-padding-5'> */}
        {/*  {globalStore.getUnitName(ssu?.unit_id)} */}
        {/* </span> */}
      </Flex>
    )
  },
)

export default MealBomRateCell
