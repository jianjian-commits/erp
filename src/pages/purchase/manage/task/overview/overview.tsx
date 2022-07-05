import { t } from 'gm-i18n'
import React, { FC, useState, useMemo } from 'react'
import { Flex, Tabs, MoreSelectDataItem } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from '../store'
import purchaseStore from '../../../store'

type TabKey = string

interface TaskProps {
  tabKey?: TabKey
}

const OverView: FC<TaskProps> = (props) => {
  const [tab, setTab] = useState<string>(props.tabKey || '0')
  const { summary } = store

  function handleChangeTab(value: string) {
    setTab(value)
  }

  function handleSearchChange(
    type: 'suppliers' | 'purchaser_id',
    value?: MoreSelectDataItem<string>[] | string,
  ) {
    store.initSummaryFilter()
    value && store.updateFilter(type, value)
    store.doRequest()
  }

  const renderSupplier = useMemo(() => {
    return _.map(summary.supplier_map || {}, (v, key) => {
      const supplier = purchaseStore.suppliersMap[key]
      if (!supplier) return null
      return (
        <Flex
          column
          key={key}
          onClick={handleSearchChange.bind(undefined, 'suppliers', [supplier])}
          className='gm-padding-10 gm-border-bottom gm-bg-hover-focus-primary gm-cursor'
        >
          <Flex>{supplier?.text}</Flex>
          <Flex className='gm-padding-top-10'>
            菜品： {_.keys(v.sku_count).length}种
          </Flex>
        </Flex>
      )
    })
  }, [summary.supplier_map])

  const renderPurchaser = useMemo(() => {
    return _.map(summary.purchaser_map || {}, (v, key) => {
      const purchaser = purchaseStore.purchasersMap[key]
      if (!purchaser) return null
      return (
        <Flex
          column
          key={key}
          onClick={handleSearchChange.bind(
            undefined,
            'purchaser_id',
            purchaser.value,
          )}
          className='gm-padding-10 gm-border-bottom gm-bg-hover-focus-primary gm-cursor'
        >
          <Flex>{purchaser?.text}</Flex>
          <Flex className='gm-padding-top-10'>
            菜品： {_.keys(v.sku_count).length}种
          </Flex>
        </Flex>
      )
    })
  }, [summary.purchaser_map])

  return (
    <Flex column className='b-task-list'>
      <Flex flex column className='gm-overflow-hidden b-task-content'>
        <Tabs
          active={tab}
          tabs={[
            {
              text: t('供应商'),
              value: '0',
              children: (
                <div className='gm-border-top-0'>
                  <Flex flex column className='gm-padding-15'>
                    <Flex
                      alignStart
                      onClick={handleSearchChange.bind(
                        undefined,
                        'suppliers',
                        undefined,
                      )}
                      className='gm-padding-10 gm-border-bottom gm-bg-hover-focus-primary gm-cursor'
                    >
                      <Flex>{t('全部供应商')}</Flex>
                    </Flex>
                    {renderSupplier}
                  </Flex>
                </div>
              ),
            },
            {
              text: t('采购员'),
              value: '1',
              children: (
                <div className='gm-border-top-0'>
                  <Flex flex column className='gm-padding-15'>
                    <Flex
                      alignStart
                      onClick={handleSearchChange.bind(
                        undefined,
                        'purchaser_id',
                        undefined,
                      )}
                      className='gm-padding-10 gm-border-bottom gm-bg-hover-focus-primary gm-cursor'
                    >
                      <Flex>{t('全部采购员')}</Flex>
                    </Flex>
                    {renderPurchaser}
                  </Flex>
                </div>
              ),
            },
          ]}
          onChange={handleChangeTab}
        />
      </Flex>
    </Flex>
  )
}

export default observer(OverView)
