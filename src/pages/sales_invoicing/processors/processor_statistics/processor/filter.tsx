import React, { FC, useEffect, useState } from 'react'
import { Observer, observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  MoreSelectDataItem,
  Select,
  MoreSelect,
  ListDataItem,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'
import store, { Filter } from '../processor_store'
import { formatSkuListV2 } from '@/pages/sales_invoicing/util'
import globalStore from '@/stores/global'

interface Props {
  onSearch: () => any
}

const handleFilterChange = <T extends keyof Filter>(
  key: T,
  value: Filter[T],
) => {
  store.changeFilter(key, value)
}

const ProcessorFilter: FC<Props> = (props) => {
  const { onSearch } = props
  const [skuList, setSkuList] = useState<ListDataItem<string>[]>([])
  const { begin_time, end_time, time_type, sku_id } = store.filter
  const {
    stockData,
    fetchStockList,
    stockfilter: { processor_id },
  } = store
  useEffect(() => {
    fetchStockList()
  }, [])

  const filterData = [
    {
      type: 1,
      name: '按盘点周期',
      expand: false,
    },
  ]

  const handleMoreSelect = (
    select: MoreSelectDataItem<string>[],
    key: string,
  ) => {
    store.updateFilter(select, key)
  }

  const handleDateChange: DRFOnChange = (value) => {
    if (value.begin && value.end) {
      handleFilterChange('begin_time', value.begin)
      handleFilterChange('end_time', value.end)
    }
  }

  const handleGetSku = (value: string) => {
    store.fetchSkuList(value).then((json) => {
      const {
        response: { skus, category_map },
      } = json
      setSkuList(formatSkuListV2(skus, category_map))
      return json
    })
  }

  const handleSelectSku = (value: ListDataItem<string>) => {
    handleFilterChange('sku_id', value)
  }

  const handleExport = () => {
    store.export().then((json: any) => {
      globalStore.showTaskPanel('0')
      return json
    })
  }

  return (
    <BoxForm colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem>
          <DateRangeFilter
            data={filterData}
            value={{
              begin: begin_time,
              end: end_time,
              dateType: time_type,
            }}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        <FormItem label={t('盘点车间')}>
          <Observer>
            {() => {
              return (
                <Select
                  placeholder={t('请选择盘点车间')}
                  data={[...stockData]}
                  value={processor_id}
                  onChange={(value) => handleMoreSelect(value, 'processor_id')}
                />
              )
            }}
          </Observer>
        </FormItem>
        <FormItem label={t('搜索')} colWidth='400px'>
          <MoreSelect
            data={skuList}
            selected={sku_id}
            onSearch={handleGetSku}
            onSelect={handleSelectSku}
            placeholder={t('请输入商品编号或者名称')}
            renderListFilterType='pinyin'
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(ProcessorFilter)
