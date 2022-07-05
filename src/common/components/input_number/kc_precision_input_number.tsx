import type { InputNumberProps } from '@gm-pc/react'
import React, { FC } from 'react'

import globalStore from '@/stores/global'
import { KCInputNumber } from '@gm-pc/keyboard'
import { PrecisionMapKeyType } from '../../interface'

interface Props extends InputNumberProps {
  precisionType?: PrecisionMapKeyType
}

/**
 * @description 统一处理InputNumber精度
 */
const KCPrecisionInputNumber: FC<Props> = (props) => {
  const { precisionType = 'common', ...rest } = props
  let globalPrecision = globalStore.dp
  // 别的模块再各自添加吧
  if (precisionType === 'salesInvoicing')
    globalPrecision = globalStore.dpSalesInvoicing
  if (precisionType === 'order') globalPrecision = globalStore.dpOrder
  if (precisionType === 'dpInventoryAmount')
    globalPrecision = globalStore.dpInventoryAmount
  if (precisionType === 'dpSupplierSettle')
    globalPrecision = globalStore.dpSupplierSettle

  const precision = props.precision ?? globalPrecision

  return <KCInputNumber {...rest} precision={precision} />
}

export default KCPrecisionInputNumber
