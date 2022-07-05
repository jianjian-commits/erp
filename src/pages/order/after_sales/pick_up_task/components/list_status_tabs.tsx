import React, { FC, useMemo } from 'react'
import { FullTabsItem } from '@gm-pc/frame'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Tabs } from '@gm-pc/react'
import { ReceiptStatusAll } from '../interface'

interface ListStatusTabsProps {
  TabComponent: any
  omitTabs?: string[]
  tabData: ReceiptStatusAll<string>
  onChange: (value: keyof ReceiptStatusAll<string>) => void
  active: string
}

const ListStatusTabs: FC<ListStatusTabsProps> = observer((props) => {
  const { TabComponent, omitTabs, active, onChange, tabData } = props

  const tabsType: FullTabsItem[] = useMemo(() => {
    const all = _.map(tabData, (value, key) => {
      if (!omitTabs || !omitTabs.includes(key)) {
        return {
          text: value,
          value: key,
          children: <TabComponent key={key} />,
        }
      }
      return false
    })

    return _.filter(all, (v) => v) as FullTabsItem[]
  }, [omitTabs, tabData])

  return (
    <Tabs
      className='gm-border-top'
      light
      tabs={tabsType}
      active={active}
      onChange={onChange}
    />
  )
})

export default ListStatusTabs
