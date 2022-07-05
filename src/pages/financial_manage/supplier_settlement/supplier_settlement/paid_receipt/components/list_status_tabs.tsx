import React, { PropsWithChildren, ReactElement, useMemo } from 'react'
import { FullTabsItem } from '@gm-pc/frame'
import { observer } from 'mobx-react'
import { Tabs } from '@gm-pc/react'

interface ListStatusTabsProps<T extends any> {
  tabComponent: React.ReactElement
  omitTabs?: T[]
  tabData: { text: string; value: T }[]
  onChange: (value: T) => void
  active: T
}

function ListStatusTabs<T extends any>(
  props: PropsWithChildren<ListStatusTabsProps<T>>,
): ReactElement<any, any> | null {
  const { tabComponent, omitTabs, active, onChange, tabData, ...rest } = props

  const tabsType: FullTabsItem[] = useMemo(() => {
    const all = []
    for (const data of tabData) {
      if (!omitTabs || !omitTabs.includes(data.value)) {
        all.push({
          text: data.text,
          value: data.value,
          children: tabComponent,
        })
      }
    }
    return all as FullTabsItem[]
  }, [omitTabs, tabData, tabComponent])

  return (
    <Tabs
      {...rest}
      light
      tabs={tabsType}
      className='gm-border-top'
      active={active as string}
      onChange={(value) => onChange(value as T)}
    />
  )
}

export default observer(ListStatusTabs)
