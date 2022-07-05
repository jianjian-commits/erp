import { t } from 'gm-i18n'
import React, { ChangeEvent, FC } from 'react'
import { KCInput } from '@gm-pc/keyboard'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'

import WarningPopover from '@/common/components/icon/warning_popover'
import store from '../store'

interface Props {
  name: string
  index: number
  values: string[]
}

const CellGuideName: FC<Props> = observer(({ index, name, values }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    store.updateGuideDataList(index, 'name', e.target.value)
  }

  return (
    <Flex alignCenter>
      <KCInput
        type='text'
        name='name'
        autoComplete='off'
        value={name}
        maxLength={8}
        onChange={handleChange}
      />
      {!name.trim() && values.length > 0 && (
        <WarningPopover
          popup={
            <div className='gm-padding-5'>
              {t('请输入指导参数，否则可选项设置参数将不保存')}
            </div>
          }
          right={false}
        />
      )}
    </Flex>
  )
})

export default CellGuideName
