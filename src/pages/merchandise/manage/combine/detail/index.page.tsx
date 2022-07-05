import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Tabs, PageHeader, Tag } from 'antd'
import MerchandiseInfo from './intro/detail_merchandise_info'
import DetailQuotaionTable from './quotation/index'
import { useGMLocation } from '@gm-common/router'
import store from '@/pages/merchandise/manage/combine/detail/store'
import '../style.less'
import Log from '@/pages/merchandise/components/log'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import _ from 'lodash'
const { TabPane } = Tabs
const Detail = observer(() => {
  const location = useGMLocation<{ sku_id: string }>()
  const { sku_id } = location.query
  const { sku, quotationCount, clearStore } = store

  useEffect(() => {
    return () => {
      clearStore()
    }
  }, [])

  const title = (
    <>
      <span style={{ display: 'inline-block' }}>
        {t(sku.name) || t('暂无')}
      </span>
      <Tag
        color={sku.on_sale ? '#87d068' : '#eee'}
        style={{ display: 'inline-block', margin: '0 0 6px 6px' }}
      >
        {sku.on_sale ? t('在售') : t('停售')}
      </Tag>
    </>
  )

  const tabList = [
    {
      tab: '商品介绍',
      key: '1',
      child: <MerchandiseInfo />,
    },
    {
      tab: t(`报价单（${quotationCount}）`),
      key: '2',
      child: <DetailQuotaionTable sku_id={sku_id} />,
      hide: !globalStore.hasPermission(
        Permission.PERMISSION_MERCHANDISE_VIEW_QUOTATION,
      ),
    },
    {
      tab: t('操作日志'),
      key: '3',
      child: <Log type='combine' modelId={sku_id} />,
    },
  ].filter((f) => !f.hide)

  return (
    <>
      <PageHeader title={title} />
      <div className='gm-site-card-border-less-wrapper-126 tw-box-border gm-detail-min-height'>
        <Tabs
          destroyInactiveTabPane
          defaultActiveKey='1'
          tabBarStyle={{ padding: '0 22px', margin: '0' }}
          tabBarGutter={66}
        >
          {_.map(tabList, (item) => {
            return (
              <TabPane tab={t(`${item.tab}`)} key={item.key}>
                {item.child}
              </TabPane>
            )
          })}
        </Tabs>
      </div>
    </>
  )
})
export default Detail
