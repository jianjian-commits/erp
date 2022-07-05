import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { orderState } from '../../../enum'
import globalStore from '@/stores/global'

const orderStateSelectData = globalStore.isLite
  ? [
      { value: 1, text: t('未出库') },
      { value: 3, text: t('已出库') },
    ]
  : orderState

const StateFilter = (props: { value: number; onChange: (v: any) => void }) => {
  return (
    <Select
      data={[{ value: 0, text: t('全部状态') }, ...orderStateSelectData]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default StateFilter
