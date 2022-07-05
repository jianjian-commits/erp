import React, { FC } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  ControlledFormItem,
  FormButton,
  FormBlock,
  Flex,
  DateRangePicker,
  Input,
  Button,
  Select,
} from '@gm-pc/react'
import { Observer, observer } from 'mobx-react'
import SupplierSelector from '../../../components/supplier_selector'
import store from '../store'
import CategoryFilter from '@/common/components/category_filter'

import type { MoreSelectDataItem } from '@gm-pc/react'
import type { F } from '../store'
import { list_InquiryPrice_SourceType } from 'gm_api/src/purchase'
// import CategoryPinleiFilter from '@/common/components/category_filter_hoc'

interface FilterProps {
  onSearch: () => Promise<any>
}

// const sourceType = list_InquiryPrice_SourceType.filter((v) => {
//   return [256, 2048].includes(v.value)
// })
const sourceType = [
  { value: 1, text: '采购小程序' },
  { value: 2, text: '后台录入' },
]

const Filter: FC<FilterProps> = (props) => {
  function handleSearch() {
    props.onSearch()
  }
  function handelChangeFilter<T extends keyof F>(key: T, value: F[T]) {
    store.updateFilter(key, value)
  }
  function handleChangeRangePick(begin: Date, end: Date) {
    handelChangeFilter('begin', begin)
    handelChangeFilter('end', end)
  }

  function handleReset() {
    store.initFilter()
  }

  return (
    <BoxForm labelWidth='74px' colWidth='385px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        <ControlledFormItem label={t('按询价时间')}>
          <Observer>
            {() => (
              <DateRangePicker
                begin={store.filter.begin}
                end={store.filter.end}
                onChange={handleChangeRangePick}
                enabledTimeSelect
              />
            )}
          </Observer>
        </ControlledFormItem>
        <ControlledFormItem label={t('搜索')}>
          <Flex justifyStart alignCenter>
            <Observer>
              {() => (
                <Input
                  type='text'
                  placeholder={t('请输入商品名，商品编码搜索')}
                  value={store.filter.q}
                  onChange={(e) => handelChangeFilter('q', e.target.value)}
                />
              )}
            </Observer>
          </Flex>
        </ControlledFormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <ControlledFormItem label={t('供应商')}>
            <Observer>
              {() => (
                <SupplierSelector
                  selected={store.filter.suppliers}
                  onSelect={(v?: MoreSelectDataItem<string>[]) => {
                    handelChangeFilter('suppliers', v)
                  }}
                />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('商品分类')} col={1}>
            <Observer>
              {() => (
                <CategoryFilter
                  style={{ width: '270px' }}
                  multiple
                  onChange={(value) =>
                    handelChangeFilter('category_ids', value)
                  }
                />
                // <CategoryPinleiFilter
                //   selected={store.filter.category_ids}
                //   onChange={(value) =>
                //     handelChangeFilter('category_ids', value)
                //   }
                // />
              )}
            </Observer>
          </ControlledFormItem>
          <ControlledFormItem label={t('询价来源')}>
            <Observer>
              {() => (
                <Select
                  value={store.filter.source_type}
                  data={[{ value: 0, text: t('全部来源') }, ...sourceType]}
                  onChange={handelChangeFilter.bind(null, 'source_type')}
                />
              )}
            </Observer>
          </ControlledFormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <BoxFormMore>
          <Button className='gm-margin-left-10' onClick={handleReset}>
            {t('重置')}
          </Button>
        </BoxFormMore>
      </FormButton>
    </BoxForm>
  )
}
export default observer(Filter)
