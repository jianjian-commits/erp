/*
 * @Description:分类销售报表
 */

import React, { useEffect } from 'react'
import { Tabs } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'

import CategoryTab from './category_tab'
import store, { CategoryReportTab } from './store'

const CategorySaleSituation = () => {
  useEffect(() => store.clear, [])
  return (
    <Tabs
      active={store.activeTab}
      onChange={store.onTabChange}
      activeOnce
      full
      tabs={[
        {
          text: t('一级分类'),
          value: CategoryReportTab.CATEGORY1,
          children: <CategoryTab category={CategoryReportTab.CATEGORY1} />,
        },
        {
          text: t('二级分类'),
          value: CategoryReportTab.CATEGORY2,
          children: <CategoryTab category={CategoryReportTab.CATEGORY2} />,
        },
      ]}
    />
  )
}

export default observer(CategorySaleSituation)
