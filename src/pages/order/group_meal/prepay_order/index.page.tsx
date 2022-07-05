import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import './style.less'
import { Button } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import CategoryFilterFrame from '@/common/components/category_filter_frame'
import store from './store'
import { Cycle } from 'gm_api/src/eshop'

const prepayOrder = observer(() => {
  const { setFilter, updateFilter } = store
  useEffect(() => {
    store.getCurstomerList()
    return () => {
      store.init()
    }
  }, [])
  const handleSearch = () => {
    updateFilter()
  }

  const handleExport = () => {
    store.exportList()
  }

  const handleFilterValue = (value: any) => {
    if (value.cycle) {
      if (value.cycle === 'week') {
        setFilter('cycle', Cycle.CYCLE_WEEKLY)
      } else if (value.cycle === 'month') {
        setFilter('cycle', Cycle.CYCLE_MONTHLY)
      } else {
        setFilter('cycle', Cycle.CYCLE_SEMESTER)
      }
      setFilter('meal_date_start', '')
      setFilter('meal_date_end', '')
    }

    if (value.category_ids) {
      setFilter('school_id', value.category_ids[0] || '0')
      setFilter('class_id', value.category_ids[1] || '0')
    }

    if (value.states || value.states === 0) {
      setFilter('states', [value.states] as string[])
    }
    updateFilter()
  }
  return (
    <div className='prepay_order'>
      <CategoryFilterFrame
        treeData={store.customers}
        defaultAllClassifyTitle={t('全部学校')}
        table={<List />}
        filterNode={<Filter />}
        extraRight={
          <>
            <Button type='primary' onClick={handleSearch}>
              {t('搜索')}
            </Button>
            <Button onClick={handleExport}>{t('导出')}</Button>
          </>
        }
        onFilterChange={(value) => handleFilterValue(value)}
      />
    </div>
  )
})
export default prepayOrder
