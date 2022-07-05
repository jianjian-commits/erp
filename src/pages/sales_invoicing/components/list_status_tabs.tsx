import React, { FC, useMemo } from 'react'
import { FullTabsItem } from '@gm-pc/frame'

import _ from 'lodash'

import { observer } from 'mobx-react'
import { ReceiptStatusAll } from '../interface'
import { Tabs } from '@gm-pc/react'

interface ListStatusTabsProps {
  tabComponent: React.ReactElement
  omitTabs?: string[]
  tabData: ReceiptStatusAll<string>
  onChange: (value: keyof ReceiptStatusAll<string>) => void
  active: string
}

const ListStatusTabs: FC<ListStatusTabsProps> = observer((props) => {
  const { tabComponent, omitTabs, active, onChange, tabData } = props

  const tabsType: FullTabsItem[] = useMemo(() => {
    const all = _.map(tabData, (value, key) => {
      if (!omitTabs || !omitTabs.includes(key)) {
        return {
          text: value,
          value: key,
          children: tabComponent,
        }
      }
      return false
    })

    return _.filter(all, (v) => v) as FullTabsItem[]
  }, [omitTabs, tabData, tabComponent])

  return (
    <Tabs
      light
      className='gm-border-top'
      tabs={tabsType}
      active={active}
      onChange={onChange}
    />
  )
})

export default ListStatusTabs
