import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { FullTabs } from '@gm-pc/frame'
import { observer } from 'mobx-react'

import Driver from './driver'
import Carrier from './carrier'

const tabs = [
  {
    text: t('司机'),
    value: '1',
    children: <Driver />,
  },
  {
    text: t('承运商'),
    value: '2',
    children: <Carrier />,
  },
]
const DriverManagement: FC = observer(() => {
  return <FullTabs defaultActive='1' tabs={tabs} />
})

export default DriverManagement
