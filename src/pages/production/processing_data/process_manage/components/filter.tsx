import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer, Observer } from 'mobx-react'
import { BoxForm, FormItem, FormButton, Button, Input } from '@gm-pc/react'
import { Select_ProcessType } from 'gm_api/src/production/pc'
import {
  ExportProcessTemplate,
  ProcessType_Status,
} from 'gm_api/src/production'

import { Filter as FilterOptions } from '../interface'
import store from '../store'
import globalStore from '@/stores/global'

interface FilterProps {
  onSearch: () => Promise<any>
}

const Filter: FC<FilterProps> = observer(({ onSearch }) => {
  const handleChange = <T extends keyof FilterOptions>(
    key: T,
    value: FilterOptions[T],
  ) => {
    store.updateFilter(key, value)
  }

  const handleExport = () => {
    ExportProcessTemplate().then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  return (
    <BoxForm labelWidth='63px' onSubmit={onSearch}>
      <FormItem label={t('工序类型')}>
        <Observer>
          {() => {
            const { process_type_id } = store.filter
            return (
              <Select_ProcessType
                all={{ value: '0', text: t('全部') }}
                value={process_type_id}
                onChange={(value) => handleChange('process_type_id', value)}
                getName={(item) =>
                  +(item.status || 0) & ProcessType_Status.STATUS_DEFAULT
                    ? t('未分类')
                    : item.name
                }
              />
            )
          }}
        </Observer>
      </FormItem>
      <FormItem label={t('搜索')}>
        <Observer>
          {() => {
            const { search_text } = store.filter

            return (
              <Input
                placeholder={t('输入工序名称或编号')}
                value={search_text}
                onChange={(e) => handleChange('search_text', e.target.value)}
              />
            )
          }}
        </Observer>
      </FormItem>
      <FormButton>
        <Button type='primary' htmlType='submit' className='gm-margin-right-10'>
          {t('搜索')}
        </Button>
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
