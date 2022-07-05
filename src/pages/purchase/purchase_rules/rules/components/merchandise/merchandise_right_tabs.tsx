import React, { useMemo, useState } from 'react'
import { Tabs, Input, message } from 'antd'
import { t } from 'gm-i18n'
import SVGRules from '@/svg/rules_search.svg'
import _ from 'lodash'
import Purchase from './purchase'
import Supplier from './supplier'
import Grade from './grade'
import OverView from './overview'
import { Flex } from '@gm-pc/react'
import { PlusCircleOutlined } from '@ant-design/icons'
import CreateStore from '../create/store'
import BatchMerchandiseAdd from '../create/merchandise/batch_merchandise_add'
import store from '../../store'
import { observer } from 'mobx-react'
import { Sku } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
const { TabPane } = Tabs
const tabsContent = [
  {
    name: t('总览'),
    key: 'overview',
    components: <OverView />,
  },
  {
    name: t('供应商'),
    key: 'supplier',
    components: <Supplier />,
  },
  {
    name: t('采购员'),
    key: 'purchase',
    components: <Purchase />,
  },
  {
    name: t('商品等级'),
    key: 'grade',
    components: <Grade />,
  },
]
const MerchandiseRightTabs = () => {
  const { setType, setSelectedRow, setSelectedRowKeys } = CreateStore
  const {
    chooseSku,
    setMerchandiseTabs,
    merchandiseTabsFilter,
    merchandiseKey,
    setMerchandiseKey,
    setChoose,
  } = store
  const [visible, setVisible] = useState<boolean>(false)

  const callback = (key: string) => {
    if (!chooseSku?.sku_id) {
      message.error(t('请先选择商品!'))
      return
    }
    setMerchandiseKey(key)
    setChoose({ type: 'merchandise', item: chooseSku })
  }

  // 搜搜
  const handleSearch = useMemo(() => {
    return _.debounce((chooseSku: Partial<Sku>) => {
      setChoose({ type: 'merchandise', item: chooseSku })
    }, 500)
  }, [])

  // 点击添加客户
  const handleAdd = () => {
    setType('add')
    setSelectedRow([chooseSku] as Sku[], 'merchandise')
    const keys = [chooseSku?.sku_id!]
    setSelectedRowKeys(keys as React.Key[], 'merchandise')
    setVisible(true)
  }

  // 右边上的东西
  const ExtraContent = () => {
    return (
      <>
        {merchandiseKey === 'overview' && (
          <Input
            onChange={(e) => {
              if (!chooseSku.sku_id) {
                message.destroy()
                message.error(t('请先选择商品'))
                return
              }
              setMerchandiseTabs('customer_name', e.target.value)
              handleSearch(chooseSku)
            }}
            allowClear
            value={merchandiseTabsFilter.customer_name}
            placeholder={t('输入客户名称')}
            suffix={<SVGRules style={{ fontSize: '18px' }} />}
          />
        )}
        {merchandiseKey === 'supplier' && (
          <Input
            onChange={(e) => {
              if (!chooseSku.sku_id) {
                message.destroy()
                message.error(t('请先选择商品'))
                return
              }
              setMerchandiseTabs('supplier_name', e.target.value)
              handleSearch(chooseSku)
            }}
            allowClear
            value={merchandiseTabsFilter.supplier_name}
            placeholder={t('输入供应商')}
            suffix={<SVGRules style={{ fontSize: '18px' }} />}
          />
        )}
        {merchandiseKey === 'purchase' && (
          <Input
            onChange={(e) => {
              if (!chooseSku.sku_id) {
                message.destroy()
                message.error(t('请先选择商品'))
                return
              }
              setMerchandiseTabs('purchaser_name', e.target.value)
              handleSearch(chooseSku)
            }}
            allowClear
            value={merchandiseTabsFilter.purchaser_name}
            placeholder={t('输入采购员')}
            suffix={<SVGRules style={{ fontSize: '18px' }} />}
          />
        )}
        {/* {key === 'grade' && (
          <Input
            onChange={(e) => handleSearch(e.target.value, 'gradeName')}
            value={merchandiseTabsFilter.gradeName}
            placeholder={t('输入商品等级')}
            suffix={<SVGRules style={{ fontSize: '18px' }} />}
          />
        )} */}
      </>
    )
  }

  return (
    <div className='tw-h-full'>
      <Tabs
        defaultActiveKey={merchandiseKey}
        tabBarGutter={5}
        tabBarStyle={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}
        onChange={callback}
        tabBarExtraContent={ExtraContent()}
        activeKey={merchandiseKey}
        type='card'
        className='rules-list-right-tabs'
      >
        {_.map(tabsContent, (item) => (
          <TabPane tab={item.name} key={item.key}>
            <div className='rules-list-right-tabs-tables'>
              {item.components}
              {item.key === 'overview' &&
                chooseSku?.sku_id &&
                globalStore.hasPermission(
                  Permission.PERMISSION_PURCHASE_CREATE_PURCHASE_TASK_RULE,
                ) && (
                  <Flex
                    className='tw-w-full tw-mt-1 tw-pt-1 tw-box-border tw-cursor-pointer'
                    style={{
                      color: '#176CFE',
                      position: 'sticky',
                      bottom: 0,
                      background: '#fff',
                    }}
                    alignCenter
                    onClick={handleAdd}
                  >
                    <PlusCircleOutlined className='tw-mr-1' />
                    {t('增加其他客户规则')}
                  </Flex>
                )}
            </div>
          </TabPane>
        ))}
      </Tabs>

      {visible && (
        <BatchMerchandiseAdd
          visible={visible}
          handleVisible={() => setVisible(false)}
        />
      )}
    </div>
  )
}
export default observer(MerchandiseRightTabs)
