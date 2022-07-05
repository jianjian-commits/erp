import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  FormBlock,
  BoxFormMore,
  BoxForm,
  FormButton,
  FormItem,
} from '@gm-pc/react'
import { DatePicker, Form, Input, Button, Select } from 'antd'
import { TERM_OPTIONS_TYPE, SELECT_SCHOOL_TYPE } from '../../../enum'
import store from '../store/listStore'
import detailStore from '../store/detailStore'
import globalStore from '@/stores/global'

interface FilterProps {
  onSearch: () => Promise<any>
}

const Filter: FC<FilterProps> = ({ onSearch }) => {
  const { year, school_type, semester_type, menu_period_group_id, q } =
    store.filter

  const { mealTimesInfo } = detailStore

  const handleExport = () => {
    store.exportBudget().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  useEffect(() => {
    return () => {
      store.reSetFilter()
    }
  }, [])

  return (
    <BoxForm labelWidth='100px' colWidth='320px' inline onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('日期')} className='gm-text-14'>
          <DatePicker
            picker='year'
            value={year}
            onChange={(date) => {
              store.updateFilter('year', date)
            }}
            allowClear={false}
            style={{ width: '100%' }}
          />
        </FormItem>
        <FormItem label={t('学期')} className='gm-text-14'>
          <Select
            options={TERM_OPTIONS_TYPE}
            defaultValue={semester_type}
            value={semester_type}
            style={{ width: '100%' }}
            onChange={(value) => {
              store.updateFilter('semester_type', value)
            }}
          />
        </FormItem>
        <FormItem label={t('搜索')} className='gm-text-14'>
          <Input
            className='gm-inline-block form-control'
            placeholder={t('请输入客户名称、编码搜索')}
            value={q}
            onChange={(e) => {
              store.updateFilter('q', e.target.value)
            }}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={2}>
          <FormItem label={t('学校类型')} className='gm-text-14'>
            <Select
              options={SELECT_SCHOOL_TYPE}
              defaultValue={school_type}
              value={school_type}
              style={{ width: '100%' }}
              onChange={(value) => {
                store.updateFilter('school_type', value)
              }}
            />
          </FormItem>
          <FormItem label={t('餐次')} className='gm-text-14'>
            <Select
              options={mealTimesInfo}
              defaultValue={menu_period_group_id}
              value={menu_period_group_id}
              style={{ width: '100%' }}
              onChange={(value) => {
                store.updateFilter('menu_period_group_id', value)
              }}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <Button
          className='gm-margin-left-5'
          onClick={() => {
            store.reSetFilter()
          }}
        >
          {t('重置')}
        </Button>
        <Button className='gm-margin-left-5' onClick={handleExport}>
          {t('导出')}
        </Button>
      </FormButton>
    </BoxForm>
  )
}

export default observer(Filter)
