import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { getLinkCalculate, isSystemSsuUnitType } from '../../../../util'
import store from '../../stores/detail_store'
import { Flex, Price } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { checkDigit } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: any
}

const SsuQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { ssu_quantity_show, ssu_unit_name, ssu_unit_type } = data
  const { receiptDetail } = store

  const handleStdUnitPriceChange = (value: number) => {
    const {
      ssu_base_quantity,
      ssu_base_quantity_show,
      ssu_base_price_show,
      ssu_base_price,
      different_price_show,
      different_price,
      amount_show,
      amount,
    } = getLinkCalculate({
      data,
      currentField: 'ssu_quantity',
      currentValue: value,
      canPackage: isSystemSsuUnitType(ssu_unit_type), // 如果ssu.unit_type是系统基本单位的话，那就需要开启包装单位(废弃)换算
    })
    store.changeProductDetailsItem(index, {
      ssu_quantity: value,
      ssu_quantity_show: value,
      ssu_base_quantity,
      ssu_base_quantity_show,
      ssu_base_price_show,
      ssu_base_price,
      different_price_show,
      different_price,
      amount_show,
      amount,
    })
  }

  const canEdit = !checkDigit(receiptDetail.status, 8)

  return (
    <>
      <Flex alignCenter>
        {canEdit ? (
          <KCPrecisionInputNumber
            value={ssu_quantity_show}
            onChange={handleStdUnitPriceChange}
            min={0}
            precisionType='salesInvoicing'
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
        ) : (
          ssu_quantity_show
        )}

        <span className='gm-padding-5'>{ssu_unit_name || '-'}</span>
      </Flex>
    </>
  )
})

export default SsuQuantityCell
