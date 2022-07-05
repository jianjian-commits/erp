// import CategoryFilter from '@/common/components/category_filter_hoc'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import {
  BoxForm,
  BoxFormMore,
  Button,
  FormBlock,
  FormButton,
  FormItem,
  MoreSelectDataItem,
  Select,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import { MoreSelect_QuotationV2 } from '@/common/components'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import SearchFilter, { SearchType } from '../components/searh_filter'
import {
  ORDER_PRINT_STATUS,
  SORTING_STATUS_LIST,
  SORT_STATUS_ORDER,
} from './enum'
import { Filter } from './interface'
import sortingDetailStore from './store'
import globalStore from '@/stores/global'
// import CategoryFilter from '@/common/components/category_filter'
import CategoryFilter from '@/pages/order/order_manage/list/view_sku/components/categoryFilter'

interface FilterProps {
  onSearch: () => void
}

const dateFilterData = [
  {
    type: 1,
    name: '按下单日期',
    expand: false,
  },
  {
    type: 2,
    name: '按收货日期',
    expand: false,
  },
]

/**
 * 分拣订单搜索框的组件函数，用于展示分拣订单的搜索框
 */
const SortingOrderFilter: FC<FilterProps> = ({ onSearch }) => {
  useEffect(() => {
    sortingDetailStore.fetchCategory()
  }, [])

  const handleFilterChange = (
    name: keyof Filter,
    value: any,
    type?: SearchType,
  ) => {
    sortingDetailStore.setFilter(name, value)
    if (type) {
      sortingDetailStore.setFilter('search_type', type)
    }
  }

  /**
   * 点击搜索按钮后触发的事件，搜索分拣订单
   */
  const handleSearch = () => {
    onSearch()
  }

  /**
   * 日期改变后触发的事件
   * @param {Object} value 改变后的日期
   */
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      handleFilterChange('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      handleFilterChange('begin_time', value.begin)
      handleFilterChange('end_time', value.end)
    }
  }

  // 展开
  const { filter } = sortingDetailStore
  const {
    begin_time,
    end_time,
    time_type,
    search_type,
    serial_no,
    customer_info,
    ssu_info,
    status,
    category,
    quotation_ids,
    route_selected,

    sort_status,
    print_status,
  } = filter

  const handleExport = () => {
    sortingDetailStore.exportSortingSheet().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }
  return (
    <BoxForm
      labelWidth='90px'
      btnPosition='left'
      colWidth='385px'
      onSubmit={handleSearch}
    >
      <FormBlock col={3}>
        <DateRangeFilter
          data={dateFilterData}
          value={{
            begin: begin_time,
            end: end_time,
            dateType: time_type,
          }}
          onChange={handleDateChange}
          enabledTimeSelect
        />
        <SearchFilter
          value={
            search_type === SearchType.SERIAL_NO
              ? serial_no
              : search_type === SearchType.CUSTOMER_INFO
              ? customer_info
              : ssu_info
          }
          onChange={handleFilterChange}
        />
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem col={1} label={t('商品分类')}>
            <CategoryFilter
              selected={category}
              cascaderOptions={sortingDetailStore.categoryData}
              onChange={(v) => handleFilterChange('category', v)}
            />
          </FormItem>
          <FormItem label={t('线路筛选')}>
            <MoreSelect_Route
              multiple
              selected={route_selected}
              renderListFilterType='pinyin'
              onSelect={(value: MoreSelectDataItem<string>[]) =>
                handleFilterChange('route_selected', value)
              }
              getName={(item) => item.route_name}
            />
          </FormItem>
          <FormItem label={t('报价单')}>
            <MoreSelect_QuotationV2
              multiple
              selected={quotation_ids}
              onSelect={(select: MoreSelectDataItem<string>[]) =>
                handleFilterChange('quotation_ids', select)
              }
              renderListFilterType='pinyin'
              getName={(item: any) => item.inner_name}
            />
          </FormItem>
          <FormItem label={t('订单状态')}>
            <Select
              all={{ value: 0 }}
              data={SORTING_STATUS_LIST}
              onChange={(status) => handleFilterChange('status', status)}
              value={status}
            />
          </FormItem>
          <FormItem label={t('分拣状态')}>
            <Select
              all={{ value: 0 }}
              data={SORT_STATUS_ORDER}
              onChange={(value) => {
                handleFilterChange('sort_status', value)
              }}
              value={sort_status}
            />
          </FormItem>
          <FormItem label={t('订单打印状态')}>
            <Select
              data={ORDER_PRINT_STATUS}
              value={print_status}
              onChange={(value) => handleFilterChange('print_status', value)}
              style={{ minWidth: '120px' }}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button className='gm-margin-right-10' type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <Button onClick={handleExport}>{t('导出')}</Button>
        <BoxFormMore>
          <div className='gm-gap-10' />
          <Button onClick={() => sortingDetailStore.reset()}>
            {t('重置')}
          </Button>
        </BoxFormMore>
      </FormButton>
    </BoxForm>
  )
}

export default observer(SortingOrderFilter)
