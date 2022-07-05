import React, { useEffect, useMemo, useState } from 'react'
import { gmHistory } from '@gm-common/router'
import Header from './header'
import { Tabs } from 'antd'
import { t } from 'gm-i18n'
import ExportAction from './export_action'
import { Button } from '@gm-pc/react'
import { observer } from 'mobx-react'

import store from './store'
import OrderSummary from './order_tab'
import ProductSummary from './product_tab'
import OrderTypeSummary from './order_type_tab'
import useDetailRouterParams from './hooks/use_detail_router_params'
import ExportFieldsEdit from './export_fields_edit'
import exportBillOrder from './service/export_bill_order'
import PrintTemplate from './print_template'

import './index.less'
import { OrderExportSettings_Type } from 'gm_api/src/preference'
import globalStore from '@/stores/global'
import { useBoolean } from '@/common/hooks'

const CustomerBillDetail: React.VFC = observer(() => {
  const { beginMoment, endMoment, customerId, timeFilter } =
    useDetailRouterParams()
  const invalidSearchParams =
    !customerId || !beginMoment.isValid() || !endMoment.isValid()

  const billingDate = useMemo(() => {
    if (invalidSearchParams) {
      return ''
    }
    return `${beginMoment.format('YYYY-MM-DD')} ~ ${endMoment.format(
      'YYYY-MM-DD',
    )}`
  }, [invalidSearchParams, beginMoment, endMoment])

  // 请求 header 数据
  useEffect(() => {
    if (invalidSearchParams) {
      return
    }
    store.getBillInfo({ ...timeFilter, customerId })
  }, [customerId, invalidSearchParams, timeFilter])

  // 清理 store
  useEffect(() => store.clear, [])

  // 路由参数无效，返回列表页
  useEffect(() => {
    if (invalidSearchParams) {
      gmHistory.replace('/financial_manage/settlement_manage/customer_bill')
    }
  }, [invalidSearchParams])

  const [visibleExportFieldsEdit, setVisibleExportFieldsEdit] = useState(false)
  const {
    state: visiblePrintTemplate,
    setFalse: closePrintTemplate,
    setTrue: openPrintTemplate,
  } = useBoolean(false)

  const onExportBillOrder = async (type: OrderExportSettings_Type) => {
    try {
      await exportBillOrder({ customerId: customerId!, timeFilter, type })
      globalStore.showTaskPanel('0')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  if (invalidSearchParams) {
    return <></>
  }

  return (
    <>
      <Header
        amountPayable={store.billInfo.amountPayable}
        amountPaid={store.billInfo.amountPaid}
        outstandingAmount={store.billInfo.outstandingAmount}
        amountAfterSale={store.billInfo.amountAfterSale}
        amountToBeSettled={store.billInfo.amountToBeSettled}
        customerName={store.billInfo.customerName}
        billingDate={billingDate}
      >
        <Button className='gm-margin-right-10' onClick={openPrintTemplate}>
          打印
        </Button>
        <ExportAction
          onEditFields={() => setVisibleExportFieldsEdit(true)}
          onExportBillDetail={() =>
            onExportBillOrder(OrderExportSettings_Type.TYPE_BILL_DETAIL)
          }
          onExportOrderDetail={() =>
            onExportBillOrder(OrderExportSettings_Type.TYPE_ORDER_DETAIL)
          }
          onExportOrderTypeSummary={() =>
            onExportBillOrder(OrderExportSettings_Type.TYPE_CUSTOMIZE_SUMMARY)
          }
          onExportProductSummary={() =>
            onExportBillOrder(OrderExportSettings_Type.TYPE_SKU_SUMMARY)
          }
        />
      </Header>

      <Tabs
        className='customer_bill_detail_tabs'
        size='small'
        destroyInactiveTabPane
      >
        <Tabs.TabPane tab={t('按订单汇总')} key='1'>
          <OrderSummary customerId={customerId} timeFilter={timeFilter} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('按商品汇总')} key='2'>
          <ProductSummary customerId={customerId} timeFilter={timeFilter} />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('按订单类型汇总')} key='3'>
          <OrderTypeSummary customerId={customerId} timeFilter={timeFilter} />
        </Tabs.TabPane>
      </Tabs>
      <ExportFieldsEdit
        visible={visibleExportFieldsEdit}
        onClose={setVisibleExportFieldsEdit}
      />
      <PrintTemplate
        visible={visiblePrintTemplate}
        customerId={customerId}
        timeFilter={timeFilter}
        onClose={closePrintTemplate}
      />
    </>
  )
})

CustomerBillDetail.displayName = 'CustomerBillDetail'

export default CustomerBillDetail
