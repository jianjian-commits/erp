import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Select,
  Input,
  MoreSelect,
  DateRangePicker,
  Flex,
  RightSideModal,
  // @ts-ignore
  MoreSelectDataItem,
} from '@gm-pc/react'
import store from '../store'
import { FilterComProps } from '../../interface'
import ClassFilter from '@/common/components/class_filter'
import {
  studentListSearchType,
  groupMealStates,
  staffListSearchType,
} from '../../../enum'
import _ from 'lodash'
import { Customer_Type } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'

const Filter: FC<FilterComProps> = observer(({ onSearch }) => {
  const {
    filter: {
      begin,
      end,
      state,
      search_text,
      menu_period_group_id,
      search_type,
    },
    customer_type,
    menuPeriodList,
  } = store
  const isStudent = customer_type === Customer_Type.TYPE_VIRTUAL_STUDENT
  const target = _.find(
    isStudent ? studentListSearchType : staffListSearchType,
    (v) => v.value === search_type,
  )
  const menuPeriods = _.concat(
    [{ value: '', text: t('全部餐次'), menu_period_group_id: '', name: '' }],
    menuPeriodList.slice(),
  )
  const menuPeriodSelected = _.find(
    menuPeriods,
    (v) => v.value === menu_period_group_id,
  )

  const handleDateChange = (begin: Date, end: Date) => {
    if (begin && end) {
      store.changeFilter('begin', begin)
      store.changeFilter('end', end)
    }
  }

  const handleExport = () => {
    store.export().then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  useEffect(() => {
    store.getServicePeriodList()
    return () => {
      store.clearFilter()
    }
  }, [])

  return (
    <BoxForm labelWidth='90px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('按收货日期')} colWidth='385px'>
          <DateRangePicker
            begin={begin}
            end={end}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        <FormItem col={1}>
          <Flex>
            <div className='gm-padding-right-5' style={{ minWidth: 90 }}>
              <Select
                clean
                data={isStudent ? studentListSearchType : staffListSearchType}
                value={search_type}
                onChange={(value: any) =>
                  store.changeFilter('search_type', value)
                }
              />
            </div>
            <Flex flex>
              <Input
                className='form-control'
                value={search_text}
                onChange={(e) =>
                  store.changeFilter('search_text', e.target.value)
                }
                placeholder={target?.desc}
              />
            </Flex>
          </Flex>
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('班级筛选')}>
            <Observer>
              {() => {
                const { school_ids, class_ids } = store.filter
                return (
                  <ClassFilter
                    selected={{ school_ids, class_ids }}
                    onChange={(value) => {
                      const { school_ids, class_ids } = value
                      store.changeFilter('class_ids', class_ids)
                      store.changeFilter('school_ids', school_ids)
                    }}
                  />
                )
              }}
            </Observer>
          </FormItem>
          <FormItem label={t('餐次')}>
            <MoreSelect
              selected={menuPeriodSelected}
              data={menuPeriods}
              onSelect={(selected: MoreSelectDataItem<string>) => {
                store.changeFilter('menu_period_group_id', selected?.value!)
              }}
            />
          </FormItem>
          <FormItem label={t('状态')}>
            <Select
              data={groupMealStates}
              value={state}
              onChange={(value: any) => store.changeFilter('state', value)}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <Button onClick={handleExport} className='gm-margin-left-10'>
          {t('导出')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
