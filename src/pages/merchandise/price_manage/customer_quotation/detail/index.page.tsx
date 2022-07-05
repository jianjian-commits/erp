import React, { useEffect, useState } from 'react'
import { Tabs, PageHeader, Tag, Space, Row } from 'antd'
import { t } from 'gm-i18n'
import Cycle from './cycle'
import Product from './product'
import Other from './other'
import Client from './client'
import PirceCombine from './combine'
import './style.less'
import ButtonGroup from './button_group'
import { useGMLocation } from '@gm-common/router'
import store from './store'
import productStore from './product/store'
import { observer } from 'mobx-react'
import Log from '@/pages/merchandise/components/log'
import { Quotation_Type } from 'gm_api/src/merchandise'
import QuotationStatusTag from '@/pages/merchandise/price_manage/customer_quotation/components/quotation_status_tag'

const { TabPane } = Tabs

const tabBarStyle = { paddingLeft: '18px' }

/** 报价单详情 */
const Detail = observer(() => {
  const location = useGMLocation<{ quotation_id: string; type: string }>()
  const { quotation_id, type } = location.query
  const quotationType = Number(type)
  /** 是否为周期报价单 */
  const isPeriodic = quotationType === Quotation_Type.PERIODIC

  const {
    loading,
    childCount,
    merchandiseCount,
    combineCount,
    clientCount,
    setQuotationId,
    setParentQuotationId,
    setType,
  } = store
  const quotation = isPeriodic ? store.parentQuotation : store.quotation

  const [activeKey, setActiveKey] = useState('1')

  useEffect(() => {
    setActiveKey(isPeriodic ? '0' : '1')
    setType(Number(type))
    if (isPeriodic) {
      setParentQuotationId(quotation_id)
    } else {
      setQuotationId(quotation_id)
      productStore.fetchList(quotation_id)
    }
  }, [store.quotation_id, type])

  useEffect(() => {
    store.getQuotation(quotation_id)
  }, [activeKey])

  const tabs = [
    {
      title: t('报价周期') + `（${childCount}）`,
      component: <Cycle quotation_id={quotation_id} />,
      key: '0',
      hide: type === '1',
    },
    {
      title: t('商品') + `（${merchandiseCount}）`,
      component: <Product quotation_id={quotation_id} type={1} />,
      key: '1',
      hide: type === '6',
    },
    {
      title: t('组合商品') + `（${combineCount}）`,
      component: <PirceCombine quotation_id={quotation_id} type={1} />,
      key: '2',
      hide: type === '6',
    },
    {
      title: t('客户') + `（${clientCount}）`,
      component: <Client />,
      key: '3',
    },
    { title: t('其他'), component: <Other />, key: '4' },
    {
      title: t('操作日志'),
      component: (
        <div style={{ marginTop: -16 }}>
          <Log type='quotation' modelId={[quotation_id]} />
        </div>
      ),
      key: '5',
    },
  ].filter((f) => !f.hide)

  const title = () => {
    const { inner_name, status } = quotation
    return (
      <Row align='middle'>
        <span className='page-title'>{inner_name || t('暂无')}</span>
        <QuotationStatusTag status={status || 0} />
      </Row>
    )
  }

  return (
    <>
      <PageHeader
        title={title()}
        extra={!loading && <ButtonGroup quotation={quotation} />}
      />
      <Tabs
        className='quotation-detail-tabs-wrapper'
        activeKey={activeKey}
        destroyInactiveTabPane
        onChange={setActiveKey}
        tabBarStyle={tabBarStyle}
        tabBarGutter={66}
      >
        {tabs.map((item) => (
          <TabPane tab={item.title} key={item.key}>
            {item.component}
          </TabPane>
        ))}
      </Tabs>
    </>
  )
})

export default Detail
