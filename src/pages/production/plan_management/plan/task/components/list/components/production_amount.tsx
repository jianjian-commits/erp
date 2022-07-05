import React, { FC } from 'react'
import { TaskProcess_Material } from 'gm_api/src/production'
import globalStore from '@/stores/global'
import { Flex } from '@gm-pc/react'
import { toFixed } from '@/pages/production/util'

interface Props {
  type: 'actual' | 'plan'
  material: TaskProcess_Material
  hidden?: boolean
}

const ProductionAmount: FC<Props> = (props) => {
  const {
    material: { plan_amount, actual_amount, base_unit_id },
    type,
    hidden,
  } = props

  const amount = type === 'plan' ? plan_amount : actual_amount
  return (
    <>
      {hidden ? (
        '-'
      ) : (
        <Flex justifyCenter alignCenter>
          <span>
            {toFixed(amount || '0') + globalStore.getUnitName(base_unit_id!)}
          </span>
        </Flex>
      )}
    </>
  )
}

export default ProductionAmount
