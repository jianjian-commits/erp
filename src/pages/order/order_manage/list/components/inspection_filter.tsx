import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { ListOrderDetailRequest_AcceptState } from 'gm_api/src/order'

const InspectionFilter = (props: {
  value: number
  onChange: (v: number) => void
}) => {
  return (
    <Select
      data={[
        {
          value: ListOrderDetailRequest_AcceptState.ACCEPT_STATUS_UNSPECIFIED,
          text: t('全部状态'),
        },
        {
          value: ListOrderDetailRequest_AcceptState.ACCEPT_STATUS_NONE,
          text: t('未验收'),
        },
        {
          value: ListOrderDetailRequest_AcceptState.ACCEPT_STATUS_DONE,
          text: t('已验收'),
        },
      ]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default InspectionFilter
