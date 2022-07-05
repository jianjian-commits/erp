import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { getLinkCalculate, isSystemSsuUnitType } from '../../../../util'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const SsuQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props

  const { ssu_quantity_show, ssu_unit_name, ssu_unit_type } = data
  const { related_sheet_id } = store.receiptDetail

  const handleQuantityChange = (value: number | null) => {
    const { ssu_base_quantity, ssu_base_quantity_show } = getLinkCalculate({
      data,
      currentField: 'ssu_quantity',
      currentValue: value,
      canPackage: isSystemSsuUnitType(ssu_unit_type),
    })

    store.changeProductDetailsItem(index, {
      ssu_quantity: value,
      ssu_quantity_show: value,
      ssu_base_quantity,
      ssu_base_quantity_show,
      batch_selected: [], // 改变数量需要清空批次 // 现在不需要了 // 现在又要清除了
    }) // 改变数量需要清空批次
  }

  return (
    <Flex alignCenter>
      {related_sheet_id !== '0' ? (
        ssu_quantity_show
      ) : (
        <KCPrecisionInputNumber
          precisionType='salesInvoicing'
          value={ssu_quantity_show}
          onChange={handleQuantityChange}
          min={0}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
      )}

      <span className='gm-padding-5'>{ssu_unit_name || '-'}</span>
    </Flex>
  )
})

export default SsuQuantityCell
