import React from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { appType } from '../../../enum'

const AppFilter = (props: { value: string; onChange: (v: any) => void }) => {
  return (
    <Select
      data={[{ value: '', text: t('全部来源') }, ...appType]}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default AppFilter
