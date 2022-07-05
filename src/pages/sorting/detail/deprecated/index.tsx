/**
 *
 *  做完后不要了 - -+，后续不知道还要不要，不想删
 *
 */

import { t } from 'gm-i18n'
import React, { useState } from 'react'
import { useGMLocation } from '@gm-common/router'
import { FullTabs } from '@gm-pc/frame'
import SortingOrder from './order'
import SortingMerchandise from './merchandise'

export enum Tab {
  MERCHANDISE = 'merchandise',
  ORDER = 'order',
}

const SortingDetail = () => {
  const location = useGMLocation<{
    tab: Tab
  }>()
  const [active, setActive] = useState<Tab>(
    location.query.tab || Tab.MERCHANDISE,
  )

  // const canExportPackage = globalStore.hasPermission('export_package')
  return (
    <FullTabs
      active={active}
      onChange={(tab: Tab) => setActive(tab)}
      tabs={[
        {
          text: t('按商品分拣'),
          value: Tab.MERCHANDISE,
          children: <SortingMerchandise />,
        },
        {
          text: t('按订单分拣'),
          value: Tab.ORDER,
          children: <SortingOrder />,
        },
      ]}
    />
  )
}

export default SortingDetail
