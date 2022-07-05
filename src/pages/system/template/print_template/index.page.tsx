import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Tabs } from 'antd'
import DeliveryTemplate from './delivery_template'
import PurchaseTaskTemplate from './purchase_task_template'
import PurchaseBillTemplate from './purchase_bill_template'
import InnerLabelTemplate from './inner_label_template'
import SortingLabelTemplate from './sorting_label_template'
import StockInTemplate from './stock_in_template'
import StockOutTemplate from './stock_out_template'
import SupplierSettleTemplate from './supplier_settle_template'
import CannibalizeTemplate from './cannibalize_template'
import ProductionTemplate from './production_template'
import globalStore from '@/stores/global'
import MaterialRequisitionTemplate from './material_requisition_template'
import SalemenusTemplate from '@/pages/system/template/print_template/salemenus_template'
import CustomerBillTemplate from './customer_bill_template'

const { TabPane } = Tabs

const Templates = () => {
  const active = localStorage.getItem('gmPrintTemplateTabValue')

  const handleTabChange = (tabValue: string) => {
    localStorage.setItem('gmPrintTemplateTabValue', tabValue)
  }

  const tabs = [
    {
      title: t('配送模板'),
      key: 'DeliveryTemplate',
      content: <DeliveryTemplate />,
    },
    {
      title: t('采购计划模板'),
      key: 'PurchaseTaskTemplate',
      content: <PurchaseTaskTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('采购单据模板'),
      key: 'PurchaseBillTemplate',
      content: <PurchaseBillTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('内标模板'),
      key: 'InnerLabelTemplate',
      content: <InnerLabelTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('分拣标签'),
      key: 'SortingLabelTemplate',
      content: <SortingLabelTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('入库单据模板'),
      key: 'StockInTemplate',
      content: <StockInTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('出库单据模板'),
      key: 'StockOutTemplate',
      content: <StockOutTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('供应商结款模板'),
      key: 'SupplierSettleTemplate',
      content: <SupplierSettleTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('移库单据模板'),
      key: 'CannibalizeTemplate',
      content: <CannibalizeTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('生产单据模板'),
      key: 'ProductionTemplate',
      content: <ProductionTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('领料单据模板'),
      key: 'MaterialRequisitionTemplate',
      content: <MaterialRequisitionTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('报价单模板'),
      key: 'QuotationTemplate',
      content: <SalemenusTemplate />,
      hide: globalStore.isLite,
    },
    {
      title: t('账单模板'),
      key: 'CustomerBillTemplate',
      content: <CustomerBillTemplate />,
      hide: globalStore.isLite,
    },
  ]

  const defaultTab = _.find(tabs, (v) => v.key === active) || tabs[0]
  return (
    <>
      <Tabs
        className='tw-box-border'
        onChange={handleTabChange}
        tabBarStyle={{ paddingLeft: '25px' }}
        defaultActiveKey={defaultTab.key}
      >
        {tabs.map((item) => {
          if (item.hide) return null
          return (
            <TabPane tab={item.title} key={item.key}>
              {item.content}
            </TabPane>
          )
        })}
      </Tabs>
    </>
  )
}
// <FullTabs
//   tabs={tabs}
//   onChange={handleTabChange}
//   defaultActive={defaultTab.value}
// />
export default Templates
