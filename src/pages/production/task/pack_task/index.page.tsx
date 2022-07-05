import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { ProduceType, Task_Type } from 'gm_api/src/production'

import FullTab from '../components/full_tab'

const PackTask: FC = observer(() => {
  return (
    <FullTab
      taskType={Task_Type.TYPE_PACK}
      produceType={ProduceType.PRODUCE_TYPE_PACK}
    />
  )
})

export default PackTask
