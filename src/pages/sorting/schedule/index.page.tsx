import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import { FullTabs } from '@gm-pc/frame'
import Process from './sorter_process'
import { useGMLocation } from '@gm-common/router'
import { Tab, SaleListLocationQuery } from './interface'

const SaleList: FC = () => {
  const location = useGMLocation<SaleListLocationQuery>()
  const [active, setActive] = useState<Tab>(location.query.tab || Tab.SCHEDULE)

  return (
    <FullTabs
      active={active}
      onChange={(tab: Tab) => setActive(tab)}
      tabs={[
        {
          text: t('分拣进度'),
          value: Tab.SCHEDULE,
          children: <Process />,
        },
      ]}
      className='b-order'
    />
  )
}

export default SaleList
