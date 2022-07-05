import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { orderPayState } from '../../../enum'
import { Order_PayState } from 'gm_api/src/order'
import globalStore from '@/stores/global'

const PayStateFilter = (props: {
  value: number
  onChange: (v: any) => void
}) => {
  return (
    <Select
      data={[
        { value: 0, text: t('全部状态') },
        ...orderPayState.filter((item) =>
          globalStore.isLite
            ? [
                Order_PayState.PAYSTATE_NOTPAY,
                Order_PayState.PAYSTATE_PAID,
              ].includes(item.value)
            : true,
        ),
      ]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default PayStateFilter
