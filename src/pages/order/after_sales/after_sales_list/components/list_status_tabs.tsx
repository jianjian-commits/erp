import React, { FC, useMemo } from 'react'
import { FullTabsItem } from '@gm-pc/frame'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Tabs } from '@gm-pc/react'
import { ReceiptStatusAll } from '../interface'
import { t } from 'gm-i18n'
import { AfterSaleOrder_Status } from 'gm_api/src/aftersale'

interface ListStatusTabsProps {
  TabComponent: any
  omitTabs?: string[]
  tabData: ReceiptStatusAll<string>
  onChange: (value: AfterSaleOrder_Status) => void
  active: AfterSaleOrder_Status
}

const ListStatusTabs: FC<ListStatusTabsProps> = observer((props) => {
  const { TabComponent, omitTabs, active, onChange, tabData } = props

  const tabList = [
    {
      text: t('全部'),
      value: AfterSaleOrder_Status.STATUS_UNSPECIFIED,
      children: <TabComponent key={AfterSaleOrder_Status.STATUS_UNSPECIFIED} />,
    },
    {
      text: t('待提交'),
      value: AfterSaleOrder_Status.STATUS_TO_SUBMIT,
      children: <TabComponent key={AfterSaleOrder_Status.STATUS_TO_SUBMIT} />,
    },
    {
      text: t('待审核'),
      value: AfterSaleOrder_Status.STATUS_TO_REVIEWED,
      children: <TabComponent key={AfterSaleOrder_Status.STATUS_TO_REVIEWED} />,
    },
    {
      text: t('待退货'),
      value: AfterSaleOrder_Status.STATUS_TO_RETURNED,
      children: <TabComponent key={AfterSaleOrder_Status.STATUS_TO_RETURNED} />,
    },
    {
      text: t('待退款'),
      value: AfterSaleOrder_Status.STATUS_TO_REFUND,
      children: <TabComponent key={AfterSaleOrder_Status.STATUS_TO_REFUND} />,
    },
    {
      text: t('已退款'),
      value: AfterSaleOrder_Status.STATUS_REFUNDED,
      children: <TabComponent key={AfterSaleOrder_Status.STATUS_REFUNDED} />,
    },
  ]

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
      tabs={tabList}
      active={active}
      onChange={onChange}
    />
  )
})

export default ListStatusTabs
