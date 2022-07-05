import { toFixed } from '@/pages/production/util'
import globalStore from '@/stores/global'
import { Flex } from '@gm-pc/react'
import Big from 'big.js'
import { SsuInfo } from 'gm_api/src/merchandise'
import { TaskProcess_Material } from 'gm_api/src/production'
import React, { FC, useMemo } from 'react'
import { amountTypeToMaterial, AMOUT_TYPE } from '../../../enum'

interface Props {
  type: AMOUT_TYPE
  material: TaskProcess_Material
  ssuInfo: SsuInfo
  /** 基本还是包装 */
  isBaseUnit?: boolean
  packRate?: string
}

const PackAmount: FC<Props> = (props) => {
  const { type, ssuInfo, isBaseUnit, material, packRate } = props
  const name = useMemo(
    () =>
      isBaseUnit
        ? globalStore.getUnitName(material?.base_unit_id!)
        : ssuInfo?.ssu?.unit.name,
    [],
  )

  return (
    <Flex justifyCenter alignCenter>
      <span>
        {toFixed(
          Big(material[amountTypeToMaterial[type]] || '0')
            .times(packRate || 1)
            .toString(),
        ) + name}
      </span>
    </Flex>
  )
}

export default PackAmount
