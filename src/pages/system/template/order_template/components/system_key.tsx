import { i18next } from 'gm-i18n'
import React, { FC } from 'react'
import { Select } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'

import { keysFun } from '../util'

interface NameProps {
  original: any
  onChange: (v: any) => void
  systemKeys: number[]
  type: number
}

const Name: FC<NameProps> = observer(
  ({ type, original: { system_key }, systemKeys, onChange }) => {
    const keys = keysFun(type)
    return (
      <Select
        value={system_key}
        onChange={onChange}
        style={{ minWidth: 90 }}
        data={[
          {
            value: undefined,
            text: i18next.t('选择名称'),
          },
          ...keys.filter(
            (item) =>
              !systemKeys.includes(item.value) || system_key === item.value,
          ),
        ]}
      />
    )
  },
)

export default Name
