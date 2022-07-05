import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { PageHeader, Tag, Tabs } from 'antd'
import _ from 'lodash'
import PriceSheet from '@/pages/merchandise/manage/merchandise_list/detail/price_sheet'
import MerchandiseBom from '@/pages/merchandise/manage/merchandise_list/detail/merchandise_bom'
import MerchandiseCombine from '@/pages/merchandise/manage/merchandise_list/detail/merchandise_combine'
import MerchandiseIntro from '@/pages/merchandise/manage/merchandise_list/detail/merchandise_intro'
import { useGMLocation } from '@gm-common/router'
import { t } from 'gm-i18n'
import store from './store'
import './style.less'
import globalStore from '@/stores/global'
import bomStore from './merchandise_bom/store'
import Log from '@/pages/merchandise/components/log'
import { Permission } from 'gm_api/src/enterprise'

const { TabPane } = Tabs

const MerchandiseDetail: FC = observer(() => {
  const location = useGMLocation<{ sku_id: string }>()
  const { sku_id } = location.query
  const {
    sku,
    getMerchandiseInfo,
    clearData,
    combineIdList,
    quotationCount,
    bomCount,
  } = store

  const [tabId, setTabId] = useState<string>('0')

  const onTabChange = (key: string) => {
    setTabId(key)
  }

  useEffect(() => {
    getMerchandiseInfo(sku_id)
    bomStore.getBomList()
    return () => {
      clearData()
    }
  }, [])

  const tabList = [
    {
      tab: '商品介绍',
      key: '0',
      child: <MerchandiseIntro sku_id={sku_id} />,
    },
    {
      tab: '报价单',
      key: '2',
      count: `（${quotationCount}）`,
      child: <PriceSheet />,
      hide:
        globalStore.isLite ||
        !globalStore.hasPermission(
          Permission.PERMISSION_MERCHANDISE_VIEW_QUOTATION,
        ),
    },
    {
      tab: '组合商品',
      key: '3',
      count: `（${combineIdList.length}）`,
      child: <MerchandiseCombine />,
      hide: globalStore.isLite,
    },
    {
      tab: '商品Bom',
      key: '4',
      count: `（${bomCount}）`,
      child: <MerchandiseBom />,
      hide: globalStore.isLite,
    },
    {
      tab: '操作日志',
      key: '5',
      child: <Log type='merchandise' modelId={sku_id} />,
      hide: globalStore.isLite,
    },
  ].filter((f) => !f.hide)

  const title = (
    <span className='page-title'>
      <span>{t(sku.name) || t('暂无')}</span>
      <Tag color={sku.on_sale ? '#87d068' : '#ccc'} className='page-tag'>
        {sku.on_sale ? t('在售') : t('停售')}
      </Tag>
    </span>
  )

  return (
    <>
      <PageHeader title={title} />

      <div className='gm-site-card-border-less-wrapper-126'>
        <Tabs
          tabBarStyle={{ padding: '0 22px', margin: '0' }}
          destroyInactiveTabPane
          activeKey={tabId}
          onChange={onTabChange}
          tabBarGutter={66}
        >
          {_.map(tabList, (item) => {
            return (
              <TabPane
                tab={t(`${item.tab}${item.count ? item.count : ''}`)}
                key={item.key}
              >
                {item.child}
              </TabPane>
            )
          })}
        </Tabs>
      </div>
    </>
  )
})

export default MerchandiseDetail
