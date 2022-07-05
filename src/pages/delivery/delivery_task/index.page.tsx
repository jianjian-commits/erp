import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { FullTabs } from '@gm-pc/frame'
import { observer } from 'mobx-react'

import OrderTaskTab from './order_task'
import DriverTask from './driver_task'

const tabs = [
  {
    text: t('订单任务列表'),
    value: '1',
    children: <OrderTaskTab />,
  },
  {
    text: t('司机任务列表'),
    value: '2',
    children: <DriverTask />,
  },
]
const DriverTaskTab: FC = observer(() => {
  return <FullTabs defaultActive='1' tabs={tabs} />
})

export default DriverTaskTab
