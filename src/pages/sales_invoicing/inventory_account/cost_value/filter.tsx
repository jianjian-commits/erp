import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  DateRangePicker,
  FormBlock,
  FormItem,
  Input,
  BoxFormMore,
  FormButton,
  Button,
  Select,
  Tip,
} from '@gm-pc/react'
import { CategoryFilter } from '@/common/components'

import store from './store'
import type { FilterType } from './store'
import globalStore from '@/stores/global'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface ChangeFilter {
  onSearch: () => any
}

export const IS_ACCOUNT_PEROID = [
  { value: 1, text: t('按周期') },
  { value: 2, text: t('按账期') },
]

const Filter: FC<ChangeFilter> = observer((props) => {
  const { onSearch } = props
  const {
    changeAccountPeroid,
    IsAccountPeroid,
    accountPeroidList,
    filter: { begin_time, end_time, q, warehouse_id },
  } = store

  const [accountValue, setAccountValue] = useState('')

  // 每次切换账期搜索条件置空
  useEffect(() => {
    IsAccountPeroid && setAccountValue('')
  }, [IsAccountPeroid])

  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    store.updateFilter(key, value)
  }

  const handleSubmit = () => {
    // 账期需要选择, 否则不请求
    if (IsAccountPeroid && !accountValue) {
      Tip.danger(t('请先选择账期'))
      return
    }

    onSearch()
  }

  const handleDateChange = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      handleFilterChange('begin_time', begin_time)
      handleFilterChange('end_time', end_time)
    }
  }

  // 按账期, 选择账期 并传开始时间, 结束时间
  const handleAccountPeroidChange = (value: any) => {
    setAccountValue(value)
    const { begin_time, end_time } = accountPeroidList.filter(
      (item) => item.fiscal_period_id === value,
    )[0]

    // 开始时间如果没有 从 2010 年开始
    handleFilterChange(
      'begin_time',
      new Date(begin_time === '0' ? '2010, 1, 1' : Number(begin_time)),
    )
    // “账期” 设计的时候 是左闭右开区间的, 所以需要减去 1
    handleFilterChange('end_time', new Date(Number(end_time) - 1))
  }

  const handleExport = (): void => {
    if (IsAccountPeroid && !accountValue) {
      Tip.danger(t('请先选择账期'))
      return
    }
    store.export().then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  return (
    <BoxForm labelWidth='90px' onSubmit={handleSubmit} colWidth='390px'>
      <FormBlock col={3}>
        <Select
          value={IsAccountPeroid ? 2 : 1}
          data={IS_ACCOUNT_PEROID}
          onChange={(value: number) => {
            changeAccountPeroid(value)
          }}
        />
        {!IsAccountPeroid ? (
          <FormItem label={t('选择周期')}>
            <DateRangePicker
              begin={begin_time}
              end={end_time}
              enabledTimeSelect
              onChange={handleDateChange}
            />
          </FormItem>
        ) : (
          <FormItem label={t('选择账期')}>
            <Select
              value={accountValue}
              data={accountPeroidList.map((item) => {
                return {
                  ...item,
                  value: item.fiscal_period_id,
                  text: item.name,
                }
              })}
              placeholder='请选择账期'
              onChange={handleAccountPeroidChange}
            />
          </FormItem>
        )}

        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('仓库')}>
            <Select_WareHouse_Default
              value={warehouse_id}
              onChange={(value) => handleFilterChange('warehouse_id', value)}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            placeholder={t('输入商品信息搜索')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('商品筛选')}>
            <CategoryFilter
              onChange={(e) => handleFilterChange('category_id', e)}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
